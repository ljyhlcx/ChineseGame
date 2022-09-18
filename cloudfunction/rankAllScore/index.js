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
exports.main = async () => {
  const ranklist = await db.collection("user").aggregate()
    .sort({
      score: -1
    }).project({
      _id: 1,
      name:1,
      count:1,
      score:1,
      headUrl:1
    })
    .limit(50)
    .end()
  // 记录 id
  const docId = "0_4";
  const updateResult = await db.collection('rank').doc(docId).update({
    data: {
      record: _.set(ranklist.list),
      updateTime:new Date()
    }
  })
  console.log("updateStat:" + updateResult.stats.updated);
  if (updateResult.stats.updated === 0) {
    // 没有更新成功，更新数为 0
    return {
      success: false
    }
  }
  return {
    success: true,
    updated: true
  }
}