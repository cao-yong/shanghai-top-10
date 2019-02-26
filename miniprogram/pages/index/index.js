//index.js
var initLoading = require('../../sdk/methodUtil.js');

const app = getApp();

Page({
  data: {
    indicatorDots: true,
    vertical: false,
    imgUrl: app.globalData.imgUrl,
    autoplay: true,
    //是否采用衔接滑动
    circular: false,
    //自动切换时间间隔
    interval: 2000,
    //滑动动画时长
    duration: 500,
    previousMargin: 0,
    nextMargin: 0,
    spotList: [],
    banner: ["../../images/banner.png"],
    hotType: ['景点', '商圈', '小吃街', '酒店', '夜店'],
    curHotTypeIndex: 0
  },
  onLoad: function() {},
  // 生命周期函数--监听页面显示
  onShow: function() {
    const _this = this;
    _this.getList(_this.data.curHotTypeIndex + 1);

  },
  //选择热门类型事件
  selectHotType(e) {
    const _this = this;
    let index = e.target.dataset.index
    this.setData({
      curHotTypeIndex: index
    })
    _this.getList(index + 1)
  },
  getList: function(categoryType) {
    initLoading.showLoading();
    console.log("getList start")
    const _this = this;
    // 调用云函数
    wx.cloud.callFunction({
      name: 'list',
      data: {
        categoryType: categoryType
      },
      success: res => {
        console.log('[云函数] [list] user openid: ', res)
        _this.setData({
          spotList: res.result.data
        })
        initLoading.hideLoading();
      },
      fail: err => {
        console.error('[云函数] [list] 调用失败', err)
      }
    })

  },
  //去详情页
  goDetail: function(e) {
    wx.navigateTo({
      url: '../detail/detail?siteId=' + e.currentTarget.dataset.id,
    })
  },
  //设置分享
  onShareAppMessage: (res) => {
    return {
      path: '/pages/index/index',
    }
  }
})