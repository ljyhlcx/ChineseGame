// 云函数模板
// 部署：在 cloud-functions/login 文件夹右击选择 “上传并部署”

const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
// 数据库查询更新指令对象
const _ = db.command

/**
 * 这个示例将经自动鉴权过的小程序用户 openid 返回给小程序端
 * 
 * event 参数包含小程序端调用传入的 data
 * 
 */
exports.main = async(event, context) => {
  console.log(event)
  // console.log(context)

  // 可执行其他自定义逻辑
  // console.log 的内容可以在云开发云函数调用日志查看

  // 获取 WX Context (微信调用上下文)，包括 OPENID、APPID、及 UNIONID（需满足 UNIONID 获取条件）等信息
  const wxContext = cloud.getWXContext()
  const docId = wxContext.OPENID;
  let userRecord;
  try {
    const querResult = await db.collection('user').doc(docId).get()
    userRecord = querResult.data
  } catch (err) {
    console.log(err);
  }
  if (userRecord) { //老玩家
    var updateObj = {};
    var nowTime = new Date();
    if (event.name != undefined) {
      if (event.name && (event.name != userRecord.name || event.headUrl != userRecord.headUrl)) {
        userRecord.headUrl = event.headUrl;
        userRecord.name = event.name;
        updateObj.name = event.name;
        updateObj.headUrl = event.headUrl;
        console.log("更新了名字");
      }
    }
    var lastLoginTime = new Date(userRecord.updateTime);
    if (lastLoginTime.getDate() != nowTime.getDate() || lastLoginTime.getMonth() != nowTime.getMonth() || lastLoginTime.getFullYear() != nowTime.getFullYear()) { //跨天登录了
      userRecord.getVipAward = 0;
      userRecord.getLoginAward = 0;
      if (userRecord.loginDays)
        userRecord.loginDays++;
      else
        userRecord.loginDays = 1;
      updateObj.getLoginAward = 0;
      updateObj.getVipAward = 0;
      updateObj.loginDays = _.inc(1);
    }
    try {
      updateObj.updateTime = nowTime;
      await db.collection('user').doc(docId).update({
        data: updateObj
      })
    } catch (err) {
      console.log(err);
    }
    userRecord.share = userRecord.inviteList.length;
  } else { // 新玩家
    await db.collection('user').add({
      // data 是将要被插入到 score 集合的 JSON 对象
      data: {
        // 这里指定了 _id，如果不指定，数据库会默认生成一个
        _id: docId, //docId,
        // 这里指定了 _openid，因在云函数端创建的记录不会默认插入用户 openid，如果是在小程序端创建的记录，会默认插入 _openid 字段
        _openid: docId,
        name: event.name,
        headUrl: event.headUrl,
        loginDays: 1,
        updateTime: new Date()
      }
    })
    userRecord = {
      _openid: docId
    };
    userRecord.create = true;
    console.log("新建用户:" + event.name, "分享者:" + event.shareAccount);
    if (event.shareAccount) {
      try {
        const querResult = await db.collection('user').doc(event.shareAccount).field({
          inviteList: true
        }).get();
        let allSharer = querResult.data.inviteList;
        // console.log(querResult, allSharer);
        if (!allSharer) {
          allSharer = [];
          allSharer.push(docId);
        } else if (allSharer.indexOf(docId) < 0) {
          allSharer.push(docId)
        }

        await db.collection('user').doc(event.shareAccount).update({
          data: {
            inviteList: allSharer
          }
        })
      } catch (err) {
        console.log("更新分享者失败" + err);
      }
      console.log("save shareAccount success");
    }
  }
  return userRecord;
}