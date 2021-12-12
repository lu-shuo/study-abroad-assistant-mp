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
    color: [
      "#c12e34",
      "#e6b600",
      "#0098d9",
      "#2b821d",
      "#005eaa",
      "#339ca8",
      "#cda819",
      "#32a487",
      "#2ec7c9",
      "#b6a2de",
      "#5ab1ef",
      "#ffb980",
      "#d87a80",
      "#8d98b3",
      "#e5cf0d",
      "#97b552",
      "#95706d",
      "#dc69aa",
      "#07a2a4",
      "#9a7fd1",
      "#588dd5",
      "#f5994e",
      "#c05050",
      "#59678c",
      "#c9ab00",
      "#7eb00a",
      "#6f5553",
      "#c14089"
    ],
    series: {
      type: 'sunburst',
      // emphasis: {
      //     focus: 'ancestor'
      // },
      data: [
        {
          name: '技能',
          children: [
            {
              name: '语言能力',
              value: 10
            },
            {
              name: '社交技巧',
              value: 20,
            }
          ]
        },
        {
          name: '哈哈',
          children: [
            {
              name: '语言能力',
              value: 10
            },
            {
              name: '社交技巧',
              value: 20,
            }
          ]
        },
        {
          name: '知识',
          children: [
            {
              name: '学习成绩',
              value: 30
            },
            {
              name: '雅思',
              value: 20
            },
            {
              name: '托福',
              value: 40
            },
            {
              name: 'GRE',
              value: 10
            }
          ]
        }
      ],
      // 相对的百分比
      position: ['50%', '50%'],
      radius: [0, '90%'],
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
            rotate: 'radial',
            formatter: '{b}: {c}'
          }
        },
        // {
        //   itemStyle: {
        //     color: '#FFC75F'
        //   },
        //   label: {
        //     rotate: 0
        //   }
        // }
      ],
    }
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
    eventChannel.on('setScore', ({
      score
    }) => {
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