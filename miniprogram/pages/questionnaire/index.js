// pages/questionnaire/index.js
const { requestCloud } = require('../../utils/request')
// const questionnaireInfo = require('../../test/questionnaire')
import Dialog from '@vant/weapp/dialog/dialog';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    questionnaireInfo: {},
    recordInfo: null, // 历史评估记录
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
      message: "您还未完成本次评估，结果将保存到评估记录，确定退出？",
      success: function (res) {
        console.log("未完成退出：", res);
        // this.handleConfirmAnswer({detail: false})
      },
      fail: function (errMsg) {
        console.log("取消退出：", errMsg);
      },
    });
    // 接收record数据
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('setRecord', ({ recordInfo }) => {
      this.setData({ recordInfo })
    })

    this.setData({
      swiperHeight: wx.getSystemInfoSync().windowHeight - 100,
    })
    this.getQuestionInfo(this.data.recordInfo)
  },
  async getQuestionInfo(recordInfo = null) {
    // 拉取问卷详情
    this.setData({loading: true})
    try {
      let questionnaireName
      if (recordInfo) {
        questionnaireName = recordInfo.questionnaireName
      } else {
        questionnaireName = '留学择校评估问卷'
      }
      const res = await requestCloud('studyAbroadAssistant', {
        type: 'getQuestionnaireInfo',
        name: questionnaireName
      })
      const questionnaireInfo = res.result.list[0]
      
      if (recordInfo) {
        const { answers } = recordInfo
        // 还原答案
        questionnaireInfo.questions.forEach(item => {
          item.disabled = true
          answers.forEach(answer => {
            if (item.index === answer.questionIndex) {
              item.selected = answer.selected
            }
          })
        })
      }

      questionnaireInfo.questions.push({
        index: questionnaireInfo.questions.length,
        qType: -1, // -1-答题卡页 -2-历史记录跳转答题卡
        isRecord: recordInfo ? true : false,
        answers: 
          Array.from({ length: questionnaireInfo.questions.length }, (v, i) => ({ index: i, selected: recordInfo ? recordInfo.answers[i].selected : null })),
      })

      console.log(questionnaireInfo)
      
      this.setData({
        questionnaireInfo
      })
    } catch (error) {
      console.error(error)
    }
    this.setData({loading: false})
    this.jumpToQuestion(recordInfo ? this.data.questionnaireInfo.questions.length - 1 : 0)
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
    const { answers, currentIndex, questionnaireInfo } = this.data
    const length = questionnaireInfo.questions.length;
    const { questionIndex, questionId, selected } = e.detail
    // 记录题目选项
    questionnaireInfo.questions.forEach((item, index) => {
      if (item._id === questionId) {
        questionnaireInfo.questions[index].selected = selected
      }
    })
    // 填充答题记录
    questionnaireInfo.questions[length - 1].answers[questionIndex].selected = selected
    // 记录答案
    const index = answers.findIndex(item => item.questionId === questionId)
    if (index === -1) {
      answers.push(e.detail)
    } else {
      answers[index].selected = selected
    }
    this.setData({
      answers,
      questionnaireInfo
    })
    // 不是最后一题则自动跳转下一题
    if (currentIndex < questionnaireInfo.questions.length - 1) {
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
  // isFinish: false-中途退出
  async handleConfirmAnswer(isFinish = true) {
    // const { isFinish } = e.detail
    const userInfo = wx.getStorageSync('userInfo')
    if (isFinish) {
      const finishAll = this.data.answers.length === this.data.questionnaireInfo.questions.length - 1
      if (finishAll) {
        const score = this.calculateScore()
        await this.pullAnswers({
          userId: userInfo._id,
          questionnaireId: this.data.questionnaireInfo._id,
          questionnaireName: this.data.questionnaireInfo.name,
          answers: this.data.answers,
          score,
          isFinish: true
        })
        this.navigateToAnswer(score)
      } else {
        // 二次确认
        Dialog.confirm({
          title: '提示',
          message: '您有题目未做完，确认提交吗？',
          className: 'not-finish-dialog'
        }).then(async () => {
          // on confirm
          const { answers, questionnaireInfo } = this.data
          const length = questionnaireInfo.questions.length
          if (answers.length < length - 1) {
            const hasAnswerIndexList = answers.map(item => item.questionIndex);
            // 题目未答完，填充答案为空
            questionnaireInfo.questions.slice(0, length - 1).forEach(item => {
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
            questionnaireId: this.data.questionnaireInfo._id,
            questionnaireName: this.data.questionnaireInfo.name,
            answers: this.data.answers,
            score,
            isFinish: true
          })
          this.navigateToAnswer(score)
        })
        .catch(() => {
          // on cancel
        });
      }
     
    } else {
      // 中途退出
      const { answers, questionnaireInfo } = this.data
      const length = questionnaireInfo.questions.length
      if (answers.length < length - 1) {
        const hasAnswerIndexList = answers.map(item => item.questionIndex);
        // 题目未答完，填充答案为空
        questionnaireInfo.questions.slice(0, length - 1).forEach(item => {
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
        questionnaireId: this.data.questionnaireInfo._id,
        questionnaireName: this.data.questionnaireInfo.name,
        answers: this.data.answers,
        score,
        isFinish: false
      })
      this.navigateToAnswer(score)
    }
  },
  // 推送答案
  async pullAnswers({ userId, questionnaireId, questionnaireName, answers, score, isFinish }) {
    this.setData({ submitLoading: true })
    try {
      await requestCloud('studyAbroadAssistant', {
        type: 'submitEstimate',
        userId,
        questionnaireId,
        questionnaireName,
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
    const { questions } = this.data.questionnaireInfo

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
  navigateToAnswer(score) {
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