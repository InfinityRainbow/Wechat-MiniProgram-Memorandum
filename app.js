App({
  onLaunch() {
    let todos = wx.getStorageSync('todos') || []
    let changed = false

    // 清理已存在的「生日集」
    const birthdayIdx = todos.findIndex(item => item.id === 'pinned-birthday')
    if (birthdayIdx !== -1) {
      todos.splice(birthdayIdx, 1)
      changed = true
    }

    // 确保「重要事项」始终存在且字段完整
    const important = todos.find(item => item.id === 'pinned-important')
    const defaults = {
      id: 'pinned-important',
      text: '重要事项',
      pinned: true,
      icon: '⭐',
      color: '#1976d2',
      bgColor: '#fff8e1',
      fontClass: '',
      children: []
    }
    if (!important) {
      todos.unshift(defaults)
      changed = true
    } else {
      // 补全旧数据可能缺失的字段
      Object.keys(defaults).forEach(key => {
        if (!(key in important)) {
          important[key] = defaults[key]
          changed = true
        }
      })
    }

    if (changed) {
      wx.setStorageSync('todos', todos)
    }
  }
})
