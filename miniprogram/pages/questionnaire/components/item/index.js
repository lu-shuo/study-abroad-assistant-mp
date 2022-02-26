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
        value: {},
        observer: function(newVal) {
          if (newVal) {
            if (newVal.qType === 1) {
              this.setData({
                multiSelected: newVal.multiSelected 
              })
            } else if (newVal.qType === 2) {
              const {options} = newVal
              const tempArr = []
              options.forEach((o) => {
                tempArr.push(
                  Array.from({length: (o.max - o.min + 1)}, (v, i) => i)
                )
              })
              this.setData({
                columnsArr: tempArr
              })
            }
          }
        },
      },
      index: {
        type: Number,
        value: 0
      },
      onlyRead: {
        type: Boolean,
        value: false
      }
    },
    /**
     * 组件的初始数据
     */
    data: {
      multiSelected: [], // 多选题答案数组
      disableMultiConfirm: false,
      // pickerSelected: [], // 选择器答案数组
      show: false, // 弹出层
      currentPickerIndex: null,
      columnsArr: [],
      // columns: [0, 1, 2, 3, 4],
    },
    observers: {
      'multiSelected': function(newVal) {
        if (newVal) {
          if (!newVal.length) {
            this.setData({
              disableMultiConfirm: true
            })
          } else {
            this.setData({
              disableMultiConfirm: false
            })
          }
        }
      },
    },
    onLoad() {
    },
    /**
     * 组件的方法列表
     */
    methods: {
      // 单选
      onSingleOptionSelect(e) {
        const { info, index } = this.data
        this.triggerEvent('selectOption', { qType: 0, questionIndex: index, questionId: info._id, selected: e.detail })
      },
      // 多选
      onMultiOptionSelect(e) {
        this.setData({
          multiSelected: e.detail
        })
      },
      multiOptionConfirm() {
        const { info, index, multiSelected } = this.data
        this.triggerEvent('selectOption', { qType: 1, questionIndex: index, questionId: info._id, selected: multiSelected })
        this.setData({
          multiSelected: []
        })
      },
      // 选择器
      showPopup(e) {
        const index = e.currentTarget.dataset.index
        this.setData({show: true, currentPickerIndex: index})
      },
      onPickerClose() {
        this.setData({show: false})
      },
      onPickerConfirm(e) {
        const { value } = e.detail;
        const { index, currentPickerIndex } = this.data
        this.triggerEvent('pickerOptionConfirm', { questionIndex: index, optionIndex: currentPickerIndex, selected: value})
        const target = `info.options[${currentPickerIndex}].selected`
        this.setData({
          [target]: value,
          show: false,
          currentPickerIndex: null
        })
      },
      // 选择器全部选完确认按钮
      pickerOptionConfirm() {
        const { info, index } = this.data
        const options = info.options
        const selected = []
        options.forEach(o => {
          selected.push(o.selected)
        })
        this.triggerEvent('selectOption', { qType: 2, questionIndex: index, questionId: info._id, selected })
      },
      // 答题卡页面点击跳转
      handleRecordClick(e) {
        const { index } = e.target.dataset
        this.triggerEvent('recordClick', { index })
      },
      // 提交答案
      submitAnswer() {
        // const isFinish = !this.data.info.answers.some(item => item.selected === null);
        this.triggerEvent('submitAnswer')
      },
    }
})
