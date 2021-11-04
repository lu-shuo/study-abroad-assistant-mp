// pages/questionnaire/index.js
const questionInfo = require('../../test/questionnaire')
import Dialog from '@vant/weapp/dialog/dialog';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    questionInfo: {},
    answers: [],
    loading: false,
    swiperDuration: 0,
    current: 0, // 初始跳转index
    currentIndex: 0, // 当前的真实index
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.enableAlertBeforeUnload({
      message: "您当前还未完成评估，确认退出？",
      success: function (res) {
        console.log("中途退出：", res);
      },
      fail: function (errMsg) {
        console.log("退出失败：", errMsg);
      },
    });
    this.setData({
      swiperHeight: wx.getSystemInfoSync().windowHeight,
    })
    this.getQuestionInfo()
  },
  async getQuestionInfo() {
    // 拉取问卷详情
    this.setData({loading: true})
    try {
      // const res = await wx.$requestCloud('studyAbroadAssistant', {
      //   type: 'getQuestionnaireInfo',
      //   name: '留学择校评估问卷'
      // })
      this.setData({
        // questionInfo: res.result.list[0]
        questionInfo
      })
    } catch (error) {
      console.error(error)
    }
    this.setData({loading: false})
    // 初始化到上次答题位置
    this.selectComponent('#swiper').init(0);
    // 恢复swiper动画
    this.setData({ swiperDuration: 500 })
  },
  handleQuestionConfirm(e) {
    console.log(e.detail)
    const { answers, current, questionInfo } = this.data;
    const { questionId, selected } = e.detail
    questionInfo.questions.forEach((item, index) => {
      if (item._id === questionId) {
        questionInfo.questions[index].selected = selected.title
      }
    })
    const index = answers.findIndex(item => item.questionId === questionId)
    if (index === -1) {
      answers.push(e.detail)
    } else {
      answers[index].selected = selected
    }
    console.log(questionInfo, answers)
    this.setData({
      answers,
      questionInfo
    })
    // 不是最后一题则自动跳转下一题
    if (current < questionInfo.questions.length - 1) {
      this.setData({ current: current + 1 })
    }
    if (answers.length === this.data.questionInfo.questions.length) {
      Dialog.alert({
        title: '标题',
        message: '您已答完问卷，点击确认查看结果',
        theme: 'round-button',
      }).then(() => {
        // on close
      });
    }
  },
  handleQuestionChange(e) {
    // 返回当前的真实index
    const { current:realIndex } = e.detail
    this.setData({ currentIndex: realIndex })
    // if (realIndex === this.data.questionInfo.questions.length - 1 ) {
    //   Dialog.alert({
    //     title: '标题',
    //     message: '已经到最后一题了',
    //     theme: 'round-button',
    //   }).then(() => {
    //     // on close
    //   });
    // }
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