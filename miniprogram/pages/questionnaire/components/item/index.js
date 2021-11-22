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
      info: {
        type: Object,
        value: {}
      },
      index: {
        type: Number,
        value: 0
      }
    },
    observers: {
      
    },
    /**
     * 组件的初始数据
     */
    data: {
      
    },

    onLoad() {
      console.log(this.index, this.height)
    },
    /**
     * 组件的方法列表
     */
    methods: {
      onOptionSelect(e) {
        const { info, index } = this.data;
        this.triggerEvent('selectOption', { questionIndex: index, questionId: info._id, selected: e.detail })
      },
      handleRecordClick(e) {
        const { index } = e.target.dataset
        this.triggerEvent('recordClick', { index })
      },
      confirmAnswer() {
        const isFinish = !this.data.info.answers.some(item => item.selected === null);
        this.triggerEvent('confirmAnswer', { isFinish })
      },
    }
})
