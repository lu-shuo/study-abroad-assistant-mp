// pages/questionnaire/index.js
const { requestCloud } = require('../../utils/request')
// const questionInfo = require('../../test/questionnaire')
import Dialog from '@vant/weapp/dialog/dialog';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    questionInfo: {},
    record: null, // 历史评估记录
    answers: [],
    loading: false,
    submitLoading: false,
    swiperDuration: 0,
    current: 0, // 初始跳转index
    currentIndex: 0, // 当前的真实index
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.enableAlertBeforeUnload({
      message: "您还未完成评估，确定退出？",
      success: function (res) {
        console.log("未完成退出：", res);
      },
      fail: function (errMsg) {
        console.log("取消退出：", errMsg);
      },
    });
    // 接收record数据
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('setRecord', ({ record }) => {
      this.setData({ record })
    })

    this.setData({
      swiperHeight: wx.getSystemInfoSync().windowHeight - 100,
    })
    this.getQuestionInfo(this.data.record)
  },
  async getQuestionInfo(record = null) {
    // 拉取问卷详情
    this.setData({loading: true})
    try {
      let questionnaireName
      if (record) {
        questionnaireName = record.questionnaireInfo[0].name
      } else {
        questionnaireName = '留学择校评估问卷'
      }
      const res = await requestCloud('studyAbroadAssistant', {
        type: 'getQuestionnaireInfo',
        name: questionnaireName
      })
      const questionInfo = res.result.list[0]
      
      if (record) {
        const { answers } = record
        // 还原答案
        questionInfo.questions.forEach(item => {
          item.disabled = true
          answers.forEach(answer => {
            if (item.index === answer.questionIndex) {
              item.selected = answer.selected
            }
          })
        })
      }

      questionInfo.questions.push({
        index: questionInfo.questions.length,
        qType: -1, // -1-答题卡页 -2-历史记录跳转答题卡
        isHistory: record ? true : false,
        answers: Array.from({ length: questionInfo.questions.length }, (v, i) => ({ index: i, selected: record ? record.answers[i].selected : null })),
      })

      console.log(questionInfo)
      
      this.setData({
        questionInfo
      })
    } catch (error) {
      console.error(error)
    }
    this.setData({loading: false})
    this.jumpToQuestion(record ? this.data.questionInfo.questions.length - 1 : 0)
  },
  jumpToQuestion(index) {
    this.setData({ swiperDuration: 0 })
    // 初始化到上次答题位置
    this.setData({ currentIndex: index })
    this.selectComponent('#swiper').init(index)
    // 恢复swiper动画
    this.setData({ swiperDuration: 500 })
  },
  handleQuestionConfirm(e) {
    console.log('select', e.detail)
    const { answers, currentIndex, questionInfo } = this.data
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
    if (currentIndex < questionInfo.questions.length - 1) {
      setTimeout(() => {
        this.setData({ current: currentIndex + 1 })
      }, 150)
    }
  },
  handleQuestionChange(e) {
    // 返回当前的真实index
    const { current:realIndex } = e.detail
    this.setData({ currentIndex: realIndex })
  },
  handleRecordClick(e) {
    // 跳转到对应题目
    this.setData({ currentIndex: e.detail.index })
    this.selectComponent('#swiper').init(e.detail.index);
  },
  // 交卷
  async handleConfirmAnswer(e) {
    const { isFinish } = e.detail
    const userInfo = wx.getStorageSync('userInfo')
    if (isFinish) {
      const score = this.calculateScore()
      await this.pullAnswers({
        userId: userInfo._id,
        questionnaireId: this.data.questionInfo._id,
        answers: this.data.answers,
        score,
        isFinish
      })
      this.navigateToRecord(score)
    } else {
      // 二次确认
      Dialog.confirm({
        title: '提示',
        message: '您有题目未做完，确认提交吗？',
        className: 'not-finish-dialog'
      }).then(async () => {
        // on confirm
        const { answers, questionInfo } = this.data
        const length = questionInfo.questions.length
        if (answers.length < length - 1) {
          const hasAnswerIndexList = answers.map(item => item.questionIndex);
          // 题目未答完，填充答案为空
          questionInfo.questions.slice(0, length - 1).forEach(item => {
            if (!hasAnswerIndexList.includes(item.index)) {
              answers.push({
                questionIndex: item.index,
                questionId: item._id,
                selected: null
              })
            }
          })
          this.setData({ answers })
        }
        const score = this.calculateScore()
        await this.pullAnswers({
          userId: userInfo._id,
          questionnaireId: this.data.questionInfo._id,
          answers: this.data.answers,
          score,
          isFinish
        })
        this.navigateToRecord(score)
      })
      .catch(() => {
        // on cancel
      });
    }
  },
  // 推送答案
  async pullAnswers({ userId, questionnaireId, answers, score, isFinish }) {
    this.setData({ submitLoading: true })
    try {
      await requestCloud('studyAbroadAssistant', {
        type: 'submitEstimate',
        userId,
        questionnaireId,
        answers,
        score,
        isFinish
      })
    } catch (error) {
      console.error(error)
    }
    this.setData({ submitLoading: false })
  },
  // 计算得分并跳转到得分页
  calculateScore() {
    const { answers } = this.data
    const { questions } = this.data.questionInfo

    let bigPoint = 0,
      smallPoint = 0
    answers.forEach(item => {
      questions[item.questionIndex].options.forEach(option => {
        if (option.title === item.selected) {
          bigPoint += option.bigPoint
          smallPoint += option.smallPoint
        }
      })
    })
    return {
      bigPoint,
      smallPoint
    }
  },
  // 跳转答案页
  navigateToRecord(score) {
    wx.navigateTo({
      url: '/packageCharts/pages/answer/index',
      success: res => {
        // 这里给要打开的页面传递数据.  第一个参数:方法key, 第二个参数:需要传递的数据
        res.eventChannel.emit('setScore', {
          score
        })
      }
    })
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