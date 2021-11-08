const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

const user = db.collection('user')

const MAX_LIMIT = 100

// event 就是小程序端调用云函数时传入的参数，外加后端自动注入的小程序用户的 openid 和小程序的 appid。
// context 对象包含了此处调用的调用信息和运行状态，可以用它来了解服务运行的情况
exports.login = async (event, context) => {
  const { OPENID, APPID, UNIONID } = cloud.getWXContext()

  const { nickName, avatarUrl } = event

  let isFirst

  try {
    const res = await user.where({
      _id: OPENID
    }).get()
    // 不存在
    if (res.data.length === 0) {
      isFirst = true
      await user.add({
        // data 字段表示需新增的 JSON 数据
        data: {
          _id: OPENID,
          APPID,
          UNIONID,
          nickName,
          avatarUrl,
          gender: null,
          birthday: null,
          university: null,
          graduateTime: null,
          intendedUniversity: null,
          lastLoginTime: new Date().getTime(),
        }
      })
    } else {
      isFirst = false
      await user.doc(OPENID).update({
        data: {
          // 表示将 done 字段置为 true
          lastLoginTime: new Date().getTime()
        },
      })
    }
    const userInfo = await user.doc(OPENID).get()
    return {
      code: 0,
      isFirst,
      result: userInfo
    }
  } catch (error) {
    return {
      code: 1,
      error
    }
  }
}

exports.updateInfo = async (event, context) => {
  const { _id, gender, birthday, university, graduateTime, intendedUniversity } = event.userInfo
  console.log(gender, birthday, university, graduateTime, intendedUniversity, _id)
  try {
    const result = await user.doc(_id)
    .update({
      data: {
        gender,
        birthday,
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

exports.getUserList = async (event, context) => {
  const countResult = await user.count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = user.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  // 等待所有
  return (await Promise.all(tasks)).reduce((acc, cur) => {
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg,
    }
  })
}
