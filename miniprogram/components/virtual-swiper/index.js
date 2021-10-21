// components/virtual-swiper/index.js
const { VIRTUAL_SWIPER_LENGTH } = require('./config')

Component({
    /**
     * 组件的属性列表
     */
    properties: {
      height: { // 高度
        type: Number,
        value: 0
      },
      list: { // swiper渲染列表
        type: Array,
        value: []
      },
      current: { // 当前所在滑块的 index
        type: Number,
        value: 0
      },
      duration: { // 滑动动画时长
        type: Number,
        value: 500
      },
      total: { // 分页时需传此数据
        type: Number,
        value: 0
      }
    },
    observers: {
      'current': function(current) {
        const renderCurrent = current % VIRTUAL_SWIPER_LENGTH
        // console.log(renderCurrent)
        this.init(renderCurrent)
      },
    },
    /**
     * 组件的初始数据
     */
    data: {
      // 滑动到的位置
      swiperIndex: 0,
    // 此值控制swiper的位置
      swiperCurrent: 0, 
      renderList: [] // 当前渲染的数据
    },

    /**
     * 组件的方法列表
     */
    methods: {
      init(index) {
        const { list } = this.data
        if (!list || !list.length) return
        const startIndex = (index - 1) < 0 ? 0 : (index - 1)
        const finalIndex = index + 2
        this.setData({
          renderList: list.slice(startIndex, finalIndex)
        })
        // console.log(this.data.renderList)
      },
      swiperChange() {

      },
      handleOptionSelect(e) {
        this.triggerEvent('optionConfirm', e.detail)
      }
    }
})
