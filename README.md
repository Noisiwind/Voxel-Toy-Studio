<div align="center">

# 🎮 Voxel Toy Studio

**AI驱动的体素艺术创作平台**

结合人工智能、手势控制和3D技术，让每个人都能轻松创作体素模型

![GitHub stars](https://img.shields.io/github/stars/Noisiwind/Voxel-Toy-Studio?style=social)
![GitHub forks](https://img.shields.io/github/forks/Noisiwind/Voxel-Toy-Studio?style=social)
![GitHub license](https://img.shields.io/github/license/Noisiwind/Voxel-Toy-Studio)

✨ **在线体验**: [https://noisiwind.github.io/Voxel-Toy-Studio/](https://noisiwind.github.io/Voxel-Toy-Studio/)

</div>

---

## 📋 目录

- [项目简介](#项目简介)
- [产品背景](#产品背景)
- [核心功能](#核心功能)
- [操作指南](#操作指南)
- [技术架构](#技术架构)
- [快速开始](#快速开始)
- [常见问题](#常见问题)
- [未来规划](#未来规划)
- [贡献指南](#贡献指南)

---

## 🎯 项目简介

Voxel Toy Studio 是一个革命性的3D体素艺术创作平台，旨在通过先进的AI技术和直观的交互方式，降低3D建模的门槛，让每个人都能轻松创造属于自己的体素作品。

**核心理念：** 创造无界，灵感即刻实现

---

## 📖 产品背景

### 为什么创建 Voxel Toy Studio？

### 传统3D建模的痛点

- **学习曲线陡峭**：需要掌握复杂的建模软件和专业知识
- **入门门槛高**：需要昂贵的硬件和长时间的培训
- **创作效率低**：从概念到成品需要大量重复性工作
- **限制多**：普通用户难以实现自己的创意

### 我们的解决方案

Voxel Toy Studio 通过以下创新彻底改变了这一切：

1. **AI辅助生成** - 从文字描述直接生成3D模型
2. **手势控制** - 像玩玩具一样自然地操控模型
3. **Web端运行** - 无需下载安装，打开浏览器即可使用
4. **即时反馈** - 实时预览，所见即所得

### 创作目的

- **普及3D创作** - 让更多普通人体验3D建模的乐趣
- **教育价值** - 培养孩子的空间思维和创造力
- **创意激发** - 激发用户的创作潜能，提供创作灵感
- **技术创新** - 探索AI+3D+手势控制的创新交互方式

---

## ✨ 核心功能

### 🤖 AI 智能生成

基于先进的AI工作流，只需输入文字描述，即可生成精美的体素模型。

**支持方式：**
- 文字描述生成（推荐）
- 自定义工作流 API
- 多种生成风格（简单/标准/详细）
- 多种配色方案（鲜艳/粉彩/单色）

**示例提示词：**
```
一只可爱的熊猫，正在吃竹子
一座中式的城堡，带有塔尖
一辆复古的红色小汽车
```

### 👋 手势控制

集成 MediaPipe 手势识别技术，通过摄像头实现体感交互。

**左手功能：**
- 🤜 **握拳** - 拆解模型（粒子爆炸效果）
- 🖐 **张开** - 重组模型（自动飞回原位）


**右手功能：**
- ☝️ **食指** - 指针选择模式
- ✊ **握拳** - 抓取/拖拽体素
- ✋ **张开移动** - 旋转视角
- 🤙 **V字手势** - 上下缩放模型


### 🎨 模型编辑

完整的编辑工具套件，让你的作品更完美。

**几何变换：**
- 📐 **下采样** - 降低体素精度（÷2÷3÷4）
- 📈 **放大模型** - 等比例放大（×2×3）
- 🔄 **掏空内部** - 只保留外壳
- 🧱 **填充内部** - 将空心骨架变为实心

**历史管理：**
- ↩️ **撤销** - 恢复上一步操作
- ⏩ **重做** - 取消撤销
- 💾 **自动保存** - 所有变更自动保存到浏览器

### 📥 数据导入/导出

**支持的格式：**
- JSON 格式导入/导出
- 复制分享链接
- 下载本地文件

### 🗺️ 预设模型库

内置多个高质量预设模型，快速开始创作：

| 模型 | 描述 | 体素数 |
|------|------|--------|
| 🧑 **理想同学** | 吉祥物角色 | ~200 |
| 🚙 **理想 L9** | 汽车模型 | ~350 |
| 🚗 **Mega** | 经典车型 | ~8000 |
| 🐼 **熊猫** | 可爱动物 | ~400 |
| 🐰 **兔子** | 活泼动物 | ~300 |
| 🦊 **狐狸** | 灵动动物 | ~350 |
| 🏰 **城堡** | 建筑模型 | ~800 |
| 🦅 **老鹰** | 飞行动物 | ~500 |

### 🎛️ 界面功能详解

#### 左侧控制面板

| 按钮 | 功能 | 说明 |
|------|------|------|
| ➕ **新建模型** | AI生成 | 打开创建窗口，输入描述生成模型 |
| 🗑️ **拆解** | 模型拆解 | 将模型炸裂成粒子效果 |
| 🔄 **重建** | 模型重建 | 将粒子重新组装成模型 |
| 👋 **手势控制** | 启用手势 | 打开摄像头识别手势 |
| ↩️ **撤销** | 撤销操作 | 恢复上一个状态 |
| ⏩ **重做** | 重做操作 | 取消撤销 |
| ⚙️ **自定义模型** | 编辑模型 | 打开编辑工具窗口 |

#### 右上角功能按钮

| 按钮 | 功能 | 说明 |
|------|------|------|
| 🌍 **语言** | 中英切换 | 切换界面语言（中文/English） |
| 🧠 **Logic Hub** | AI思考 | 查看AI生成过程的详细日志 |
| 🔄 **自动旋转** | 旋转开关 | 开启/关闭模型自动旋转 |
| 📥 **导出** | 下载模型 | 导出为JSON文件 |
| 🔗 **分享** | 复制链接 | 复制模型JSON到剪贴板 |

#### 底部快速开始

点击预设模型按钮即可立即加载该模型到画布中心。

---

## 🎮 操作指南

### 快速入门（3步上手）

1. **选择预设** - 点击底部的预设模型或创建新模型
2. **自由操作** - 使用鼠标或手势控制模型
3. **保存分享** - 导出或分享你的作品

### 鼠标操作
- **右键拖拽** - 旋转视角
- **滚轮** - 缩放

### 手势控制设置

1. 点击左侧的 **手势控制** 按钮
2. 允许浏览器访问摄像头
3. 举起手对准摄像头
4. 按照屏幕提示做出手势

**提示：** 确保光线充足，手部完整显示在画面中

---

## 🏗️ 技术架构

### 前端框架

```
用户界面层
├── React 19 + TypeScript
├── Tailwind CSS
└── Lucide Icons

3D渲染层
├── Three.js
├── React Three Fiber
└── React Three Drei

交互层
├── MediaPipe Hands (手势识别)
├── Camera API (摄像头)
└── Pointer Events (鼠标/触控)

AI集成层
├── Dify Workflow API
└── 自定义Prompt增强

工具层
├── Vite (构建工具)
├── VoxelEngine (体素引擎)
└── localStorage (持久化)
```

### 关键技术

- **性能优化** - InstancedMesh 批量渲染
- **物理效果** - 骨架动画 + 粒子系统
- **手势识别** - MediaPipe Hands 实时追踪
- **AI增强** - 智能Prompt构建和JSON解析
- **数据格式** - 压缩算法，支持超大模型

---

## 🚀 快速开始

### 在线使用（推荐）

直接访问：**[https://noisiwind.github.io/Voxel-Toy-Studio/](https://noisiwind.github.io/Voxel-Toy-Studio/)**

无需安装，打开浏览器即可使用。

### 本地开发

#### 前置要求

- Node.js 20+ 或 22+
- npm 或 pnpm

#### 安装依赖

```bash
git clone https://github.com/Noisiwind/Voxel-Toy-Studio.git
cd Voxel-Toy-Studio
npm install
```

#### 启动开发服务器

```bash
# Windows (双击)
start-dev.bat

# 或使用命令行
npm run dev
```

访问：http://localhost:5173

#### 构建生产版本

```bash
npm run build
npm run preview
```

### 自定义部署

支持部署到以下平台：

- GitHub Pages (自动部署)
- Vercel
- Netlify
- Cloudflare Pages
- 任意静态网站托管服务

---

## ❓ 常见问题

### Q: 为什么生成的模型有缺失或空洞？

**A:** 可以尝试以下方法：

1. 在描述中添加"完整、实心、满填充"等关键词
2. 使用编辑工具中的 **"填充内部"** 功能


### Q: 手势控制无法识别？

**A:** 检查以下几点：

1. 确保允许浏览器访问摄像头
2. 检查光线是否充足
3. 手部要完整显示在画面中
4. 手势要清晰稳定

### Q: 导出的JSON文件怎么用？

**A:** JSON文件可以：

1. 通过 **"导入JSON"** 功能重新加载
2. 与他人分享
3. 在其他支持的工具中使用

### Q: 支持哪些AI服务商？

**A:** 当前版本使用配置的Dify工作流API，未来计划支持更多AI服务商。

### Q: 浏览器兼容性？

**A:** 推荐使用以下浏览器：

- Chrome 90+
- Edge 90+
- Firefox 88+
- Safari 14+

需要支持 WebGL 和 Camera API

### Q: 性能要求？

**A:** 最低配置：

- GPU: 集成显卡即可
- 内存: 4GB+
- 网络: 稳定的互联网连接

---

## 🔮 未来规划

### 短期目标 (Q1 2026)

- [ ] 支持图片参考生成
- [ ] 多模型组合
- [ ] 自定义配色方案
- [ ] 更多预设模型
- [ ] 移动端适配

### 中期目标 (Q2 2026)

- [ ] 社区模型库
- [ ] 模型分享广场
- [ ] 播放动画模式
- [ ] 多人协作编辑
- [ ] VR 模式支持

### 长期愿景

- **创作生态** - 建立创作者社区和分享平台
- **教育应用** - 开发专门的STEM教育版本
- **商业化** - 企业版和高级功能订阅
- **开源治理** - 完善开源贡献机制

---

## 🤝 贡献指南

### 如何贡献

我们欢迎各种形式的贡献！

#### 报告问题

1. 在 [Issues](https://github.com/Noisiwind/Voxel-Toy-Studio/issues) 搜索现有问题
2. 如果没有，创建新Issue并详细描述
3. 提供复现步骤和截图

#### 提交代码

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

#### 开发规范

- 遵循 TypeScript 最佳实践
- 添加必要的注释和文档
- 保持代码风格一致
- 编写测试（可选）

---

## 📄 开源协议

本项目采用 [ISC License](LICENSE)

---

## 👥 团队

**主要开发者**: [@chiechunngai](https://github.com/Noisiwind)

**AI 助手**: Claude Code (Sonnet 4.5)

---

## 🙏 致谢

感谢以下开源项目：

- [Three.js](https://threejs.org/) - 3D 图形库
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) - React渲染器
- [MediaPipe](https://mediapipe.dev/) - 机器学习工具
- [Vite](https://vitejs.dev/) - 构建工具
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [Lucide Icons](https://lucide.dev/) - 图标库

---

## 📮 联系我们

- **GitHub**: [Noisiwind/Voxel-Toy-Studio](https://github.com/Noisiwind/Voxel-Toy-Studio)
- **Issues**: [提交问题](https://github.com/Noisiwind/Voxel-Toy-Studio/issues)

---

<div align="center">

**如果觉得这个项目有用，请给一个 ⭐️ Star 支持我们！**

Made with ❤️ by Voxel Toy Studio Team

</div>
