# Voxel Toy Studio 部署指南

## 问题说明
每次关闭电脑后，`npm run dev` 启动的开发服务器会停止，localhost 就无法访问了。

## 解决方案：部署到 Vercel

Vercel 是一个免费的静态网站托管平台，非常适合 Vite 项目。部署后你会得到一个永久的网址（如 `https://voxel-toy-studio.vercel.app`），随时可以访问。

## 部署步骤

### 方法一：通过 Vercel 网站部署（推荐）

1. **访问 Vercel**
   - 打开 https://vercel.com
   - 点击 "Sign Up" 注册账号（可以用 GitHub 账号登录）

2. **导入 GitHub 项目**
   - 登录后，点击 "Add New..." → "Project"
   - 选择 "Import Git Repository"
   - 找到你的项目：`Noisiwind/Voxel-Toy-Studio`
   - 点击 "Import"

3. **配置项目**
   - Framework Preset: 自动检测为 "Vite"
   - Build Command: `npm run build`（自动填充）
   - Output Directory: `dist`（自动填充）
   - 不需要修改任何设置

4. **部署**
   - 点击 "Deploy"
   - 等待 2-3 分钟构建完成
   - 完成后会显示你的网站地址，如：
     ```
     https://voxel-toy-studio.vercel.app
     ```

5. **自动更新**
   - 以后每次 `git push` 到 GitHub
   - Vercel 会自动重新部署最新版本
   - 无需手动操作

### 方法二：通过命令行部署

1. **安装 Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **部署项目**
   ```bash
   cd /c/Users/chiechunngai/voxel-toy-box
   vercel
   ```

4. **按照提示操作**
   - Set up and deploy? Yes
   - Which scope? 选择你的账户
   - Link to existing project? No
   - Project name? voxel-toy-studio
   - In which directory is your code located? ./
   - Want to modify these settings? No

5. **生产环境部署**
   ```bash
   vercel --prod
   ```

## 其他部署选项

### Netlify（备选方案）
1. 访问 https://netlify.com
2. 拖拽整个项目文件夹到网页
3. 或连接 GitHub 仓库自动部署

### GitHub Pages（免费但需要额外配置）
需要修改 `vite.config.ts` 添加 `base` 路径

## 本地开发

如果你只是想在本地开发，每次打开电脑后运行：

```bash
cd /c/Users/chiechunngai/voxel-toy-box
npm run dev
```

然后访问 http://localhost:5173

## 常见问题

### Q: 部署后 API 调用失败？
A: 不会，所有 API 调用都是从浏览器发起的，不依赖服务器。

### Q: 部署是免费的吗？
A: Vercel 和 Netlify 都提供免费套餐，足够个人项目使用。

### Q: 能自定义域名吗？
A: 可以，在 Vercel 项目设置中添加自定义域名。

### Q: 需要重新部署吗？
A: 不需要，连接 GitHub 后每次 push 都会自动部署。

## 推荐配置

建议使用 **Vercel + GitHub 自动部署**：
- ✅ 免费
- ✅ 自动部署
- ✅ 全球 CDN 加速
- ✅ HTTPS 支持
- ✅ 无需维护服务器

部署完成后，你会得到类似这样的网址：
```
https://voxel-toy-studio-abc123.vercel.app
```

可以分享给任何人访问！🎉
