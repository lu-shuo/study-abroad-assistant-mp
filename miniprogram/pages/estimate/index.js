// pages/estimate/index.js
const { requestCloud } = require('../../utils/request')

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  startEstimate() {
    wx.navigateTo({
      url: '/pages/questionnaire/index',
    })
  },
  navigateToRecord() {

    wx.navigateTo({
      url: '/pages/record/index',
    })
  },
})