// pages/answer/index.js
import * as echarts from '../../ec-canvas/echarts'

function setOption(chart, chartData) {
  const option = {
    color: [
      "#3fb1e3",
      "#6be6c1",
      "#626c91",
      "#a0a7e6"
    ],
    series: {
      type: 'sunburst',
      // emphasis: {
      //     focus: 'ancestor'
      // },
      data: [
        {
          "name": "技能",
          "children": [
            {
              "name": "语言能力",
              "value": 64.5
            }
          ]
        },
        {
          "name": "知识",
          "children": [
            {
              "name": "学业表现",
              "value": 72
            }
          ]
        }
      ],
      // 相对的百分比
      position: ['50%', '50%'],
      radius: [0, '95%'],
      levels: [
        {},
        {
          label: {
            rotate: 'radial',
            formatter: '{b}: {c}'
          }
        },
        {
          label: {
            rotate: 'tangential',
            formatter: '{b}: {c}'
          }
        },
      ],
    }
  };
  chart.setOption(option);
}

Page({
  /**
   * 页面的初始数据
   */
  data: {
    activeNames: ['1'],
    answerInfo: null,
    ec: {
      lazyLoad: true
    },
    isDisposed: false
  },
  onChange(event) {
    this.setData({
      activeNames: event.detail,
    });
  },
  onClose(event) {
    this.dispose()
  },
  onOpen(event) {
    this.setData({isDisposed: false})
    this.init()
  },
  // 点击按钮后初始化图表
  init: function (chartData) {
     // 获取组件
    this.ecComponent = this.selectComponent('#mychart-dom-sun');
    // console.log(this.ecComponent)
    this.ecComponent.init((canvas, width, height, dpr) => {
      // 获取组件的 canvas、width、height 后的回调函数
      // 在这里初始化图表
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr // new
      });
      setOption(chart, chartData);

      // 将图表实例绑定到 this 上，可以在其他成员函数（如 dispose）中访问
      this.chart = chart;

      this.setData({
        isDisposed: false
      });


      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return chart;
    });
  },
  dispose: function () {
    if (this.chart) {
      this.chart.dispose();
    }

    this.setData({
      isDisposed: true
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const eventChannel = this.getOpenerEventChannel()
    // 事件名和上个页面设置的相同即可
    eventChannel.on('setAnswerInfo', ({
      answerInfo
    }) => {
      this.setData({answerInfo})
    })
    console.log(this.data.answerInfo)
    
    // this.init(this.data.answerInfo.chartData.bigPoint)
    this.init()
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