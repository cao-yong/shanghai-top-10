/*
 * showInfoMsg.js
 * 
 */

function init (_this) {
    _this.infoMsg = function(msg, initDone, time){
        if(initDone){
            _this.setData({
                showInfoFlag: false,
                msg: msg
            });
            setTimeout(function(){
                _this.setData({
                    showInfoFlag: true
                });
            }, time || 1500)
        }    
    };
}

module.exports = {
    init: init
}