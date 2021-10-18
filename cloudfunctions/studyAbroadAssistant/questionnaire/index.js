const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

const questionnaire = db.collection('questionnaire')

const _ = db.command
const $ = db.command.aggregate

exports.getQuestionnaireInfo = async (event, context) => {
  const { name } = event
  try {
    const result = await questionnaire.aggregate().match({ name })
    .lookup({
      from: 'question',
      let: {
        queArr: '$questions'
      },
      pipeline: $.pipeline()
        .match(_.expr($.in(['$_id', '$$queArr'])))
        .done(),
      as: 'questions',
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