const cloud = require('wx-server-sdk')
const { main } = require('..')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

const record = db.collection('record')
const _ = db.command
const $ = db.command.aggregate
// event 就是小程序端调用云函数时传入的参数，外加后端自动注入的小程序用户的 openid 和小程序的 appid。
// context 对象包含了此处调用的调用信息和运行状态，可以用它来了解服务运行的情况
exports.submitEstimate = async (event, context) => {
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
    const result = await record.aggregate().match({ _id: recordId })
    .lookup({
      from: 'questionnaire',
      let: {
        questionnaireId: '$questionnaireId',
      },
      pipeline: $.pipeline()
        .match(_.expr(_.eq(['$_id', '$$questionnaireId'])))
        .done(),
      as: 'questionnaireInfo',
    })
    .end()
    
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
    const result = await record.aggregate().match({ _id: recordId })
    .lookup({
      from: 'questionnaire',
      let: {
        questionnaireId: '$questionnaireId',
      },
      pipeline: $.pipeline()
        .match(_.expr(_.eq(['$_id', '$$questionnaireId'])))
        .done(),
      as: 'questionnaireInfo',
    })
    .end()

    console.log(result)

    let chartData = {}
    let bigPointChartData

    if (result.list && result.list.length) {
      let tempObj
      // const answerInfo = result.data[0]
      const { answers, questionnaireInfo } = result.list[0]
      const { questions } = questionnaireInfo[0]
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
                val: 0
              })
            }
          }
        })
      })
      Object.values(tempObj).forEach(item => {
        const {name} = item
        questions.forEach(q => {
          if (q.subSort === name) {
            let selected, qBigPoint
            const index = answers.findIndex(a => a.questionId === q._id)
            if (index !== -1) {
              selected = answers[index].selected
            }
            qBigPoint = q.options.map(option => {
              if (option.title === selected) {
                return option.bigPoint
              }
            })
            item.val += qBigPoint
          }
        })
      })
      Object.keys(tempObj).forEach(key => {
        bigPointChartData.push({
          name: key,
          children: tempObj[key]
        })
      })
      
    }
    
    chartData.bigPoint = bigPointChartData

    result.list[0].chartData = chartData

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