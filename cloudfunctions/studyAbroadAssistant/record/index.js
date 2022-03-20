const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

const record = db.collection('record')
const _ = db.command
const $ = db.command.aggregate
// event 就是小程序端调用云函数时传入的参数，外加后端自动注入的小程序用户的 openid 和小程序的 appid。
// context 对象包含了此处调用的调用信息和运行状态，可以用它来了解服务运行的情况
exports.addRecord = async (event, context) => {
  const { userId, questionnaireId, questionnaireName, answers, score, isFinish } = event
  try {
    const result = await record.add({
      // data 字段表示需新增的 JSON 数据
      data: {
        userId,
        questionnaireId,
        questionnaireName,
        answers,
        score,
        isFinish,
        submitTime: new Date().getTime(),
      }
    })
    return {
      code: 0,
      result
    }
  } catch (error) {
    return {
      code: 1,
      error
    }
  }
}

exports.updateRecordInfo = async (event) => {
  const { recordId, userId, questionnaireId, questionnaireName, answers, score, isFinish } = event
  try {
    const result = await record.doc(recordId).update({
      // data 字段表示需新增的 JSON 数据
      data: {
        userId,
        questionnaireId,
        questionnaireName,
        answers,
        score,
        isFinish,
        submitTime: new Date().getTime(),
      }
    })
    return {
      code: 0,
      result
    }
  } catch (error) {
    return {
      code: 1,
      error
    }
  }
}

exports.getRecordList = async (event, context) => {
  const { userId } = event

  const { pageNo, pageSize } = event

  try {
    const result = await record.where({
      userId
    }).skip(pageNo * pageSize).limit(pageSize).get()

    return {
      code: 0,
      result
    }
  } catch (error) {
    return {
      code: 1,
      error
    }
  }
}

exports.getRecordInfo = async (event) => {
  const { recordId } = event

  try {
    const result = await record.doc(recordId).get()

    const { questionnaireName } = result.data

    const res = await cloud.callFunction({
      name: 'studyAbroadAssistant',
      data: {
        type: 'getQuestionnaireInfo',
        name: questionnaireName
      }
    })
    
    const questionnaireInfo = res.result.result.list[0]

    result.data.questionnaireInfo = questionnaireInfo
    
    return {
      code: 0,
      result
    }
  } catch (error) {
    return {
      code: 1,
      error
    }
  }
}

exports.getAnswerInfo = async (event) => {
  const { recordId } = event

  try {
    const result = await record.doc(recordId).get()

    const { questionnaireName } = result.data

    const res = await cloud.callFunction({
      name: 'studyAbroadAssistant',
      data: {
        type: 'getQuestionnaireInfo',
        name: questionnaireName
      }
    })
    
    const questionnaireInfo = res.result.result.list[0]

    result.data.questionnaireInfo = questionnaireInfo

    // let chartData = {}
    // let bigPointChartData = []
    // let smallPointChartData = []

    // let tempObj = {}
    // // const answerInfo = result.data[0]
    // const { answers } = result.data
    // const { questions } = questionnaireInfo
    // questions.forEach(q => {
    //   if (!tempObj[q.mainSort]) {
    //     tempObj[q.mainSort] = []
    //   }
    // })
    
    // Object.keys(tempObj).forEach(mainSort => {
    //   questions.forEach(q => {
    //     if (q.mainSort === mainSort) {
    //       if (tempObj[mainSort].length === 0 || !tempObj[mainSort].some(item => item.name === q.subSort)) {
    //         tempObj[mainSort].push({
    //           name: q.subSort,
    //           value: 0
    //         })
    //       }
    //     }
    //   })
    // })

    // let smallPointTemp = JSON.parse(JSON.stringify(tempObj))
    // let bigPointTemp = JSON.parse(JSON.stringify(tempObj))

    // Object.values(bigPointTemp).forEach(subArray => {
    //   subArray.forEach(sub => {
    //     const {name} = sub
    //     questions.forEach(q => {
    //       if (q.subSort === name) {
    //         let selected = null, qBigPoint = 0
    //         const index = answers.findIndex(a => a.questionId === q._id)
    //         if (index !== -1) {
    //           selected = answers[index].selected
    //         }
    //         if (selected !== null) {
    //           // 多选
    //           if (Array.isArray(selected)) {
    //             let tempBigPoint = 0;
    //             if (q.qType === 1) {
    //               selected.forEach(s => {
    //                 q.options.forEach(option => {
    //                   if (option.title === s) {
    //                     tempBigPoint += option.bigPoint
    //                   }
    //                 })
    //               })
    //             } else if (q.qType === 2) {
    //               selected.forEach((s, i) => {
    //                 tempBigPoint += q.options[i].bigPoint * s
    //               })
    //             }
    //             if (q.maxBigScore)
    //               tempBigPoint = tempBigPoint <= q.maxBigScore ? tempBigPoint : q.maxBigScore
    //             qBigPoint += tempBigPoint
    //           } else {
    //             q.options.some(option => {
    //               if (option.title === selected) {
    //                 qBigPoint = option.bigPoint
    //                 return true
    //               }
    //             })
    //           }
    //         } else {
    //           qBigPoint = 0
    //         }   
    //         sub.value += qBigPoint
    //       }
    //     })
    //   })
    // })

    // Object.values(smallPointTemp).forEach(subArray => {
    //   subArray.forEach(sub => {
    //     const {name} = sub
    //     questions.forEach(q => {
    //       if (q.subSort === name) {
    //         let selected = null, qSmallPoint = 0
    //         const index = answers.findIndex(a => a.questionId === q._id)
    //         if (index !== -1) {
    //           selected = answers[index].selected
    //         }
    //         if (selected !== null) {
    //           // 多选
    //           if (Array.isArray(selected)) {
    //             let tempSmallPoint = 0
    //             if (q.qType === 1) {
    //               selected.forEach(s => {
    //                 q.options.forEach(option => {
    //                   if (option.title === s) {
    //                     tempSmallPoint += option.smallPoint
    //                   }
    //                 })
    //               })
    //             } else if (q.qType === 2) {
    //               selected.forEach((s, i) => {
    //                 tempSmallPoint += q.options[i].smallPoint * s
    //               })
    //             } 
    //             if (q.maxSmallScore)
    //               tempSmallPoint = tempSmallPoint <= q.maxSmallScore ? tempSmallPoint : q.maxSmallScore
    //             qSmallPoint += tempSmallPoint
    //           } else {
    //             q.options.some(option => {
    //               if (option.title === selected) {
    //                 qSmallPoint = option.smallPoint
    //                 return true
    //               }
    //             })
    //           }
    //         } else {
    //           qSmallPoint = 0
    //         }   
    //         sub.value += qSmallPoint
    //       }
    //     })
    //   })
    // })

    // Object.keys(bigPointTemp).forEach(key => {
    //   bigPointChartData.push({
    //     name: key,
    //     children: bigPointTemp[key]
    //   })
    // })

    // Object.keys(smallPointTemp).forEach(key => {
    //   smallPointChartData.push({
    //     name: key,
    //     children: smallPointTemp[key]
    //   })
    // })

    // chartData = {
    //   'bigPoint': bigPointChartData,
    //   'smallPoint': smallPointChartData
    // }

    // result.data.chartData = chartData

    return {
      code: 0,
      result
    }
  } catch (error) {
    return {
      code: 1,
      error
    }
  }
}

exports.deleteRecord = async (event) => {
  const { recordId } = event
  try {
    const result = await record.doc(recordId).remove()
    return {
      code: 0,
      result
    }
  } catch (error) {
    return {
      code: 1,
      error
    }
  }
}