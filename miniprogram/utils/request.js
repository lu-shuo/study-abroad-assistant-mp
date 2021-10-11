const Noop = () => {}
function requestCloud(name, data, completeCallback = Noop) {
    return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
            name,
            data,
            success: (res) => {
                resolve(res.result)
            },
            fail: (err) => {
                reject(err)
            },
            complete: completeCallback
        })
    })
}
module.exports = {
    requestCloud
}