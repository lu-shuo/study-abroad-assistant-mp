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
    loadMore: false, //"上拉加载"的变量，默认false，隐藏  
    loadAll: false //“没有数据”的变量，默认false，隐藏 
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
      const { result } = await requestCloud('studyAbroadAssistant', {
        type: 'getUniversityList',
        pageSize,
        pageNo
      })
      if (result.data && result.data.length) {
        pageNo ++
        const list = this.data.dataList.concat(result.data)
        this.setData({
          dataList: list,
          loadMore: false
        })
        console.log(this.data.dataList)
      } else {
        this.setData({
          loadAll: true, // 把“没有数据”设为true，显示  
          loadMore: false // 把"上拉加载"的变量设为false，隐藏  
        });
      }
    } catch (error) {
      console.error(error)
      this.setData({
        loadAll: false,
        loadMore: false
      });
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    console.log("上拉触底，加载更多")
    this.getListInfo()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})