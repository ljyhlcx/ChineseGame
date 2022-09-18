// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

// 数据库查询更新指令对象
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  const sid = `${event.key}`;
  console.log("查询sid:" + sid);
  const querResult = await db.collection('rank').doc(sid).get()
  let rankRecord = querResult.data
  return rankRecord
}