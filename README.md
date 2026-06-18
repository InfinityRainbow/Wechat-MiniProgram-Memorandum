# 待办清单 · 微信小程序

一个简约清新的微信原生待办事项小程序，支持两级嵌套管理，数据全部存储在本地缓存中。

---

## 功能一览

### 双层待办结构

- **主页面** — 展示所有"待办事项"，每一条相当于一个文件夹
- **详情页** — 点击任一事项进入，管理该事项下的"详细待办"（子条目）
- 事项内的所有子待办全部完成时，主页面该事项前的方块由**红色变为绿色**，表示已完成；没有任何子待办时不变色

### 固定事项

系统内置一条不可移除的 **「重要事项」**：

| 特性 | 说明 |
|---|---|
| 图标 | ⭐ 黄色五角星 |
| 文字 | 蓝色加粗 |
| 删除 | 不可删除、不可清除 |
| 排序 | 始终置顶 |

> 固定项在 `app.js` 启动时通过 `pinned: true` 标记自动创建并补全缺失字段。

### 操作交互

| 操作 | 位置 | 行为 |
|---|---|---|
| 新建事项 | 主页面底部输入框 + 圆形 `+` 按钮 | 新增一条事项，排在固定项之后 |
| 进入详情 | 点击事项条目 | 跳转详情页，顶部导航栏显示事项名称 |
| 删除事项 | 条目右侧 `✕` 按钮 | 弹窗确认后删除，连同子待办一并清除 |
| 添加子待办 | 详情页顶部输入框 | 在该事项下新增一条子待办 |
| 切换完成 | 点击子待办条目 | 勾选圆圈切换完成/未完成状态 |
| 删除子待办 | 子待办右侧 `✕` 按钮 | 直接删除 |
| 清除已完成 | 详情页统计条「清除已完成条目」 | 弹窗确认后批量移除已完成子待办 |

### 状态提示

- 主页面每条事项下方显示进度（如 `2/5` 或 `空`）
- 未全部完成的事项右侧显示红色提示：**`还有n条未完成`**
- 详情页统计条显示已完成数量和清除入口

---

## 数据存储

全部数据通过 `wx.setStorageSync` / `wx.getStorageSync` 持久化到本地缓存，关闭小程序或刷新页面数据不丢失。

### 数据结构

```js
// 存储在 Storage 中的 todos 数组
[
  {
    id: 'pinned-important',   // 固定项使用固定 id
    text: '重要事项',
    pinned: true,              // 固定标记
    icon: '⭐',                // 图标 emoji
    color: '#1976d2',         // 文字颜色
    bgColor: '#fff8e1',       // 图标底色
    fontClass: '',            // 额外字体样式类名
    children: [
      { id: '1718000000001', text: '完成报告', done: false },
      { id: '1718000000002', text: '回复邮件', done: true  }
    ]
  },
  {
    id: '1718000000003',
    text: '日常杂务',
    pinned: false,
    children: [
      { id: '1718000000004', text: '浇花', done: true },
      { id: '1718000000005', text: '遛狗', done: false }
    ]
  }
]
```

### 显示字段预计算

由于 WXML 模板不支持函数调用和复杂表达式，每个条目在加载时通过 `decorate()` 方法预计算显示字段：

```js
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
}
```

保存回 Storage 时自动剥离 `_done`、`_progress`、`_unfinished` 等临时字段。

---

## 项目结构

```
miniprogram-1/
├── app.js                  # 入口：初始化固定事项、本地缓存
├── app.json                # 全局配置：页面路由、导航栏样式
├── app.wxss                # 全局样式：背景色、字体
├── pages/
│   ├── index/
│   │   ├── index.js        # 主页面逻辑：增删、导航、数据加载
│   │   ├── index.wxml      # 主页面模板：列表、输入栏
│   │   ├── index.wxss      # 主页面样式：方块、五星、按钮
│   │   └── index.json      # 页面配置
│   └── detail/
│       ├── detail.js       # 详情页逻辑：子待办增删切换
│       ├── detail.wxml     # 详情页模板：子待办列表
│       ├── detail.wxss     # 详情页样式
│       └── detail.json     # 页面配置
├── sitemap.json
├── project.config.json
└── README.md
```

---

## 使用方式

1. 在**微信开发者工具**中导入本项目目录
2. 填写 AppID（或使用测试号）
3. 编译运行即可

### 快速上手

1. 屏幕底部输入框输入事项名称 → 点击绿色 `+` 按钮新建
2. 点击任意事项 → 进入详情页添加具体待办
3. 点击子待办条目切换完成状态
4. 返回主页面查看整体进度，全部完成的事项前显示绿色方块
5. 「重要事项」固定在顶部，适合存放需持续关注的任务

---

## 设计风格

- **主色调**：`#4CAF50`（清新绿）
- **背景**：`#f5f7f6`（浅灰绿）
- **卡片**：白色圆角，轻微阴影
- **按钮**：正圆形，无输入时浅绿 (`#a5d6a7`)，有输入时亮绿 (`#4CAF50`)
- **字体**：系统默认无衬线字体，固定项使用不同颜色区分
