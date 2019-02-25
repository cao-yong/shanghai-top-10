// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

//获取数据库连接
const db = cloud.database()

// 云函数入口函数
exports.main = async(event, context) => {
  console.log(event)
  console.log(context)
  console.log('get detail start siteId: ', event.siteId)
  // 查询当前用户所有的 counters
  return db.collection('site-detail').where({
    siteId: event.siteId * 1
  }).get({
    success: res => {
      console.log("detail res:", res)
      this.setData({
        queryResult: JSON.stringify(res.data, null, 2)
      })
      console.log('[数据库] [查询记录] 成功: ', res)
    },
    fail: err => {
      wx.showToast({
        icon: 'none',
        title: '查询记录失败'
      })
      console.error('[数据库] [查询记录] 失败：', err)
    }
  })
}