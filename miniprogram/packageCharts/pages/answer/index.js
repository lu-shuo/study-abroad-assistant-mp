// pages/answer/index.js
import * as echarts from '../../ec-canvas/echarts'

let chart = null

function initChart(canvas, width, height, dpr) {
  chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr // new
  });
  canvas.setChart(chart);

  var option = {
    series: [
      {
        name: '得分分类',
        type: 'pie',
        radius: '50%',
        label: {
          normal: {
              show: true,
              formatter: '{b}: {c} ({d}%)'
          }
        },
        data: [
          { value: 1048, name: '知识' },
          { value: 735, name: '技能' },
          { value: 580, name: '语言' },
          { value: 484, name: '奖项' },
          { value: 300, name: '实践' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  chart.setOption(option);
  return chart;
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bigPoint: 0,
    smallPoint: 0,
    ec: {
      onInit: initChart
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const eventChannel = this.getOpenerEventChannel()
    // 事件名和上个页面设置的相同即可
    eventChannel.on('setScore', ({ score }) => {
      this.setData({  
        bigPoint: score.bigPoint,
        smallPoint: score.smallPoint
      })
    })
  },

  onReady() {
    setTimeout(function () {
      // 获取 chart 实例的方式
      // console.log(chart)
    }, 2000);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    wx.reLaunch({
      url: '/pages/estimate/index',
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})