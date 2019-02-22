/**
 * citypicker.js
 * 
 * import html:
 * <import src="citypicker.wxml"/>
 * <template is="citypicker" wx:if="{{condition}}" data="{{...cityData}}"/>
 * 
 * import css:
 * @import './citypicker.wxss'
 * 
 * import js:
 * var citypicker = require('./citypicker/citypicker.js');
 * 
 * //初始化
 * citypicker.init(this, opts = {callback,...});//callback:点击事件
 * 
 * cityData : {
      hotList : [],
      histList : [],
      cityList : [],
      citySearchList : [],
      cityTitleList : [],
      cityAnchorList : [],
      cityTitleClassObj : {},
      currCity : {},
      letterTipClass : '',
      tip : '',
      hasHist : false,
      hasHot : false,
      hasCur : false,
      onscroll : true,
      toView: ''
    },
 * 
 * //数据处理
 * citypicker.resolve(this, res.data);
 * 
 */
var QQMapWX = require('../../sdk/qqmap-wx-jssdk.min.js');
var app = getApp();
var timeout;
var version = '2.0'; //二期改为2.0
function init(_this, opts = {}) {

    _this.toggleCityTitleClass = function toggleCityTitleClass(e, scrollView) {
        var title = this.getTitle(e),
            cityData = this.data.cityData,
            obj = cityData.cityTitleClassObj;

        if (scrollView) {
            cityData.toView = title + '_actTitle';
            cityData.letterTipClass = 'letterTipShow';

            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(function () {
                cityData.letterTipClass = 'letterTipHide';
                _this.setData({
                    cityData: cityData
                });
            }, 1000);
            cityData.tip = title;
        } else {
            obj[title] = obj[title] ? '' : 'sc-letter-list-close';
        }
        this.setData({
            cityData: cityData
        });
    };

    _this.selectCity = function selectCity(e) {
        console.log(e.target.dataset);
        var data = e.target.dataset,
            cityData = this.data.cityData,
            histList = cityData.histList,
            cityAnchorList = cityData.cityAnchorList,
            cityInfo = {
                name: data.name,
                pinyin: data.pinyin,
                id: data.id,
                code: data.code
            };

        if (version == '2.0') {
            updateHistory(cityData, histList, cityInfo, cityAnchorList);
        }

        this.setData({
            cityData: cityData
        });

        if (typeof opts.callback == 'function') {
            opts.callback(cityInfo);
        }
    };

    _this.bindKeyInput = function bindKeyInput(e) {
        var value = e.detail.value,
            cityData = this.data.cityData,
            cityList = cityData.cityList,
            citySearchList = [];

        if (value.length) {
            cityData.onscroll = false;
            var matchREG = new RegExp(value, 'g');
            cityList.forEach(function (cityArr) {
                cityArr.forEach(function (city) {

                    if (matchREG.test(city.pinyin) || matchREG.test(city.name)) {
                        return citySearchList[citySearchList.length] = city;
                    }
                });
            });
            cityData.citySearchList = citySearchList;
        } else {
            cityData.onscroll = true;
            cityData.citySearchList = [];
        }
        this.setData({
            cityData: cityData
        });
    };

    _this.anchorTouchend = function anchorTouchend(e) {
        this.toggleCityTitleClass(e, true);
    };
};

function resolve(_this, dataArr) {
    var cityData = _this.data.cityData,
        titleList = cityData.cityTitleList,
        cityAnchorList = cityData.cityAnchorList,
        cityTitleClassObj = cityData.cityTitleClassObj,
        cityObj = {},
        cityList = [],
        hotList = [];

    dataArr.forEach(function (c) {
        if (!c.isStation) {
            var firstLetter = c.pinyin[0].toUpperCase();
            c.name = c.destName;
            c.code = c.shortPinyin;

            if (titleList.indexOf(firstLetter) == -1) {
                titleList[titleList.length] = firstLetter;
                cityAnchorList[cityAnchorList.length] = firstLetter;
                cityObj[firstLetter] = [c];
                cityTitleClassObj[firstLetter] = '';
            } else {
                cityObj[firstLetter].push(c);
            }
            if (c.hot === true) {
                hotList.push(c);
            }
        }
    });

    titleList.sort().forEach(function (c) {
        cityList.push(cityObj[c]);
    });
    cityAnchorList.sort();
    cityTitleClassObj[titleList[0]] = '';
    cityData.cityList = cityList;

    if (version == '2.0') {
        getHot(cityData, hotList, cityAnchorList);
        getHistory(cityData, cityAnchorList);
        geoLocate(_this, cityData, cityAnchorList);
        // var city = wx.getStorageSync('cityData');
        // cityData.currCity = {
        //     name : city.destName,
        //     code: city.shortPinyin,
        //     id : city.destId,
        //     pinyin : city.pinyin
        // };
        // cityData.hasCur = true;
        // console.log(cityData);
        // _this.setData({cityData : cityData});
    } else {
        _this.setData({
            cityData: cityData
        });
    }

};

function getHot(data, hotList, anchorList) {
    data.hotList = hotList;
    data.hasHot = !!data.hotList.length;

    if (data.hasHot) {
        // anchorList.unshift('热门');
    }
};

function updateHistory(cityData, histList, cityInfo, anchorList) {
    var list = histList.filter(function (hist) {
        return hist.name != cityInfo.name;
    });

    list.unshift(cityInfo);

    // if (anchorList.indexOf('历史') == -1) {
    //     anchorList.unshift('历史');
    // }

    if (list.length > 8) {
        list.pop();
    }

    console.log(list);
    cityData.hasHist = true;
    cityData.histList = list;

    wx.setStorage({
        key: "city_histList",
        data: list
    });
};

function getHistory(data, anchorList) {
    wx.getStorage({
        key: "city_histList",
        success: function (res) {
            console.log(res.data);
            if (!res.data.length) {
                data.hasHist = false;
            } else {
                data.hasHist = true;
                data.histList = res.data;
                // anchorList.unshift('历史');
            }
        },
        fail: function (err) {
            data.hasHist = false;
        }
    });
};

function geoLocate(inst, cityData, list) {
    wx.getLocation({
        type: 'gcj02', //返回可以用于wx.openLocation的经纬度
        success: function (res) {
            var latitude = res.latitude;
            var longitude = res.longitude;
            wx.setStorageSync('aroundShowFlag', true)
            var key = new QQMapWX({
                key: 'PR2BZ-ZTL3K-C27JJ-AUHSC-4XAE6-QPBRQ'
            });
            key.reverseGeocoder({
                location: {
                    latitude: res.latitude,
                    longitude: res.longitude
                },
                coord_type: 5,
                success: function (res) {
                    const cityName = res.result.address_component.city.replace(/[市]/g, "");
                    wx.request({
                        url: 'https://mind.lvmama.com/user-api/scenicSpot/getDestCity',
                        data: {
                            cityName: cityName
                        },
                        success: function (res) {
                            if (res.data.code == '200') {
                                var city = res.data.data[0]
                                cityData.currCity = {
                                    name: city.destName,
                                    code: city.shortPinyin,
                                    id: city.destId,
                                    pinyin: city.pinyin
                                };
                                // list.unshift('当前');
                                cityData.hasCur = true;
                                inst.setData({
                                    cityData: cityData
                                });
                            }

                        }
                    });
                }
            });

        },
        fail: function () {
            cityData.hasCur = false;
            inst.setData({
                cityData: cityData,
            });
            wx.setStorageSync('aroundShowFlag', false)
            wx.showModal({
                content: '无法定位您的当前位置，请在设置中把定位服务打开或等待重新授权',
                showCancel: false
            })
        }
    });
};

module.exports = {
    init: init,
    resolve: resolve,
};