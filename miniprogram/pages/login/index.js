// pages/login/index.js
const { requestCloud } = require('../../utils/request')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: true,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName') // 如需尝试获取用户信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 查看缓存中有无用户数据，有则更新缓存中用户数据跳转首页，没有则不跳转显示登录按钮
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      wx.switchTab({
        url: '/pages/user/index',
        success: () => {
          this.login(userInfo, false)
        }
      })
      return;
    }
    if (!wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: false
      })
    }
  },
  async login(userInfo, isFirst = true) {
    if (isFirst) {
      this.setData({
        loading: true
      })
    }
    try {
      const res = await requestCloud('studyAbroadAssistant', {
        type: 'login',
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl
      })
      if (res.code === 0) {
        if (isFirst) {
          wx.setStorageSync('userInfo', res.result.data)
          this.setData({ loading: false })
          wx.switchTab({
            url: '/pages/user/index'
          })
        }
      }
    } catch (error) {
      console.error(error) 
    }
  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '用于完善用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      lang:"zh_CN",
      success: (res) => {
        try {
          this.login(res.userInfo, true)
        } catch (e) {
          console.error(e)
        }
      }
    })
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