export default defineAppConfig({
  pages: [
    'pages/event/index',
    'pages/spread/index',
    'pages/materials/index',
    'pages/event-detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1E3A8A',
    navigationBarTitleText: '公关应急助手',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#94A3B8',
    selectedColor: '#1E3A8A',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/event/index',
        text: '新增事件'
      },
      {
        pagePath: 'pages/spread/index',
        text: '扩散地图'
      },
      {
        pagePath: 'pages/materials/index',
        text: '回应材料夹'
      }
    ]
  }
})
