
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    start: {
      type: String,
      value: '',
      observer: function() {
      }
    },
    end: {
      type: String,
      value: '',
      observer: function (newVal, oldVal, changedPath) {
      }
    },
    selectedTag: {
      type: String,
      value: ''
    },
    multiple: {
      type: Boolean,
      value: false,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    calendar: [],
    selectedDate: '',
  },

  ready: function() {
    const _this = this;
    wx.getStorage({
      key: 'shareStartDate',
      success: function(res) {
        if (res.data) {
          _this.selectedDate = new Date(res.data);
          _this.selectedY = _this.selectedDate.getFullYear();
          _this.selectedM = _this.selectedDate.getMonth()+1;
          _this.selectedD = _this.selectedDate.getDate()
        }
        
      },
    })
    this.initCalendar();
  },

  /**
   * 组件的方法列表
   */
  methods: {
    initCalendar() {
      const _this = this;
      _this.getNow((now) => {
        // 获取当前日期
        const nowDate= new Date(now);
        const nowY = nowDate.getFullYear();
        const nowM = nowDate.getMonth()+1;
        const nowD = nowDate.getDate();

        // 设置开始时间
        let start, startY, startM, startD;
        if (!_this.properties.start) {
          // 没有设置开始日期
          start = now;
        } else {
          start = _this.properties.start;
        }
        start = new Date(start);
        startY = start.getFullYear();
        startM = start.getMonth() + 1;
        startD = start.getDate();

        // 设置结束时间
        let end, endY, endM, endD;
        if (!_this.properties.end) {
          // 没有结束日期，默认6个月
          if (startM + 6 > 12) {
            endY = startY + 1;
            endM = (startM + 5) - 12;
            endD = startD;
          } else {
            endY = startY;
            endM = startM + 5;
            endD = startD;
          }
        } else {
          end = new Date(_this.properties.end);
          if(end>start){
            endY = end.getFullYear();
            endM = end.getMonth() + 1;
            endD = end.getDate();
          }else {
            endY = startY;
            endM = startM;
          }
        }

        // 生成基础日历数据
        let calendar = [];
        for (let i = startY; i <= endY; i++) {
          let beginM = (i == startY) ? startM : 1;
          let overM = (i == endY) ? endM : 12;
          for (let j = beginM; j <= overM; j++) {
            const dayNum = new Date(i, j, 0).getDate();
            const weekStart = new Date(i, j - 1, 1).getDay();
            const weekEnd = new Date(i, j - 1, dayNum).getDay();

            let monthDays = [];
            for (let w = 0; w < weekStart; w++) {
              monthDays.push(0);
            }
            for (let k = 1; k <= dayNum; k++) {
              let dayData={
                num: k,
                flg: false
              }
              // 今天之前的日期不可点击
              if (i < nowY || (i == nowY && j < nowM) || (i == nowY && j == nowM && k < nowD)) {
                dayData.notUse = true;
              }

              // 今天
              if (i == nowY && j == nowM && k == nowD) {
                dayData.name = '今天';
              }
              if(_this.selectDate) {
                if (i == _this.selectedY && j == _this.selectedM && k == _this.selectedD) {
                  if ((_this.selectedY > nowY) || (_this.selectedY == nowY && _this.selectedM > nowM) || (_this.selectedY == nowY && _this.selectedM == nowM && _this.selectedD >= nowD)) {
                    dayData.flg = true;
                  }

                }
              }
              

              monthDays.push(dayData);
            }
            for (let w = 0; w < 6 - weekEnd; w++) {
              monthDays.push(0);
            }

            let day = [];
            for (let n = 0; n < monthDays.length; n = n + 7) {
              day.push(monthDays.slice(n, n + 7))
            }

            calendar.push({
              year: i,
              month: j,
              day: day
            });
          }
        }

        _this.setData({
          calendar: calendar
        })
        // 获取节假日并合并到日历数据
        _this.getVacation((vcts)=>{      
          vcts.forEach((vct,i)=>{
            const vctDate = new Date(_this.formatDate(vct.date));
            const vctY = vctDate.getFullYear();
            const vctM = vctDate.getMonth()+1;
            const vctD = vctDate.getDate();
            calendar.forEach((ymd,k)=>{
              ymd.day.forEach((rd,i)=>{
                rd.forEach((d,j)=>{
                  if(d!= 0) {
                    if (ymd.year==vctY && ymd.month==vctM && d.num == vctD) {
                      d.vctflag = vct.flag;
                      d.name = vct.name;
                    }
                  }
                })
              })
            })
          })
          _this.setData({
            calendar: calendar
          })
        })
        
      })
    },

    // 获取系统当前时间
    getNow(cb) {
      wx.request({
        url: 'https://m.lvmama.com/api/router/rest.do?method=api.com.biz.synTime&version=1.0.0',
        success:function(res) {
          let now = '';
          if(res.data.code == 1) {
            now = res.data.data.now;
          }else {
            now = new Date();
          }
          cb(now)
        },
        fail: function () {
          cb(now)
        }
      });
    },

    // 获取当前年的节假日
    getVacation(cb) {
      wx.request({
        url: 'https://m.lvmama.com/api/router/rest.do?method=api.com.common.getVacations&version=1.0.0',
        method: 'GET',
        success: function(res) {
          const data = res.data;
          if (data.code == 1 && data.data.vacationVos && data.data.vacationVos.length>0) {
            cb(data.data.vacationVos)
          }else {
            cb([])
          }
        },
        fail: function(res) {
          cb([])
        }
      })
    },

    // 选择日期
    selectDate(ev) {
      const data = ev.currentTarget.dataset;
      const calendar = this.data.calendar;
      if (this.properties.multiple) {
        calendar[data.k].day[data.i][data.j].flg = !calendar[data.k].day[data.i][data.j].flg;
      }else {
        calendar.forEach((ymd, i) => {
          ymd.day.forEach((dr, j) => {
            dr.forEach((d) => {
              if (d != 0 && d.flg) {
                d.flg = false;
              }
            })
          })
        });
        calendar[data.k].day[data.i][data.j].flg = true;
      }
      
      
      this.setData({
        calendar: calendar
      }) 

      // 触发回调事件
      var detail = {date: calendar[data.k].year + '/' + calendar[data.k].month + '/' + calendar[data.k].day[data.i][data.j].num,}
      var option = { bubbles: true, composed: true } 
      this.triggerEvent('selectedCb', detail, option)
    },
    formatDate(dateStr) {
      if (dateStr && dateStr.match(/-/g)) {
        return dateStr.replace(/-/g,'/')
      }
      if (dateStr && dateStr.match(/[\u4e00-\u9fa5]/g)){
        return dateStr.replace(/[\u4e00-\u9fa5]/g, '/')
      }
      
    }
  }
})
