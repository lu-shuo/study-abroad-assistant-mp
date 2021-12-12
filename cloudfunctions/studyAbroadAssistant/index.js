const user = require('./user/index')
const questionnaire = require('./questionnaire/index')
const record = require('./record/index')
const university = require('./university/index')

// 云函数入口函数
exports.main = async (event, context) => {
  switch (event.type) {
    case 'login':
      return await user.login(event, context)
    case 'updateUserInfo':
      return await user.updateInfo(event, context)
    case 'getUserList':
      return await user.getUserList(event, context)
    case 'getQuestionnaireInfo':
      return await questionnaire.getQuestionnaireInfo(event, context)
    case 'submitEstimate':
      return await record.submitEstimate(event, context)
    case 'getRecordList':
      return await record.getRecordList(event, context)
    case 'getRecordInfo':
      return await record.getRecordInfo(event, context)
    case 'getAnswerInfo':
      return await record.getAnswerInfo(event, context)
    case 'getUniversityList':
      return await university.getUniversityList(event, context)
  }
}