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
      question: {
        type: Object,
        value: null
      },
      index: {
        type: Number,
        value: null
      }
    },
    observers: {
      
    },
    /**
     * 组件的初始数据
     */
    data: {
      select: '',
    },

    /**
     * 组件的方法列表
     */
    methods: {
      onOptionSelect(e) {
        this.setData({
          select: e.detail,
        });
        const { question, index } = this.data;
        const { options } = question;
        const selected = options.find(item => item.title === e.detail)
        this.triggerEvent('selectOption', { questionIndex: index, questionId: question._id, selected })
      }
    }
})
