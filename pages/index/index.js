Page({
  data: {
    inputText: '',
    todos: [],
    doneCount: 0
  },

  onShow() {
    this.loadTodos()
  },

  /* 为每个待办条目附加显示用字段 */
  decorate(todo) {
    const children = todo.children || []
    const done = children.length > 0 && children.every(c => c.done)
    let progress = '空'
    let unfinished = 0
    if (children.length > 0) {
      const doneCount = children.filter(c => c.done).length
      progress = `${doneCount}/${children.length}`
      unfinished = children.length - doneCount
    }
    return { ...todo, _done: done, _progress: progress, _unfinished: unfinished }
  },

  /* 从本地缓存加载数据，固定项始终置顶 */
  loadTodos() {
    let todos = wx.getStorageSync('todos') || []
    todos = todos.map(item => this.decorate(item))
    // 固定项置顶
    const pinned = todos.filter(item => item.pinned)
    const normal = todos.filter(item => !item.pinned)
    todos = [...pinned, ...normal]
    const doneCount = todos.filter(item => item._done).length
    this.setData({ todos, doneCount })
  },

  /* 保存数据到本地缓存 */
  saveTodos(todos) {
    const raw = todos.map(item => {
      const { _done, _progress, ...rest } = item
      return rest
    })
    wx.setStorageSync('todos', raw)
    const decorated = todos.map(item => this.decorate(item))
    const doneCount = decorated.filter(item => item._done).length
    this.setData({ todos: decorated, doneCount })
  },

  /* 输入框内容变化 */
  onInput(e) {
    this.setData({ inputText: e.detail.value })
  },

  /* 添加待办事项 */
  addTodo() {
    const text = this.data.inputText.trim()
    if (!text) return

    const newTodo = this.decorate({
      id: Date.now().toString(),
      text,
      children: []
    })

    // 新事项插入到固定项之后、普通项之前
    const pinned = this.data.todos.filter(item => item.pinned)
    const normal = this.data.todos.filter(item => !item.pinned)
    const todos = [...pinned, newTodo, ...normal]
    this.setData({ inputText: '' })
    this.saveTodos(todos)
  },

  /* 点击进入详情页 */
  openDetail(e) {
    const id = e.currentTarget.dataset.id
    const todo = this.data.todos.find(item => item.id === id)
    wx.navigateTo({
      url: `../detail/detail?id=${id}&title=${encodeURIComponent(todo.text)}`
    })
  },

  /* 删除待办事项（固定项不可删除） */
  deleteTodo(e) {
    const id = e.currentTarget.dataset.id
    const todo = this.data.todos.find(item => item.id === id)
    if (todo && todo.pinned) {
      wx.showToast({ title: '该事项不可删除', icon: 'none', duration: 1500 })
      return
    }
    wx.showModal({
      title: '确认删除',
      content: '删除后其中的详细待办也会被清除',
      success: (res) => {
        if (res.confirm) {
          const todos = this.data.todos.filter(item => item.id !== id)
          this.saveTodos(todos)
        }
      }
    })
  }
})
