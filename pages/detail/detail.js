Page({
  data: {
    folderId: '',
    folderTitle: '',
    inputText: '',
    children: [],
    doneCount: 0
  },

  onLoad(options) {
    const { id, title } = options
    this.setData({
      folderId: id,
      folderTitle: decodeURIComponent(title || '待办详情')
    })
    wx.setNavigationBarTitle({ title: decodeURIComponent(title || '待办详情') })
    this.loadChildren()
  },

  /* 从缓存加载当前文件夹的子待办 */
  loadChildren() {
    const todos = wx.getStorageSync('todos') || []
    const folder = todos.find(item => item.id === this.data.folderId)
    const children = folder ? (folder.children || []) : []
    const doneCount = children.filter(c => c.done).length
    this.setData({ children, doneCount })
  },

  /* 保存子待办并同步回主缓存 */
  saveChildren(children) {
    const todos = wx.getStorageSync('todos') || []
    const index = todos.findIndex(item => item.id === this.data.folderId)
    if (index !== -1) {
      todos[index].children = children
      wx.setStorageSync('todos', todos)
    }
    const doneCount = children.filter(c => c.done).length
    this.setData({ children, doneCount })
  },

  /* 输入框内容变化 */
  onInput(e) {
    this.setData({ inputText: e.detail.value })
  },

  /* 添加子待办 */
  addChild() {
    const text = this.data.inputText.trim()
    if (!text) return

    const newChild = {
      id: Date.now().toString(),
      text,
      done: false
    }

    const children = [...this.data.children, newChild]
    this.setData({ inputText: '' })
    this.saveChildren(children)
  },

  /* 切换子待办完成状态 */
  toggleChild(e) {
    const id = e.currentTarget.dataset.id
    const children = this.data.children.map(item => {
      if (item.id === id) {
        return { ...item, done: !item.done }
      }
      return item
    })
    this.saveChildren(children)
  },

  /* 删除子待办 */
  deleteChild(e) {
    const id = e.currentTarget.dataset.id
    const children = this.data.children.filter(item => item.id !== id)
    this.saveChildren(children)
  },

  /* 清除已完成的子待办 */
  clearDoneChildren() {
    const children = this.data.children.filter(item => !item.done)
    if (children.length === this.data.children.length) {
      wx.showToast({ title: '没有已完成的待办', icon: 'none', duration: 1500 })
      return
    }
    wx.showModal({
      title: '确认清除',
      content: '是否清除所有已完成条目？',
      success: (res) => {
        if (res.confirm) {
          this.saveChildren(children)
          wx.showToast({ title: '已清除', icon: 'success', duration: 1000 })
        }
      }
    })
  }
})
