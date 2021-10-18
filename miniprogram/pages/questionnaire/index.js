// pages/questionnaire/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    questionInfo: {},
    loading: false,
  },
  async getQuestionInfo() {
    this.setData({loading: true})
    try {
      const res = await wx.$requestCloud('studyAbroadAssistant', {
        type: 'getQuestionnaireInfo',
        name: '留学择校评估问卷'
      })
      this.setData({
        questionInfo: res.result.list[0]
      })
    } catch (error) {
      console.error(error)
    }
    this.setData({loading: false})
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getQuestionInfo()
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