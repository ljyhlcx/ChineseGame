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
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const docId = wxContext.OPENID;
  let inviteList;
  try {
    const querResult = await db.collection('user').doc(docId).get()
    inviteList = querResult.data.inviteList;
  } catch (err) {
    console.log(err);
  }
  // console.log(inviteList.length + "///sssss");
  if (inviteList && inviteList.length) {
    const ranklist = await db.collection("user").where({
      _id: _.in(inviteList)
    }).field({
      _id: true,
      name: true,
      score: true,
      headUrl: true
    }).orderBy("score", 'desc').get()
    // console.log(JSON.stringify(ranklist));
    return {
      success: true,
      record: ranklist.data
    }
  } else {
    return {
      success: false
    }
  }
}