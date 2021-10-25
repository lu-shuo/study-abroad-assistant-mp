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
      list: { // 实际数据列表
        type: Array,
        value: []
      },
      current: { // 真实的current
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
        // 超过合法范围
        if (current > this.data.list.length - 1 || current < 0) return
        // 初始化swiper渲染列表
        this.init(current)
      },
    },
    /**
     * 组件的初始数据
     */
    data: {
      realCurrent: 0, // 实际位置
    // 此值控制swiper的位置
      swiperCurrent: 0, 
      renderList: [] // 当前渲染的数据
    },

    /**
     * 组件的方法列表
     */
    methods: {
      init(current) {
        const { list } = this.data
        if (!list || !list.length) return
        if (list.length <= VIRTUAL_SWIPER_LENGTH) {
          this.setData({ renderList: list })
          return
        }
        let renderList = list.slice(current, current + VIRTUAL_SWIPER_LENGTH)
        const length = renderList.length
        if (length < 3) {
          renderList = list.slice(current - (VIRTUAL_SWIPER_LENGTH - length))
        }
        
        this.setData({ renderList })
        console.log(this.data.renderList)
      },
      swiperChange(e) {
        this.triggerEvent('swiperChange', e.detail)
      },
      handleOptionSelect(e) {
        this.triggerEvent('optionConfirm', e.detail)
      }
    }
})
