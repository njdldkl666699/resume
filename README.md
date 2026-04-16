# A4 单页简历（纯前端）

一个使用 HTML + CSS + JavaScript 实现的单页简历模板，支持：

- A4 纸张尺寸排版（210mm x 297mm）
- 屏幕预览与打印样式
- 从 JSON 读取数据并动态渲染
- 上传 `data-custom.json` 即时覆盖默认数据
- Font Awesome 图标

## 目录结构

- `index.html`：页面结构（占位容器 + 脚本引入）
- `styles.css`：页面与打印样式
- `script.js`：读取 `data.json`，可选合并 `data-custom.json` 后渲染页面
- `data.json`：简历数据
- `data-custom.json`（可选）：用于覆盖 `data.json` 的自定义数据

## 如何运行

由于页面通过 `fetch('./data.json')` 和 `fetch('./data-custom.json')`（可选）读取数据，**不要直接双击 HTML（file 协议）**。

请使用本地静态服务器打开，例如：

1. VS Code 安装并使用 Live Server 扩展
2. 在项目目录启动任意静态服务（如 `npx serve .`）

然后在浏览器访问对应地址。

## 如何修改内容

你可以通过两种方式改内容，无需改 HTML 结构：

1. 直接编辑 `data.json`
2. 新建 `data-custom.json`，仅写你要覆盖的字段

数据优先级：`data-custom.json` > `data.json`

你也可以在页面右上角使用“上传 `data-custom.json`”按钮，临时覆盖当前展示内容。

主要字段：

- `profile`：姓名、岗位、简介
- `contact`：联系方式标题、图标、列表
- `workExperience`：工作经历
- `projects`：项目经验
- `skills`：技能标签
- `education`：教育背景
- `strengths`：个人优势
- `languages`：语言能力

### 图标配置

图标使用 Font Awesome class 名称，例如：

- `fa-solid fa-phone`
- `fa-solid fa-envelope`
- `fa-brands fa-github`

可以在 `data.json` 中替换图标 class。

## 自定义覆盖（推荐）

当存在 `data-custom.json` 时，页面会将其与 `data.json` 合并：

1. 对象：递归合并
2. 数组：使用 `data-custom.json` 的数组整体替换
3. 基本类型：使用 `data-custom.json` 的值覆盖
4. 当字段值为 `undefined` 时，不覆盖原值

最小示例（只改姓名与语言）：

```json
{
	"profile": {
		"name": "你的姓名"
	},
	"languages": {
		"text": "中文（母语） / 英语（流利）"
	}
}
```

说明：如果 `data-custom.json` 不存在，页面会自动回退到 `data.json`。

## 上传按钮使用

页面右上角提供上传按钮，支持选择本地 JSON 文件并即时刷新页面：

1. 点击“上传 `data-custom.json`”
2. 选择你的 JSON 文件
3. 页面立即按“自定义覆盖”规则合并并重渲染

说明：

1. 该上传仅作用于当前页面会话，不会写入磁盘文件
2. 重新刷新页面后，会恢复为“`data.json` + 本地 `data-custom.json`（若存在）”的加载流程
3. 建议上传文件命名为 `data-custom.json`，便于维护

## 打印建议

1. 打印纸张选择 A4
2. 页边距选择默认或无（由页面样式控制）
3. 缩放建议 100%
4. 勾选“背景图形”（如果你希望保留背景装饰）

## 常见问题

### 1. 页面空白或数据不显示

通常是因为以 file 协议打开，导致 `fetch` 被拦截。请改用本地静态服务器。

### 2. `data-custom.json` 没生效

请依次检查：

1. 文件名是否为 `data-custom.json`
2. JSON 格式是否正确（逗号、引号）
3. 是否在静态服务器环境下访问
4. 浏览器 Network 面板是否返回了 200/304

### 3. 上传后没有变化

请依次检查：

1. 上传文件是否是合法 JSON
2. 上传内容字段路径是否正确（如 `profile.name`）
3. 对于数组字段（如 `skills.items`），上传后会整组替换

### 4. 打印预览变成单列

样式中已对打印场景做了两列布局处理。如仍异常：

1. 检查浏览器缩放是否为 100%
2. 尝试关闭浏览器“简化页面”选项
3. 更换 Chrome / Edge 最新版本测试

## License

仅用于个人简历展示与学习参考。
