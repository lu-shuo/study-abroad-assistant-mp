// pages/adminUser/index.js
const { requestCloud } = require('../../utils/request')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userList: [],
    showKeyList: [
      {
        key: 'gender',
        value: '性别'
      },
      {
        key: 'birthday',
        value: '生日'
      },
      {
        key: 'university',
        value: '在读大学'
      },
      {
        key: 'intendedUniversity',
        value: '意向院校'
      },
      {
        key: 'graduateTime',
        value: '毕业时间'
      }
    ] 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getUserList()
  },
  async getUserList() {
    const res = await requestCloud('studyAbroadAssistant', {
      type: 'getUserList',
    })
    res.data.forEach(item => {
      item.showItem = false;
    })
    this.setData({
      userList: res.data
    })
  },
  onClickUserInfo(e) {
    const index = e.currentTarget.dataset.index;
    const userList = this.data.userList;
    userList[index].showItem = !userList[index].showItem;
    this.setData({ userList })
  },

  jumpToRecord(e) {
    const {userid} = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/history/index?userId=${userid}`,
    });
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