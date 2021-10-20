// pages/questionnaire/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    questionInfo: {},
    loading: false,
    swiperDuration: 0,
    current: 0,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      swiperHeight: wx.getSystemInfoSync().windowHeight,
    })
    this.getQuestionInfo()
  },
  async getQuestionInfo() {
    // 拉取问卷详情
    this.setData({loading: true})
    try {
      // const res = await wx.$requestCloud('studyAbroadAssistant', {
      //   type: 'getQuestionnaireInfo',
      //   name: '留学择校评估问卷'
      // })
      this.setData({
        // questionInfo: res.result.list[0]
        questionInfo: {
          "_id": "9e7190f1616ce24d008b1cb50dfc9ea8",
          "name": "留学择校评估问卷",
          "questions": [
            {
              "_id": "83cfc1ac6162b096006f848515561b57",
              "title": "您所在高校的大学类别（前100且高水平大学，请参照上交软科排名）",
              "options": [
                {
                  "index": "A",
                  "content": "985",
                  "smallPoint": 3,
                  "bigPoint": 10,
                  "selected": false
                },
                {
                  "index": "B",
                  "content": "211",
                  "smallPoint": 2.1,
                  "bigPoint": 7,
                  "selected": false
                },
                {
                  "index": "C",
                  "content": "前100且高水平大学",
                  "smallPoint": 1.5,
                  "bigPoint": 5,
                  "selected": false
                },
                {
                  "index": "D",
                  "content": "其他普通本科院校",
                  "smallPoint": 0.6,
                  "bigPoint": 2,
                  "selected": false
                },
                {
                  "index": "E",
                  "content": "民办本科院校",
                  "smallPoint": 0,
                  "bigPoint": 0,
                  "selected": false
                }
              ],
              "qType": 0,
              "mainSort": "知识",
              "subSort": "学业表现"
            },
            {
              "_id": "83cfc1ac6162b096006f8486779dd461",
              "title": "您所在专业入学至今的本科总GPA（注：还未完成本科学业的测试者，建议从学院教学秘书获取）",
              "options": [
                {
                  "index": "A",
                  "content": "4.0以上",
                  "smallPoint": 20,
                  "bigPoint": 90
                },
                {
                  "index": "B",
                  "content": "3.5-3.9",
                  "smallPoint": 18,
                  "bigPoint": 81
                },
                {
                  "index": "C",
                  "content": "3.0-3.4",
                  "smallPoint": 16,
                  "bigPoint": 72
                },
                {
                  "index": "D",
                  "content": "2.5-2.9",
                  "smallPoint": 12,
                  "bigPoint": 54
                },
                {
                  "index": "E",
                  "content": "2.0-2.4",
                  "smallPoint": 8,
                  "bigPoint": 36
                },
                {
                  "index": "F",
                  "content": "1.0-1.9",
                  "smallPoint": 4,
                  "bigPoint": 18
                }
              ],
              "qType": 0,
              "mainSort": "知识",
              "subSort": "学业表现"
            }
          ]
        }
      })
    } catch (error) {
      console.error(error)
    }
    this.setData({loading: false})
    // 初始化到上次答题位置
    this.selectComponent('#swiper').init(0);
    // 恢复swiper动画
    this.setData({ swiperDuration: 500 })
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