// pages/answer/index.js
const { requestCloud } = require('../../utils/request')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    answerInfo: null,
    universityList: []
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
      this.getSuitableUniversityList()
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
    });
  },
  async getSuitableUniversityList() {
    try {
      const { result } = await requestCloud('studyAbroadAssistant', {
        type: 'getSuitableUniversityList',
        bigPoint: this.data.answerInfo.score.bigPoint,
      })
      this.setData({
        universityList: result.data
      })
    } catch (error) {
      console.error(error)
    }
   
  }
})