var QQMapWX = require('../../sdk/qqmap-wx-jssdk.min.js');

function checkPhone(text) {
  return text.match(/((((13[0-9])|(15[^4])|(18[0,1,2,3,5-9])|(17[0-8])|(147))\d{8})|((\d3,4|\d{3,4}-|\s)?\d{7,14}))?/g);
}
var content = '';
Page({
  data: {
    deleteFlag: false,
    popFlag: false,
    userId: "",
    siteId: "",
    allNoneFlage: false,
    travelId: '',
    userTravelId: '',
    destName: "",
    longitude: '',
    latitude: '',
    tipFlage: false,
    jh: false,
    otherList: [{
      name: "想去",
      class: "want",
      select: false
    }, {
      name: "去过",
      class: "been",
      select: false
    }],
    scenicDataList: [],
    want: '',
    been: '',
    routerList: [],
    noteList: [], //游记入口
    noteImage: '',
    hasNextPage: true,
    essentialMsg: [{
      type: "situation",
      name: "景点概况",
      cot: "",
      down: false,
      height: ""
    }, {
      type: "address",
      name: "景点地址",
      cot: "",
      down: false,
      height: ""
    }, {
      type: "traffic",
      name: "周边交通",
      cot: "",
      down: false,
      height: ""
    }, {
      type: "time",
      name: "开放时间",
      cot: "",
      down: false,
      height: ""
    }, {
      type: "ticket",
      name: "景点门票",
      cot: "",
      down: false,
      height: ""
    }, {
      type: "phone",
      name: "联系电话",
      cot: "",
      down: false,
      height: ""
    }, {
      type: "url",
      name: "网址信息",
      cot: "",
      down: false,
      height: ""
    }],
    nowList: [true, true, true, true, true, true, true],
    toastRoutesList: false,
    screenHeight: '',
    animationData: {},
    allTours: [],
    tourPageNo: 1,
    tourHasNextPage: true
  },
  onLoad: function(data) {
    console.log("onLoad data:", data)
    this.data.siteId = data.siteId;
    var _this = this;
    this.scenicDetailData(data.siteId);
    this.SystemInfoSync();
  },
  scenicDetailData: function(siteId) {
    var _this = this;
    wx.cloud.callFunction({
      name: 'detail',
      data: {
        siteId: siteId,
      },
      success: res => {
        console.log("res:", res)
        _this.setData({
          scenicDataList: res.result.data[0],
          longitude: res.result.data[0].longitude,
          latitude: res.result.data[0].latitude,
          ["essentialMsg[0].cot"]: res.result.data[0].survey || "",
          ["essentialMsg[1].cot"]: res.result.data[0].address || "",
          ["essentialMsg[2].cot"]: res.result.data[0].traffic || "",
          ["essentialMsg[3].cot"]: res.result.data[0].businessHours || "",
          ["essentialMsg[4].cot"]: res.result.data[0].ticketPrice || "",
          ["essentialMsg[5].cot"]: res.result.data[0].tel || "",
          ["essentialMsg[6].cot"]: res.result.data[0].website || ""
        })
        _this.contentHeight();
        if (res.result.data[0].tips) {
          _this.contentHeight1();
        }
      },
      fail: function(err) {

      }
    });
  },

  loadList: function() {
    if (this.data.tourHasNextPage) {
      this.getMyItineraryTour();
    }
  },

  contentHeight1: function() {
    var _this = this;
    var nowList_n = [];
    wx.createSelectorQuery().select('.tips').boundingClientRect(function(res) {
      if (res.height > 100) {

        _this.setData({
          tipFlage: true,
          jh: true
        })
      }
    }).exec()
  },
  moreTips: function(e) {
    if (this.data.jh) {
      this.setData({
        tipFlage: !this.data.tipFlage
      })
    }
  },
  contentHeight: function() {
    var _this = this;
    var nowList_n = [];
    wx.createSelectorQuery().selectAll('.cot').boundingClientRect(function(rects) {
      rects.forEach(function(rect, index) {
        _this.setData({
          ["essentialMsg[" + index + "].height"]: rect.height,
        })
        if (rect.height == 0) {
          _this.setData({
            ["essentialMsg[" + index + "].down"]: false,
          })
          nowList_n.push(false)
        } else if (rect.height > 40) {
          _this.setData({
            ["essentialMsg[" + index + "].down"]: true,
          })
          nowList_n.push(true)
        } else {
          _this.setData({
            ["essentialMsg[" + index + "].down"]: false,
          })
          nowList_n.push(true)
        }
      })
      _this.setData({
        nowList: []
      })
      _this.setData({
        nowList: nowList_n
      })
    }).exec()
  },
  moreContent: function(e) {
    var index = e.currentTarget.dataset['index'];
    var that = this;
    if (this.data.essentialMsg[index].type == 'phone') {
      content = that.data.essentialMsg[index].cot;
      that.click();
      that.setData({
        popFlag: true,
      })
    }
    if (this.data.essentialMsg[index].type == 'address') {
      var key = new QQMapWX({
        key: 'G2ZBZ-7ARHF-JEKJI-NIBFU-KTK5S-TUFGM'
      });
      // 调用接口
      key.reverseGeocoder({
        location: {
          latitude: that.data.latitude,
          longitude: that.data.longitude
        },
        coord_type: 3, //baidu经纬度
        success: function(res) {
          wx.openLocation({
            latitude: res.result.location.lat,
            longitude: res.result.location.lng,
            name: that.data.scenicDataList.scenicName,
            address: that.data.essentialMsg[index].cot,
            scale: 16
          })
        }
      });
    }
    if (this.data.essentialMsg[index].height <= 40) {
      return
    }
    if (this.data.essentialMsg[index].down) {
      this.setData({
        ["essentialMsg[" + index + "].down"]: false
      })
    } else {
      this.setData({
        ["essentialMsg[" + index + "].down"]: true
      })
    }

  },
  phoneCall: function(e) {
    const self = this;
    if (e.currentTarget.id === 'N') {
      self.setData({
        popFlag: false
      })
    } else {
      this.setData({
        popFlag: false,
      })
      self.callPhone()
    }
  },
  callPhone: function() {
    var that = this;
    wx.makePhoneCall({
      phoneNumber: that.data.phoneNum
    })
  },

  SystemInfoSync: function() {
    const self = this;
    wx.getSystemInfo({
      success: function(res) {
        self.setData({
          screenHeight: res.windowHeight - 100
        })
      },
      fail: function(e) {
        console.log(e)
      }
    })
  },
  click: function(e) {
    var phone = content
    var phone_list = checkPhone(phone)
    var yse_phone = []
    for (var i = 0; i < phone_list.length; i++) {
      if (phone_list[i].length > 6) {
        yse_phone.push(phone_list[i])
      }
    }
    this.setData({
      phoneNum: yse_phone[0]
    })
  },
  onShareAppMessage: function() {
    return {
      title: 'Shanghai TOP 10',
      desc: '详情信息',
      path: "pages/detail/detail?siteId=" + this.data.siteId
    }
  },
})