// pages/edit/index.js
const TITLE_MAP = {
  'gender': '性别',
  'birthday': '生日',
  'university': '我的大学',
  'graduateTime': '毕业时间',
  'intendedUniversity': '意向留学院校',
}
Page({

    /**
     * 页面的初始数据
     */
    data: {
      type: '',
      userInfo: {},
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      let eventChannel = this.getOpenerEventChannel()
      // 事件名和上个页面设置的相同即可
      eventChannel.on('setUserInfoAndType', ({ type, userInfo }) => {
        this.setData({  
          type: type || '',
          userInfo: userInfo || {}
        })
      })
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
      
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
      wx.setNavigationBarTitle({ title: TITLE_MAP[this.data.type]})
    },

    onRadioChange(event) {
      this.setData({
        ['userInfo.gender']: event.detail,
      });
      // console.log(this.data.userInfo)
    },
  
    onRadioClick(event) {
      const { name } = event.currentTarget.dataset;
      this.setData({
        ['userInfo.gender']: name,
      });
      wx.setStorageSync('userInfo', this.data.userInfo)
      wx.navigateBack({
        delta: 1,
      })
      // console.log(this.data.userInfo)
    },

    onInputChange(event) {
      const { type } = event.currentTarget.dataset;
      if (type === 'university') {
        this.setData({
          ['userInfo.university']: event.detail
        })
      } else if (type === 'intendedUniversity') {
        this.setData({
          ['userInfo.intendedUniversity']: event.detail
        })
      }
      
    },
    onSaveInput() {
      wx.setStorageSync('userInfo', this.data.userInfo)
      wx.navigateBack({
        delta: 1,
      })
    },
    


    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})