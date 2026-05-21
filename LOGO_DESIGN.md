# Logo 设计说明

## 设计理念

这是一个专业商务风格的 Logo，采用多彩渐变配色方案，象征 API 网关的核心功能：**连接与聚合**。

### 图标含义

- **中心节点**：代表 New API 核心平台
- **四个外围节点**：代表多个 AI 服务提供商（OpenAI、Claude、Gemini 等）
- **连接线**：象征统一的 API 接口，将不同服务聚合在一起

### 配色方案

采用多彩渐变，体现平台的多样性和包容性：
- **背景渐变**：蓝紫色到粉色（#667eea → #764ba2 → #f093fb）
- **节点渐变**：每个节点使用不同的渐变色，代表不同的服务提供商
  - 中心：金色到深蓝（#ffd89b → #19547b）
  - 左侧：青色到粉色（#a8edea → #fed6e3）
  - 右侧：橙色到珊瑚色（#ffecd2 → #fcb69f）
  - 上方：天蓝色（#a1c4fd → #c2e9fb）
  - 下方：粉紫色（#fbc2eb → #a6c1ee）

## 文件说明

### 1. logo.svg (180x60px)
- 用途：网站导航栏
- 包含：图标 + "New API" 文字
- 位置：`web/classic/public/logo.svg`

### 2. favicon.svg (32x32px)
- 用途：浏览器标签图标
- 包含：纯图标（无文字）
- 位置：`web/classic/public/favicon.svg`

### 3. logo-icon.svg (60x60px)
- 用途：应用图标、社交媒体头像
- 包含：纯图标（无文字）
- 位置：`web/classic/public/logo-icon.svg`

## 使用建议

### 导航栏使用
```jsx
<img src="/logo.svg" alt="New API" height="40" />
```

### Favicon 配置
在 `index.html` 中添加：
```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```

### 响应式建议
- 桌面端：使用 logo.svg（带文字）
- 移动端：可使用 logo-icon.svg（纯图标）节省空间

## 设计特点

✅ **专业商务**：稳重的配色和几何图形
✅ **多彩渐变**：丰富的色彩体现平台多样性
✅ **可扩展性**：SVG 格式，任意缩放不失真
✅ **主题适配**：在浅色和深色背景下都清晰可见
✅ **语义明确**：图标直观表达 API 聚合的核心功能
