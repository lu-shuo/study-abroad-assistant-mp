// pages/history/index.js
const { requestCloud } = require('../../utils/request')

let pageNo = 0 
let pageSize = 10 

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    userId: null,
    recordList: [],
    loadMore: false, //"上拉加载"的变量，默认false，隐藏  
    loadAll: false //“没有数据”的变量，默认false，隐藏 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { userId } = options
    if (userId) 
      this.setData({ userId })
    pageNo = 0
    pageSize = 10
  },

  async getRecordList() {
    
    let id,
      userId = this.data.userId

    if (!userId) {
      const userInfo = wx.getStorageSync('userInfo')
      id = userInfo._id
    } else {
      id = userId
    }

    if (this.data.loadMore) return
    if (pageNo > 0) {
      this.setData({
        loadMore: true, //把"上拉加载"的变量设为true，显示  
        loadAll: false //把“没有数据”设为false，隐藏  
      }) 
    }
    try {
      const { result } = await requestCloud('studyAbroadAssistant', {
        type: 'getRecordList',
        pageSize,
        pageNo,
        userId: id
      })

      if (result.data && result.data.length) {
        pageNo ++
        const list = this.data.recordList.concat(result.data)
        this.setData({
          recordList: list,
          loadMore: false,
        })

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
  handleCellClick(e) {
    console.log(e.currentTarget.dataset)
    const { isfinish: isFinish, recordid: recordId } = e.currentTarget.dataset
    if (isFinish) {
      // 已完成跳转答案页
      this.jumpToAnswer(recordId)
    } else {
      // 未完成继续答题
      this.jumpToQuestionnaire(recordId)
    }
  },
  async jumpToAnswer(id) {
    try {
      this.setData({loading: true})
      console.log(id)
      const res = await requestCloud('studyAbroadAssistant', {
        type: 'getAnswerInfo',
        recordId: id
      })
      console.log(res)
      // this.setData({loading: false})
      // if (result.data && result.data.length) {
      //   wx.navigateTo({
      //     url: '/packageCharts/pages/answer/index',
      //     success: res => {
      //       // 这里给要打开的页面传递数据.  第一个参数:方法key, 第二个参数:需要传递的数据
      //       res.eventChannel.emit('setAnswerInfo', {
      //         answerInfo: result.data[0],
      //       })
      //     },
      //   })
      // }
    } catch (error) {
      console.error(error)
      this.setData({loading: false})
    }

  },
  async jumpToQuestionnaire(id) {
    try {
      this.setData({loading: true})
      const { result } = await requestCloud('studyAbroadAssistant', {
        type: 'getRecordInfo',
        recordId: id
      })
      this.setData({loading: false})
      if (result.data && result.data.length) {
        wx.navigateTo({
          url: `/pages/questionnaire/index`,
          success: res => {
            // 这里给要打开的页面传递数据.  第一个参数:方法key, 第二个参数:需要传递的数据
            res.eventChannel.emit('setRecord', {
              recordInfo: result.data[0],
            })
          },
        });
      }
    } catch (error) {
      console.error(error)
      this.setData({loading: false})
    }
  },
  handleScrolltolower() {
    if (!this.data.loadAll)
      this.getRecordList()
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
    this.getRecordList()
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