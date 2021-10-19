// pages/questionnaire/components/item/index.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
      height: {
        type: Number,
        value: 0
      },
      item: {
        type: Object,
        value: null
      },
      index: {
        type: Number,
        value: null
      }
    },
    observers: {
      'item': function(item) {
        console.log(item)
      }
    },
    /**
     * 组件的初始数据
     */
    data: {

    },

    /**
     * 组件的方法列表
     */
    methods: {

    }
})
