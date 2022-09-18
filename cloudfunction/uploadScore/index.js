// 云函数入口文件
const cloud = require('wx-server-sdk')

// 与小程序端一致，均需调用 init 方法初始化
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 可在入口函数外缓存 db 对象
const db = cloud.database()

// 数据库查询更新指令对象
// const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {

  // 以 openid-score 作为记录 id
  const docId = `${event.userInfo.openId}`;//-score
  const _ = db.command;
  const updateResult = await db.collection('user').doc(docId).update({
    data: {
      score: _.max(event.score),
      count: _.max(event.count)
    }
  })

  if (updateResult.stats.updated === 0) {
    // 没有更新成功，更新数为 0
    return {
      success: false
    }
  }

  return {
    success: true
  }
}
