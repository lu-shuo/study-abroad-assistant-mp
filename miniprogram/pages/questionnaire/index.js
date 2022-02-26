// pages/questionnaire/index.js
const { requestCloud } = require('../../utils/request')
import Dialog from '@vant/weapp/dialog/dialog';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    questionnaireInfo: {},
    recordInfo: null, // 历史评估记录
    onlyRead: false,
    answers: [],
    loading: false,
    submitLoading: false,
    swiperDuration: 0,
    current: 0, // 初始跳转index
    currentIndex: 0, // 当前的真实index,
    total: 0,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) { 
    // 接收record数据
    // const eventChannel = this.getOpenerEventChannel()
    // eventChannel.once('setRecordInfo', ({ recordInfo, fromAnswer}) => {
    //   this.setData({ recordInfo })
    //   if (fromAnswer) {
    //     this.setData({onlyRead: true})
    //     wx.setNavigationBarTitle({ title: '答题记录'})
    //   } else {
    //     this.setData({onlyRead: false})
    //   }
    // })
    console.log(options)
    const from = options.from
    try {
      const recordInfo = wx.getStorageSync('recordInfo')
      if (recordInfo && from !== 'home') {
        this.setData({ recordInfo })
        if (recordInfo.fromAnswer) {
          this.setData({onlyRead: true})
          wx.setNavigationBarTitle({ title: '答题记录'})
        } else {
          this.setData({onlyRead: false})
        }
      }
    } catch (e) {
      console.error(e)
    }

    if (!this.data.onlyRead) {
      wx.enableAlertBeforeUnload({
        message: "您还未完成本次评估，确定退出？",
        success: function (res) {
          console.log("未完成退出：", res);
        },
        fail: function (errMsg) {
          console.log("取消退出：", errMsg);
        },
      });
    }

    this.setData({
      swiperHeight: wx.getSystemInfoSync().windowHeight - 100,
    })

    this.getQuestionInfo() 
  },
  // 拉取问卷详情
  async getQuestionInfo() {
    // this.setData({loading: true})
    wx.showLoading({
      mask: true,
      title: '请稍后'
    })
    try {
      let questionnaireName
      const {recordInfo} = this.data
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

      this.setData({total: questionnaireInfo.questions.length})
      
      if (recordInfo) {
        const { answers } = recordInfo
        // 还原答案
        questionnaireInfo.questions.forEach(item => {
          answers.forEach(answer => {
            if (item.index === answer.questionIndex) {
              if (item.qType === 0) {
                item.selected = answer.selected ? answer.selected : ''
              } else if (item.qType === 1) {
                item.multiSelected = answer.selected ? answer.selected : []
              } else if (item.qType === 2) {
                if (answer.selected && answer.selected.length) {
                  item.options.forEach((o, i) => {
                    o.selected = answer.selected[i]
                  })
                }
              }
            }
          })
        })
        // 填充已完成的答案到answers
        const tempArr = []
        answers.forEach(a => {
          if (a.selected) {
            tempArr.push(a)
          }
        })
        this.setData({
          answers: tempArr
        })
      }
      // 添加答题卡swiper
      if (!this.data.onlyRead) {
        questionnaireInfo.questions.push({
          index: questionnaireInfo.questions.length,
          qType: -1, // -1-答题卡页
          answers: 
            Array.from({ length: questionnaireInfo.questions.length }, (v, i) => ({ 
              index: i, 
              selected: recordInfo ? recordInfo.answers[i].selected : null })),
        })
      }
      this.setData({
        questionnaireInfo
      })
    } catch (error) {
      console.error(error)
    }
    // this.setData({loading: false})
    wx.hideLoading()
    const firstJumpIndex = this.genFirstJumpIndex()
    this.jumpToQuestion(firstJumpIndex)
  },
  genFirstJumpIndex() {
    let index = 0
    if (this.data.recordInfo && !this.data.recordInfo.isFinish) {
      const { answers } = this.data.recordInfo
      const tempIndex = answers.findIndex(a => !a.selected)
      index = answers[tempIndex].questionIndex
    }
    return index
  },
  // 跳转答题页面
  jumpToQuestion(index) {
    this.setData({ swiperDuration: 0 })
    // 初始化到上次答题位置
    this.setData({ currentIndex: index })
    this.selectComponent('#swiper').init(index)
    // 恢复swiper动画
    this.setData({ swiperDuration: 500 })
  },
  // 题目切换
  handleQuestionChange(e) {
    // 返回当前的真实index
    const { current:realIndex } = e.detail
    this.setData({ currentIndex: realIndex })
  },
  // 选择器题目单项选择
  handlePickerQuestionConfirm(e) {
    const {questionIndex, optionIndex, selected} = e.detail
    const question = this.data.questionnaireInfo.questions[questionIndex]
    question.options[optionIndex].selected = selected
    const target = `questionnaireInfo.questions[${questionIndex}]`
    this.setData({
      [target]: question
    }) 
  },
  // 题目确认
  handleQuestionConfirm(e) {
    // console.log('select', e.detail)
    const { answers, currentIndex, questionnaireInfo } = this.data
    const length = questionnaireInfo.questions.length;
    const { qType, questionIndex, questionId, selected } = e.detail
    // 记录题目选项
    questionnaireInfo.questions.forEach((item, index) => {
      if (item._id === questionId) {
        if (qType === 0) {
          questionnaireInfo.questions[index].selected = selected
        } else if (qType === 1) {
          questionnaireInfo.questions[index].multiSelected = selected
        } else if (qType === 2) {
          questionnaireInfo.questions[index].pickerSelected = selected
        }
      }
    })
    // 填充最后一页答题记录
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
  handleRecordClick(e) {
    // 跳转到对应题目
    this.setData({ currentIndex: e.detail.index })
    this.selectComponent('#swiper').init(e.detail.index);
  },
  // 交卷
  // isFinish: false-中途退出
  async handleAnswerSubmit() {
    const userInfo = wx.getStorageSync('userInfo')
    const finishAll = this.data.answers.length === this.data.questionnaireInfo.questions.length - 1
    if (finishAll) {
      const score = this.calculateScore()
      const pullInfo = {
        userId: userInfo._id,
        questionnaireId: this.data.questionnaireInfo._id,
        questionnaireName: this.data.questionnaireInfo.name,
        answers: this.data.answers,
        score,
        isFinish: true
      }  
      const answerInfo = this.genAnswerInfo(pullInfo)
      await this.pullAnswers(pullInfo)
      this.navigateToAnswer(answerInfo)
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
              answers.splice(item.index, 0, {
                questionIndex: item.index,
                questionId: item._id,
                selected: null
              })
            }
          })
          this.setData({ answers })
        }
        const score = this.calculateScore()
        const pullInfo = {
          userId: userInfo._id,
          questionnaireId: this.data.questionnaireInfo._id,
          questionnaireName: this.data.questionnaireInfo.name,
          answers: this.data.answers,
          score,
          isFinish: false
        }
        const answerInfo = this.genAnswerInfo(pullInfo)
        await this.pullAnswers(pullInfo)
        this.navigateToAnswer(answerInfo)
      })
      .catch(() => {
        // on cancel
      });
    }
  },
  // 生成答案页信息
  genAnswerInfo(pullInfo) {
    let result = pullInfo
    let chartData = {}
    let bigPointChartData = []
    let smallPointChartData = []

    let tempObj = {}

    const {answers} = pullInfo
    const {questionnaireInfo} = this.data
    questionnaireInfo.questions = questionnaireInfo.questions.slice(0, questionnaireInfo.questions.length - 1)
    const {questions} = questionnaireInfo
    questions.forEach(q => {
      if (!tempObj[q.mainSort]) {
        tempObj[q.mainSort] = []
      }
    })
    Object.keys(tempObj).forEach(mainSort => {
      questions.forEach(q => {
        if (q.mainSort === mainSort) {
          if (tempObj[mainSort].length === 0 || !tempObj[mainSort].some(item => item.name === q.subSort)) {
            tempObj[mainSort].push({
              name: q.subSort,
              value: 0
            })
          }
        }
      })
    })

    let bigPointTemp = JSON.parse(JSON.stringify(tempObj))
    let smallPointTemp = JSON.parse(JSON.stringify(tempObj))

    Object.values(bigPointTemp).forEach(subArray => {
      subArray.forEach(sub => {
        const {name} = sub
        questions.forEach(q => {
          if (q.subSort === name) {
            let selected = null, qBigPoint = 0
            const index = answers.findIndex(a => a.questionId === q._id)
            if (index !== -1) {
              selected = answers[index].selected
            }
            if (selected !== null) {
              // 多选(包括正常多选和选择器)
              if (Array.isArray(selected)) {
                let tempBigPoint = 0;
                if (q.qType === 1) {
                  selected.forEach(s => {
                    q.options.forEach(option => {
                      if (option.title === s) {
                        tempBigPoint += option.bigPoint
                      }
                    })
                  })
                } else if (q.qType === 2) {
                  selected.forEach((s, i) => {
                    tempBigPoint += q.options[i].bigPoint * s
                  })
                }
                if (q.maxBigScore)
                  tempBigPoint = tempBigPoint <= q.maxBigScore ? tempBigPoint : q.maxBigScore
                qBigPoint += tempBigPoint
              } else {
                q.options.some(option => {
                  if (option.title === selected) {
                    qBigPoint = option.bigPoint
                    return true
                  }
                })
              }
            } else {
              qBigPoint = 0
            }   
            sub.value += qBigPoint
          }
        })
      })
    })

    Object.values(smallPointTemp).forEach(subArray => {
      subArray.forEach(sub => {
        const {name} = sub
        questions.forEach(q => {
          if (q.subSort === name) {
            let selected = null, qSmallPoint = 0
            const index = answers.findIndex(a => a.questionId === q._id)
            if (index !== -1) {
              selected = answers[index].selected
            }
            if (selected !== null) {
              if (Array.isArray(selected)) {
                let tempSmallPoint = 0
                if (q.qType === 1) {
                  selected.forEach(s => {
                    q.options.forEach(option => {
                      if (option.title === s) {
                        tempSmallPoint += option.smallPoint
                      }
                    })
                  })
                } else if (q.qType === 2) {
                  selected.forEach((s, i) => {
                    tempSmallPoint += q.options[i].smallPoint * s
                  })
                }
                if (q.maxSmallScore)
                  tempSmallPoint = tempSmallPoint <= q.maxSmallScore ? tempSmallPoint : q.maxSmallScore
                qSmallPoint += tempSmallPoint
              } else {
                q.options.some(option => {
                  if (option.title === selected) {
                    qSmallPoint = option.smallPoint
                    return true
                  }
                })
              }
            } else {
              qSmallPoint = 0
            }   
            sub.value += qSmallPoint
          }
        })
      })
    })

    Object.keys(bigPointTemp).forEach(key => {
      bigPointChartData.push({
        name: key,
        children: bigPointTemp[key]
      })
    })

    Object.keys(smallPointTemp).forEach(key => {
      smallPointChartData.push({
        name: key,
        children: smallPointTemp[key]
      })
    })

    chartData = {
      'bigPoint': bigPointChartData,
      'smallPoint': smallPointChartData
    }

    result.questionnaireInfo = questionnaireInfo
    result.chartData = chartData

    return result
  },
  // 推送答案
  async pullAnswers({ userId, questionnaireId, questionnaireName, answers, score, isFinish }) {
    // this.setData({ submitLoading: true })
    wx.showLoading({
      title: '正在提交请稍后',
      mask: true
    })
    let params = {
      type: 'addRecord',
      userId,
      questionnaireId,
      questionnaireName,
      answers,
      score,
      isFinish
    }
    if (this.data.recordInfo) {
      params.recordId = this.data.recordInfo._id
      params.type = 'updateRecordInfo'
    } 
    try {
      await requestCloud('studyAbroadAssistant', params)
    } catch (error) {
      console.error(error)
    }
    wx.hideLoading()
    // this.setData({ submitLoading: false })
  },
  // 计算得分并跳转到得分页
  calculateScore() {
    const { answers } = this.data
    const { questions } = this.data.questionnaireInfo
    let bigPoint = 0,
      smallPoint = 0
    answers.forEach(item => {
      if (item.selected) {
        const questionInfo = questions[item.questionIndex]
        const {qType, options, maxBigScore, maxSmallScore} = questionInfo
        if (qType === 0) {
          options.forEach(option => {
            if (option.title === item.selected) {
              bigPoint += option.bigPoint
              smallPoint += option.smallPoint
            }
          })
        } else if (qType === 1) {
          // 多选限制最高分
          let tempBigPoint = 0,
            tempSmallPoint = 0
          item.selected.forEach(s => {
            options.forEach(option => {
              if (option.title === s) {
                tempBigPoint += option.bigPoint
                tempSmallPoint += option.smallPoint
              }
            })
          })
          if (maxBigScore)
            tempBigPoint = tempBigPoint <= maxBigScore ? tempBigPoint : maxBigScore
          if (maxSmallScore)
            tempSmallPoint = tempSmallPoint <= maxSmallScore ? tempSmallPoint : maxSmallScore
          bigPoint += tempBigPoint
          smallPoint += tempSmallPoint
        } else if (qType === 2) {
          console.log('多选择器题')
          // 多选择器题
          let tempBigPoint = 0,
            tempSmallPoint = 0
          item.selected.forEach((s, index) => {
            tempBigPoint += options[index].bigPoint * s
            tempSmallPoint += options[index].smallPoint * s
          })
          if (maxBigScore)
            tempBigPoint = tempBigPoint <= maxBigScore ? tempBigPoint : maxBigScore
          if (maxSmallScore)
            tempSmallPoint = tempSmallPoint <= maxSmallScore ? tempSmallPoint : maxSmallScore
          bigPoint += tempBigPoint
          smallPoint += tempSmallPoint
        }
      }
    })
    return {
      bigPoint,
      smallPoint
    }
  },
  // 跳转答案页
  navigateToAnswer(answerInfo) {
    wx.navigateTo({
      url: '/packageCharts/pages/answer/index',
      success: res => {
        // 这里给要打开的页面传递数据.  第一个参数:方法key, 第二个参数:需要传递的数据
        res.eventChannel.emit('setAnswerInfo', {
          answerInfo
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  },
})