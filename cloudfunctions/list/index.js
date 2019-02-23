// 云函数模板
// 部署：在 cloud-functions/login 文件夹右击选择 “上传并部署”

const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init()

//获取数据库连接
const db = cloud.database()

/**
 * 这个示例将经自动鉴权过的小程序用户 openid 返回给小程序端
 * 
 * event 参数包含小程序端调用传入的 data
 * 
 */
exports.main = (event, context) => {
  console.log(event)
  console.log(context)
  let categoryType = 1
  if (event.categoryType){
    categoryType = event.categoryType
  }
  console.log('get list start: ', categoryType)
  // 查询当前用户所有的 counters
  return db.collection('top-site').where({
    categoryType: categoryType
  }).limit(14).get({
    success: res => {
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