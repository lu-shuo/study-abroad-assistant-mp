// pages/estimate/index.js
Page({
  /**
   * 页面的初始数据
   */
  data: {

  },
  startEstimate() {
    wx.navigateTo({
      url: '/pages/questionnaire/index?from=home',
    })
  },
  navigateToRecord() {
    wx.navigateTo({
      url: '/pages/record/index',
    })
  },
})