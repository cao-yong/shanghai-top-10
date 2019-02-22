//home.js
const app = getApp();

Page({
  data: {
    background: ['demo-text-1', 'demo-text-2', 'demo-text-3'],
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
    selectedItem: 1,
    latitude: '',
    longitude: '',
    cityData: {},
    cityName: '',
    now_cityName: '',
    destId: '',
    now_destId: '',
    limit: 10,
    pageNo: 1,
    spotList: [],
    noRecommendScen: false,
    autoLocation: true,
    countryFlag: false,
    countryName: '',
    hasNextPage: true,
    contanerShow: false,
    banner: ["../../images/banner.png"]
  },
  onLoad: function () { },
  // 生命周期函数--监听页面显示
  onShow: function () {
    const _this = this;
    _this.setData({
      noRecommendScen: false
    });

  },
  //
  gitCityInfo: function (cityName) {
    const _this = this;
    initLoading.showLoading();
    requestWrap.request({
      url: requestWrap.getUrl().getDestCity,
      method: 'GET',
      data: {
        cityName: cityName
      },
      success: function (res) {
        if (res.data.code == '200') {
          _this.setData({
            cityData: res.data.data[0],
            destId: res.data.data[0].destId,
            now_destId: res.data.data[0].destId,
          })
          wx.setStorageSync('cityData', res.data.data[0])
          _this.getDestByCity();
        }
        initLoading.hideLoading();
      },
      fail: function (err) {

      }
    });
  },
  getDestByCity: function () {
    const _this = this;
    let spotList = _this.data.spotList;
    let pageNo = _this.data.pageNo;
    let hasNextPage = _this.data.hasNextPage;
    initLoading.showLoading();
    if (hasNextPage) {
      requestWrap.request({
        url: requestWrap.getUrl().getDestByCity,
        method: 'GET',
        data: {
          longitude: _this.data.longitude,
          latitude: _this.data.latitude,
          destId: _this.data.now_destId,
          limit: 10,
          pageNo: _this.data.pageNo,
          autoLocation: _this.data.autoLocation
        },
        success: function (res) {
          if (res.data.code == '200') {
            if (res.data.msg == 'country') {
              _this.setData({
                countryFlag: true,
                countryName: '全国',
                contanerShow: true
              })
            }
            if (res.data.data && res.data.data.list) {
              _this.setData({
                spotList: spotList.concat(res.data.data.list),
                hasNextPage: res.data.data.hasNextPage,
                pageNo: pageNo + 1,
                contanerShow: true
              })
            }
          }

          if (_this.data.spotList.length === 0) {
            _this.setData({
              noRecommendScen: true
            });
          } else {
            _this.setData({
              noRecommendScen: false
            });
          }

          initLoading.hideLoading();
        },
        fail: function (err) {
          initLoading.hideLoading();
          console.log(err)
        }
      });
    }

  },
  loadList: function () {
    if (this.data.hasNextPage) {
      this.getDestByCity();
    }
  },
  onReachBottom: function () {
    if (this.data.hasNextPage) {
      this.getDestByCity();
    }
  },
  cityList: function () {
    wx.navigateTo({
      url: '../pickCity/pickCity'
    })
  },
  goSpot: function (e) {
    wx.navigateTo({
      url: '../scenicNum/scenicNum?scenicNo=' + e.currentTarget.dataset.id,
    })
  },
  //底部tab点击事件
  footerSelect(e) {
    this.setData({
      selectedItem: e.currentTarget.dataset.index
    });
  }
})