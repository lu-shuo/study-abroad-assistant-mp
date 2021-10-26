// components/virtual-swiper/index.js
const { VIRTUAL_SWIPER_LENGTH, START, END } = require('./config')

Component({
    /**
     * 组件的属性列表
     */
    properties: {
      height: { // 高度
        type: Number,
        value: 0
      },
      list: { // 真实数据列表
        type: Array,
        value: []
      },
      current: { // 真实索引
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
      'current': function(realIndex) {
        const virtualIndex = realIndex % VIRTUAL_SWIPER_LENGTH
        const { virtualSwiperIndex, virtualSwiperList } = this.data
        // 如果虚拟列表为空或者当前传入的索引不存在 return
        if (!virtualSwiperList.length || !virtualSwiperList[virtualIndex]) return
        // 传入的索引仍为当前值 return
        if (virtualIndex === virtualSwiperIndex && virtualSwiperList[virtualIndex].index === realIndex) return
        // 初始化swiper渲染列表
        this.init(realIndex, virtualIndex)
        // 如果virtualIndex没变，比如之前是1、点击后是4  之前是2、点击后是5
        // 那么不会走swiperChange的change方法，需要我们手动去给它加一个current，然后传出去
        if (virtualIndex === virtualSwiperIndex) {
          that.triggerEvent("swiperChange", { source: "", current: realIndex })
        }
      },
    },
    /**
     * 组件的初始数据
     */
    data: {
      virtualSwiperIndex: 0, // 虚拟索引
      virtualSwiperCurrent: 0, // 此值控制swiper的位置
      virtualSwiperList: [] // 当前渲染的数据
    },

    // lifetimes: {
    //   created: function() {
        
    //   },
    //   attached: function() {
    //     // 在组件实例进入页面节点树时执行
    //     this.init(this.data.current)
    //   },
    //   detached: function() {
    //     // 在组件实例被从页面节点树移除时执行
    //   },
    // },

    /**
     * 组件的方法列表
     */
    methods: {
      init(realIndex, virtualIndex) {
        const { list } = this.data
        if (!list || !list.length) return
        
        // 初始化虚拟列表
        let virtualList = []
        // 1. 获取当前虚拟索引的真实数据
        virtualList[virtualIndex] = list[realIndex]
        virtualList[this.getLastVirtualIndex[virtualIndex]] = this.getLastItem(list, realIndex)
        virtualList[this.getNextVirtualIndex[virtualIndex]] = this.getNextItem(list, realIndex)
        this.setData({
          virtualSwiperIndex: virtualIndex,
          virtualSwiperCurrent: virtualIndex,
          virtualSwiperList: virtualList
        })
        // if (list.length <= VIRTUAL_SWIPER_LENGTH) {
        //   this.setData({ renderList: list })
        //   return
        // }
        // let renderList = list.slice(current, current + VIRTUAL_SWIPER_LENGTH)
        // const length = renderList.length
        // if (length < 3) {
        //   renderList = list.slice(current - (VIRTUAL_SWIPER_LENGTH - length))
        // }
        
        // this.setData({ renderList })
        // console.log(this.data.renderList)
      },
      // 获取上一个虚拟索引
      getLastVirtualIndex(current) {
        return current > START ? current - 1 : END
      },
      // 获取下一个虚拟索引
      getNextVirtualIndex(current) {
        return current < END ? current + 1 : START
      },
      // 获取上一个item
      getLastItem(list, realIndex) {
        if (realIndex === 0) return null
        return list[realIndex - 1]
      },
      // 获取下一个item
      getNextItem(list, realIndex) {
        if (realIndex === list.length - 1) return null
        return list[realIndex + 1]
      },

      swiperChange(e) {
        const realIndex = this.data.renderList[e.detail.current].index
        if (realIndex > 0) {
          this.setData({ isCircular: true })
        } else {
          this.setData({ isCircular: false })
        }
        this.triggerEvent('swiperChange', this.data.renderList[e.detail.current].index)
      },
      handleOptionSelect(e) {
        this.triggerEvent('optionConfirm', e.detail)
      }
    }
})
