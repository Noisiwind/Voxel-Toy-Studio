# Voxel Toy Studio

一个结合 AI 和手势控制的体素艺术创作平台。

## 🚀 快速开始

### 方法一：双击启动（最简单）
直接双击 `start-dev.bat` 文件，浏览器会自动打开 http://localhost:5173

### 方法二：命令行启动
```bash
npm run dev
```

然后访问：http://localhost:5173

## 📦 功能特性

- 🎨 4 个 AI 服务商支持（DeepSeek、OpenAI、Claude、Gemini）
- 👋 MediaPipe 手势控制
- 🎯 涂色模式
- 📝 历史记录（撤销/重做）
- 🎭 8 个高质量预设模型
- 💾 自动保存到浏览器

## 🛠️ 开发工作流程

### 日常开发（推荐）
1. 每次开机后双击 `start-dev.bat`
2. 在浏览器中访问 http://localhost:5173
3. 修改代码后自动刷新
4. 关机后服务器会停止（正常现象）

### 部署到线上（可选）
1. 测试完成后：`git add .` 和 `git commit`
2. 推送到 GitHub：`git push`
3. Vercel 会自动部署最新版本
4. 访问永久链接分享给别人

## 📁 项目结构

```
voxel-toy-box/
├── src/
│   ├── components/       # React 组件
│   ├── engine/          # 体素引擎
│   ├── utils/           # AI API 和工具函数
│   └── App.tsx          # 主应用
├── public/              # 静态资源
│   ├── mega.json        # Mega 模型
│   └── litongxue.json   # 理想同学模型
├── start-dev.bat        # 快速启动脚本
└── DEPLOYMENT.md        # 部署文档

```

## 🎮 手势控制

### 左手
- **握拳** → 拆解模型
- **张开** → 重组模型

### 右手
- **比 1** → 指针选择模式
- **握拳** → 抓取拖拽体素
- **张开移动** → 旋转视角
- **V 字上下** → 缩放

## 🔑 API Keys

支持以下 AI 服务商（可选填）：
- DeepSeek: https://platform.deepseek.com
- OpenAI: https://platform.openai.com
- Claude: https://console.anthropic.com
- Gemini: https://aistudio.google.com

## 📝 技术栈

- React 19 + TypeScript
- Three.js + React Three Fiber
- MediaPipe Hands
- Vite
- Tailwind CSS

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

ISC

---

**开发者**: chiechunngai
**AI 助手**: Claude Code (Sonnet 4.5)
**最后更新**: 2025-02-02
