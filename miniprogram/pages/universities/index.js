// pages/universities/index.js
const { requestCloud } = require('../../utils/request')

let pageNo = 0 
let pageSize = 10 

Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataList: [],
    isFirst: true,
    loadMore: false, //"上拉加载"的变量，默认false，隐藏  
    loadAll: false //“没有数据”的变量，默认false，隐藏 
  },

  onLoad: function (options) {
    pageNo = 0
    pageSize = 10
  },

  async getListInfo() {
    if (this.data.loadMore) return
    if (pageNo > 0) {
      this.setData({
        loadMore: true, //把"上拉加载"的变量设为true，显示  
        loadAll: false //把“没有数据”设为false，隐藏  
      }) 
    }
    try {
      if (this.data.isFirst) {
        wx.showLoading({
          mask: true,
          title: '请稍后'
        })
      }
      const { result } = await requestCloud('studyAbroadAssistant', {
        type: 'getUniversityList',
        pageSize,
        pageNo
      })
      wx.hideLoading()
      if (result.data && result.data.length) {
        pageNo ++
        const list = this.data.dataList.concat(result.data)
        this.setData({
          dataList: list,
          loadMore: false,
          isFirst: false
        })
        // console.log(this.data.dataList)
      } else {
        this.setData({
          loadAll: true, // 把“没有数据”设为true，显示  
          loadMore: false, // 把"上拉加载"的变量设为false，隐藏  
          isFirst: false
        });
      }
    } catch (error) {
      wx.hideLoading()
      console.error(error)
      this.setData({
        loadAll: false,
        loadMore: false,
        isFirst: false
      });
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getListInfo()
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
    // console.log("上拉触底，加载更多")
    this.getListInfo()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})