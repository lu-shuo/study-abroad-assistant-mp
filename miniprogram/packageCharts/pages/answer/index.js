// pages/answer/index.js
import * as echarts from '../../ec-canvas/echarts'

function setOption(chart, chartData) {
  const option = {
    color: [
      "#5470c6",
      "#91cc75",
      "#fac858",
      "#ee6666",
      "#73c0de",
      "#3ba272",
      "#fc8452",
      "#9a60b4",
      "#ea7ccc"
    ],
    series: {
      type: 'sunburst',
      // emphasis: {
      //     focus: 'ancestor'
      // },
      data: chartData,
      // 相对的百分比
      position: ['50%', '50%'],
      radius: [0, '100%'],
      levels: [{},
        {
          label: {
            rotate: 'radial',
            formatter: '{b}: {c}'
          }
        },
        {
          label: {
            rotate: 'radial',
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
    activeNames: ['0'],
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
    this.setData({
      isDisposed: false
    })
    this.init()
  },
  // 点击按钮后初始化图表
  init: function (chartData = this.data.answerInfo.chartData.bigPoint) {
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
      this.setData({
        answerInfo
      })
    })
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    if (!this.data.answerInfo.fromRecord) {
      wx.reLaunch({
        url: '/pages/estimate/index',
      })
    }
  },
  jumpToQuestion() {
    const {answerInfo} = this.data
    answerInfo.fromAnswer = true
    wx.setStorageSync('recordInfo', answerInfo)
    wx.navigateTo({
      url: `/pages/questionnaire/index?from=answer`,
      // success: res => {
      //   // 这里给要打开的页面传递数据.  第一个参数:方法key, 第二个参数:需要传递的数据
      //   res.eventChannel.emit('setRecordInfo', {
      //     recordInfo: answerInfo,
      //     fromAnswer: true
      //   })
      // },
    });
  },
})