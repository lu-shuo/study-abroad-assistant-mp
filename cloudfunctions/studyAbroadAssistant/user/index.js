const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

const user = db.collection('user')

// event 就是小程序端调用云函数时传入的参数，外加后端自动注入的小程序用户的 openid 和小程序的 appid。
// context 对象包含了此处调用的调用信息和运行状态，可以用它来了解服务运行的情况
exports.login = async (event, context) => {
  const { OPENID, APPID, UNIONID } = cloud.getWXContext()

  const { nickName, avatar } = event

  try {
    const result = await user.add({
      // data 字段表示需新增的 JSON 数据
      data: {
        _id: OPENID,
        APPID,
        UNIONID,
        nickName,
        avatar,
        gender: null,
        location: null,
        university: null,
        graduateTime: null,
        intendedUniversity: null,
        lastLoginTime: new Date(),
      }
    })
    return {
      code: 0,
      isFirst: true,
      result
    }
  } catch (error) {
    try {
      const userInfo = await user.doc(OPENID).get()
      return {
        code: 0,
        isFirst: false,
        result: userInfo
      }
    } catch (error) {
      return {
        code: 1,
        error
      }
    }
  }
}

exports.fillInfo = async (event, context) => {
  const { gender, location, university, graduateTime, intendedUniversity } = event
  const { OPENID } = event.userInfo
  try {
    const result = await user.where({
      _id: OPENID
    })
    .update({
      data: {
        gender,
        location,
        university,
        graduateTime,
        intendedUniversity
      },
    })
    return { code: 0, result }
  } catch (error) {
    return { code: 1, error }
  }
}
