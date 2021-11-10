// index.js
// const app = getApp()
const { envList } = require('../../envList.js');

Page({
  data: {
    showUploadTip: false,
    powerList: [
      {
        title: '用户',
        tip: '查看用户信息、评估记录',
        page: 'adminUser'
      }, 
      {
        title: '题目',
        tip: '添加、编辑题库',
        showItem: false,
        item: [
          {
            title: '添加题目',
            page: 'adminQuestion'
          },
          {
            title: '编辑题目',
            page: 'adminQuestion'
          }
        ]
      }, 
      {
        title: '问卷',
        tip: '添加、编辑问卷',
        showItem: false,
        item: [
          {
            title: '添加问卷',
            page: 'createCollection'
          },
          {
            title: '编辑问卷',
            page: 'updateRecord'
          }
        ]
      },
    ],
    envList,
    selectedEnv: envList[0],
    haveCreateCollection: false
  },

  onClickPowerInfo(e) {
    const index = e.currentTarget.dataset.index;
    const powerList = this.data.powerList;
    powerList[index].showItem = !powerList[index].showItem;
    if (powerList[index].title === '数据库' && !this.data.haveCreateCollection) {
      this.onClickDatabase(powerList);
    } else {
      this.setData({
        powerList
      });
    }
  },

  onChangeShowEnvChoose() {
    wx.showActionSheet({
      itemList: this.data.envList.map(i => i.alias),
      success: (res) => {
        this.onChangeSelectedEnv(res.tapIndex);
      },
      fail (res) {
        console.log(res.errMsg);
      }
    });
  },

  onChangeSelectedEnv(index) {
    if (this.data.selectedEnv.envId === this.data.envList[index].envId) {
      return;
    }
    const powerList = this.data.powerList;
    powerList.forEach(i => {
      i.showItem = false;
    });
    this.setData({
      selectedEnv: this.data.envList[index],
      powerList,
      haveCreateCollection: false
    });
  },

  jumpPage(e) {
    wx.navigateTo({
      url: `/pages/${e.currentTarget.dataset.page}/index`,
    });
  },
});
