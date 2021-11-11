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
exports.submitEstimate = async (event, context) => {
  const { userId, questionnaireId, answers, score, isFinish } = event
  try {
    const result = await record.add({
      // data 字段表示需新增的 JSON 数据
      data: {
        userId,
        questionnaireId,
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

exports.getRecord = async (event, context) => {
  const { userId } = event
  console.log(userId)
  try {
    const result = await record.aggregate().match({ userId })
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