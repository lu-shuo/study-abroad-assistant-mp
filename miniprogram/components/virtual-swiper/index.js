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

    /**
     * 组件的方法列表
     */
    methods: {
      init(realIndex) {
        // console.log(realIndex, typeof realIndex)
        const { list } = this.data
        if (!list || !list.length) return
        const virtualIndex = realIndex % VIRTUAL_SWIPER_LENGTH 
        // 初始化虚拟列表
        let virtualList = []
        // 1. 获取当前虚拟索引的真实数据
        virtualList[virtualIndex] = list[realIndex]
        // 2. 获取前后项数据
        virtualList[this.getLastVirtualIndex(virtualIndex)] = this.getLastItem(list, realIndex)
        virtualList[this.getNextVirtualIndex(virtualIndex)] = this.getNextItem(list, realIndex)
        // console.log('[initList]：', virtualList)
        this.setData({
          virtualSwiperIndex: virtualIndex,
          virtualSwiperCurrent: virtualIndex,
          virtualSwiperList: virtualList
        })
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
        const current = e.detail.current
        const lastIndex = this.data.virtualSwiperIndex
        const currentItem = this.data.virtualSwiperList[current]
        const info = { source: e.detail.source }
        const isForward = (current > lastIndex) || (lastIndex === END && current === START)
        const isBackward = (current < lastIndex) || (lastIndex === START && current === END)
        // 正向滑动
        if (isForward) {
          // 滑动到最后一个
          if (currentItem === null) {
            info.current = this.data.list.length - 1
            this.triggerEvent('swiperChange', info)
            this.setData({
              virtualSwiperCurrent: lastIndex
            })
            return
          }
          // 不是真实数据最后一个则更新虚拟列表下一个的值
          this.setData({
            [`virtualSwiperList[${this.getNextVirtualIndex(current)}]`]: this.getNextItem(this.data.list, currentItem.index)
          })
        }
        if (isBackward) {
          if (currentItem === null) {
            info.current = 0
            this.triggerEvent('swiperChange', info)
            this.setData({
              virtualSwiperCurrent: lastIndex
            })
            return
          }
          // 不是真实数据第一个则更新虚拟列表上一个的值
          this.setData({
            [`virtualSwiperList[${this.getLastVirtualIndex(current)}]`]: this.getLastItem(this.data.list, currentItem.index)
          })
        }
        // 更新virtualSwiperIndex值
        this.setData({ virtualSwiperIndex: current })
        // 触发事件
        info.current = currentItem.index
        this.triggerEvent('swiperChange', info)
      },
      handleOptionSelect(e) {
        this.triggerEvent('optionConfirm', e.detail)
      },
      handleRecordClick(e) {
        this.triggerEvent('recordClick', e.detail)
      },
      handleConfirmAnswer(e) {
        this.triggerEvent('confirmAnswer', e.detail)
      }
    }
})
