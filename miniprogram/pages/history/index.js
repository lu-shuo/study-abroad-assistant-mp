// pages/history/index.js
const { requestCloud } = require('../../utils/request')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    recordInfo: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { userId } = options
    this.getRecord(userId)
  },
  async getRecord(userId=null) {
    let id
    if (!userId) {
      const userInfo = wx.getStorageSync('userInfo')
      id = userInfo._id
    } else {
      id = userId
    }
    const res = await requestCloud('studyAbroadAssistant', {
      type: 'getRecord',
      userId: id
    })
    this.setData({
      recordInfo: res.result.list
    })
  },
  jumpToQuestionnaire(e) {
    wx.navigateTo({
      url: `/pages/questionnaire/index`,
      success: res => {
        // 这里给要打开的页面传递数据.  第一个参数:方法key, 第二个参数:需要传递的数据
        res.eventChannel.emit('setRecord', {
          record: this.data.recordInfo[e.currentTarget.dataset.index],
        })
      },
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

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