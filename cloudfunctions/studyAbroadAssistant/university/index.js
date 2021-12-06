const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

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