/**
 * loadingMore.js
 * 
 * 
 */

function init (_this) {
  _this.changeLoadingFlag = function(flag, initDone ,type){
     if(initDone){
       _this.setData({
         isInit: false
       })
     }
    if (type=='1'){
      _this.setData({
        hasNextPage1: flag
      });
     }else{
      _this.setData({
        hasNextPage: flag
      });
     }

  };
}

module.exports = {
    init: init
}