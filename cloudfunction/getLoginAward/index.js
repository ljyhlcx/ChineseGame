// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 可在入口函数外缓存 db 对象
const db = cloud.database()

// 数据库查询更新指令对象
const _ = db.command

// 云函数入口函数
exports.main = async(event, context) => {
  const docId = `${event.userInfo.openId}`;
  //更新已领取标识
  try {
    const querResult = await db.collection('user').doc(docId).field({
      getLoginAward: true
    }).get();
    let isGet = querResult.data.getLoginAward;
    if (isGet) {
      return {
        success: false
      }
    }
    await db.collection('user').doc(docId).update({
      data: {
        getLoginAward: 1
      }
    })
  } catch (e) {
    console.log(e)
  }
  //没有道具记录就新增
  var list = event.updateList;
  if (list && list.length > 0) {
    var propList;
    try {
      propList = await db.collection('props').doc(docId).get();
    } catch (e) {
      var updateObj = {
        _id: docId,
        _openid: docId
      };
      for (var i = list.length - 1; i >= 0; i--) {
        updateObj[list[i][0] + ""] = list[i][1];
      }
      try {
        await db.collection('props').add({
          data: updateObj
        })
      } catch (e) {
        console.log(e);
      }
      return {
        success: true,
        type: "add"
      }
    }
    console.log(JSON.stringify(propList), JSON.stringify(list));
    //有道具记录就做更新
    var updateObj = {};
    for (var i = list.length - 1; i >= 0; i--) {
      updateObj[list[i][0] + ""] = _.inc(list[i][1]);
    }
    try {
      await db.collection('props').doc(docId).update({
        data: updateObj
      })
    } catch (e) {
      console.log(e)
    }
  }
  return {
    success: true
  }
}