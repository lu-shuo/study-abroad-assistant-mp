const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

const university = db.collection('university')

exports.getUniversityList = async (event, context) => {
  const { pageNo, pageSize } = event
  try {
    const result = await university.skip(pageNo * pageSize).limit(pageSize).get()
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

exports.getSuitableUniversityList = async (event, context) => {
  const { bigPoint } = event
  try {
    const result = await university.where({
      score: _.lte(bigPoint)
    }).get()
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