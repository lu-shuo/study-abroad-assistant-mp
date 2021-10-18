const { requestCloud } = require('../../utils/request')
// pages/user/index.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    saving: false,
    hasUserInfo: false,
    userInfo: {},
    edit: false,
    showTimePicker: false,
    timeType: '',
    currentDate: new Date().getTime(),
    minDate: new Date(1920, 1, 1).getTime(),
    formatter(type, value) {
      if (type === 'year') {
        return `${value}年`;
      }
      if (type === 'month') {
        return `${value}月`;
      }
      if (type === 'day') {
        return `${value}日`;
      }
      return value;
    },
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initUserInfo();
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },
  initUserInfo() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        hasUserInfo: true
      })
    }
  },
  setUserInfo() {
    wx.setStorageSync('userInfo', this.data.userInfo)
  },
  onEdit() {
    this.setData({ edit: true })
  },
  async onSave() {
    this.setData({ saving: true })
    this.setUserInfo()
    try {
      const res = await requestCloud('studyAbroadAssistant', {
        type: 'updateUserInfo',
        userInfo: this.data.userInfo
      })
      console.log(res)
      this.setData({ edit: false, saving: false })
    } catch (error) {
      console.error(error)
      this.setData({ saving: false })
    }
  },
  onShowTimePicker(e) {
    const type = e.currentTarget.dataset.type
    this.setData({showTimePicker: true, timeType: type})
  },
  onTimePickerConfirm(event) {
    this.setData({
      showTimePicker: false,
      currentDate: event.detail,
    });
    if (this.data.timeType === 'birthday') {
      this.setData({
        ['userInfo.birthday']: event.detail,
      });
    } else if (this.data.timeType === 'graduateTime') {
      this.setData({
        ['userInfo.graduateTime']: event.detail,
      });
    }
  },
  onLogout() {
    this.setData({
      userInfo: {},
      hasUserInfo: false
    })
    wx.removeStorageSync('userInfo')
    wx.reLaunch({
      url: '../login/index'
    })
  },
  jumpToEdit(e) {
    const type = e.currentTarget.dataset.type
    const { userInfo } = this.data
    wx.navigateTo({
      url: '/pages/edit/index',
      success: res => {
        // 这里给要打开的页面传递数据.  第一个参数:方法key, 第二个参数:需要传递的数据
        res.eventChannel.emit('setUserInfoAndType', {
          type,
          userInfo
        })
      },
      events: {
        // 这里用来接收后面页面传递回来的数据
        updateUserInfo: (newVal) => {
          // 这里处理数据即可
          this.setData({
            userInfo: Object.assign(userInfo, newVal)
          })
        }
      } 
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})