 /**
 * 工具方法相关
 */
function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function isNotEmptyObj(obj) {
  for (var key in obj) {
    return false;
  }
  return true;
}

function isNotEmptyArr(arr) {
  return arr.constructor === Array && arr.length === 0 ? false : true;
}

/**
 * param 将要转为URL参数字符串的对象
 * key URL参数字符串的前缀
 * encode true/false 是否进行URL编码,默认为true
 * 
 * return URL参数字符串
 */
function urlEncode (param, key, encode) {
  if(param==null) return '';
  var paramStr = '';
  var t = typeof (param);
  if (t == 'string' || t == 'number' || t == 'boolean') {
    paramStr += '&' + key + '=' + ((encode==null||encode) ? encodeURIComponent(param) : param);
  } else {
    for (var i in param) {
      var k = key == null ? i : key;
      paramStr += urlEncode(param[i], k, encode);
    }
  }
  return paramStr;
};

function fliterEmptyParam (obj) {
    var temp = {};
    for(var key in obj){
      if(obj[key] || obj[key]==false){
        temp[key] = obj[key];
      }
    }
    return temp;
}

function showToast (title, icon, duration) {
    wx.showToast({
        title: title || '加载中...',
        icon: icon || 'loading',
        duration: duration || 10000,
        mask: true
    })
};
function showLoading(title){
  if(wx.showLoading){
    wx.showLoading({
       title: title || '加载中...',
       mask: true
    })
  }else{
    wx.showToast({
        title: title || '加载中...',
        icon: 'loading',
        duration: 60000,
        mask: true
    })
  }
};
function hideLoading(){
  wx.hideLoading();
};
function hideToast () {
  wx.hideToast();
};

function showInfoMsg (msg) {
    wx.showToast({
        title: msg,
        icon: 'success',
        duration: 2500,
        mask: true
    })
};
function showInfoMsgNoIcon(msg) {
  wx.showToast({
    title: msg,
    icon: 'none',
    duration: 2500,
    mask: true
  })
};
function showModalMsg (msg) {
    wx.showModal({
        content: msg,
        showCancel: false,
    })
};

function each(arr, cb){
    for (var i =0; i < arr.length; i++){
        if (cb.call(arr[i], i, arr[i]) === true) {
            break;
        }
    }
};

function showLowVersionModal() {
  wx.showModal({
    title: '提示',
    content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
  })
};
function looseEqual (a, b) {
  if (a === b) { return true }
  var isObjectA = isObject(a);
  var isObjectB = isObject(b);
  if (isObjectA && isObjectB) {
    try {
      var isArrayA = Array.isArray(a);
      var isArrayB = Array.isArray(b);
      if (isArrayA && isArrayB) {
        return a.length === b.length && a.every(function (e, i) {
          return looseEqual(e, b[i])
        })
      } else if (!isArrayA && !isArrayB) {
        var keysA = Object.keys(a);
        var keysB = Object.keys(b);
        return keysA.length === keysB.length && keysA.every(function (key) {
          return looseEqual(a[key], b[key])
        })
      } else {
        /* istanbul ignore next */
        return false
      }
    } catch (e) {
      /* istanbul ignore next */
      return false
    }
  } else if (!isObjectA && !isObjectB) {
    return String(a) === String(b)
  } else {
    return false
  }
};
function isObject (obj) {
  return obj !== null && typeof obj === 'object'
};
function json2Form(json) {
  var str = [];
  for(var p in json){
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(json[p]));
  }
  return str.join("&");
};
module.exports = {
  formatTime: formatTime,
  formatNumber: formatNumber,
  isNotEmptyObj: isNotEmptyObj,
  isNotEmptyArr: isNotEmptyArr,
  urlEncode: urlEncode,
  showToast: showToast,
  hideToast: hideToast,
  showInfoMsg: showInfoMsg,
  showInfoMsgNoIcon: showInfoMsgNoIcon,
  showModalMsg: showModalMsg,
  fliterEmptyParam: fliterEmptyParam,
  each: each,
  showLoading: showLoading,
  hideLoading: hideLoading,
  showLowVersionModal: showLowVersionModal,
  looseEqual:looseEqual,
  isObject:isObject,
  json2Form:json2Form,
}
