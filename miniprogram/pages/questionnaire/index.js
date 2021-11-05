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
      message: "确定退出评估？退出后未完成的评估将会保存在评估历史中",
      success: function (res) {
        console.log("未完成退出：", res);
      },
      fail: function (errMsg) {
        console.log("取消退出：", errMsg);
      },
    });
    this.setData({
      swiperHeight: wx.getSystemInfoSync().windowHeight - 100,
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
      // 初次答题加入record页面
      questionInfo.questions.push({
        index: questionInfo.questions.length,
        qType: -1, // 代表record页面
        answers: Array.from({ length: questionInfo.questions.length }, (v, i) => ({ index: i, selected: null })),
      }) 

      this.setData({
        // questionInfo: res.result.list[0]
        questionInfo
      })
    } catch (error) {
      console.error(error)
    }
    this.setData({loading: false})
    this.jumpToQuestion(0)
  },
  jumpToQuestion(index) {
    this.setData({ swiperDuration: 0 })
    // 初始化到上次答题位置
    this.selectComponent('#swiper').init(index)
    // 恢复swiper动画
    this.setData({ swiperDuration: 500 })
  },
  handleQuestionConfirm(e) {
    console.log('select', e.detail)
    const { answers, current, questionInfo } = this.data
    const length = questionInfo.questions.length;
    const { questionIndex, questionId, selected } = e.detail
    // 记录题目选项
    questionInfo.questions.forEach((item, index) => {
      if (item._id === questionId) {
        questionInfo.questions[index].selected = selected
      }
    })
    // 填充答题记录
    questionInfo.questions[length - 1].answers[questionIndex].selected = selected
    // 记录答案
    const index = answers.findIndex(item => item.questionId === questionId)
    if (index === -1) {
      answers.push(e.detail)
    } else {
      answers[index].selected = selected
    }
    this.setData({
      answers,
      questionInfo
    })
    // 不是最后一题则自动跳转下一题
    if (current < questionInfo.questions.length - 1) {
      setTimeout(() => {
        this.setData({ current: current + 1 })
      }, 150)
    }
    // 最后一题选中后跳转answer页面
    // if (questionIndex === questionInfo.questions.length - 1) {
    //   wx.navigateTo({
    //     url: '/pages/answer/index',
    //     success: res => {
    //       // 这里给要打开的页面传递数据.  第一个参数:方法key, 第二个参数:需要传递的数据
    //       res.eventChannel.emit('setAnswers', {
    //         questionnaireName: this.data.questionInfo.name,
    //         answers: this.data.answers
    //       })
    //     },
    //   })
    // }
  },
  handleQuestionChange(e) {
    // 返回当前的真实index
    const { current:realIndex } = e.detail
    this.setData({ currentIndex: realIndex })
  },
  handleRecordClick(e) {
    // 跳转到对应题目
    this.selectComponent('#swiper').init(e.detail.index);
  },
  // 交卷
  handleConfirmAnswer(e) {
    const { isFinish } = e.detail
    if (isFinish) {
      // 保存结果到数据库并跳转结果页面
    } else {
      // 二次确认
      Dialog.confirm({
        title: '提示',
        message: '您有题目未做完，确认提交吗？',
        className: 'not-finish-dialog'
      }).then(() => {
        // on confirm
      })
      .catch(() => {
        // on cancel
      });
    }
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