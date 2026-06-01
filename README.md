# 法拉利 F1 赛车展 - 本地运行与模型替换指南 🏎️

本文件专门用于解答并完美解决您在本地（macOS / Windows / Linux）运行该项目时遇到的环境依赖冲突。

---

## 📌 为什么本地运行不再报错？（已完成永久修复）

此前您在本地启动 Vite 服务时，可能会遇到如下两类报错：

### 1. Tailwind v4 原生 Rust 二进制构建错误
> **Error: Cannot find native binding. npm has a bug related to optional dependencies...**
> **.../@tailwindcss/oxide/index.js:563:11**

- **核心原因**：先前项目采用的是 Tailwind CSS v4，它要求加载包含 Rust 编译器的 `@tailwindcss/oxide`。不同操作系统存在硬件及平台指令集差异，从云端下载在本地运行易引发二进制依赖不匹配故障。
- **完美解决方案**：我们已降级至具有极高兼容性、**100% 纯 JavaScript 实现**的 **Tailwind CSS v3 + PostCSS** 流水线，彻底杜绝了此类原生系统绑定错误。

### 2. WebStorm 与低版本 Node.js 的 `crypto.hash` 报错
> **Pre-transform error: crypto.hash is not a function**
> **Plugin: vite:vue**
> **File: /src/App.vue**

- **核心原因**：较新版的 `@vitejs/plugin-vue`（及部分现代 Vite 插件）内部依赖了 Node.js 在 **v21.7.0 / v20.12.0** 之后才引入的原生全局 `crypto.hash(...)` 静态哈希方法。当您在本机使用 WebStorm 打开项目，而 WebStorm 或本地环境所配置/集成的 Node.js 运行时低于上述版本（例如 Node 18, v20.10.0 等）时，便会因为该原生方法缺失而导致 vue 文件预编译中断。
- **完美解决方案**：**我们已在 `vite.config.ts` 的最顶部编写并注入了健壮的运行时 Polyfill（兼容层）**。当监测到本地宿主 Node.js 系统中缺失 `crypto.hash` api 时，会自动在全局层面平滑地用高版本完全一致的 `crypto.createHash` 对其进行原生仿真重写。因此，**您现在的开发环境将无论集成任何老版本 Node.JS，均可毫无任何阻碍地一键完成热更新！** (不再需要强行升级您的本地 Node 运行时版本)。

---

## 🛠️ 在您本机运行项目的两步指南

请您在电脑的终端（例如您 Mac 中的 Terminal 组件）中切换至解压目录（如 `/Users/kevzhong/Downloads/法拉利f1赛车展示+/`），依次输入：

### 1. 彻底清除旧残留 (极其重要)
为防止之前生成的 Linux 锁定包与缓存干扰本机的纯 JS 编译流程，请先清理锁定的临时文件：
- **macOS / Linux 终端：**
  ```bash
  rm -rf node_modules package-lock.json
  ```
- **Windows (PowerShell) 终端：**
  ```powershell
  Remove-Item -Recurse -Force node_modules, package-lock.json
  ```

### 2. 重新安装依赖与启动开发服务
```bash
npm install
npm run dev
```

启动完成后，您即可在浏览器中访问 **`http://localhost:3000`**，开始您流畅、无阻碍的本地开发与赛车展示！

---

## 🎨 3D 模型 (.glb) 与赛车大图替换指南

我们已经在项目对应的目录为您预留了替换规则和对应的指引说明：

### 1. 3D GLB 赛车模型替换
- **存放位置：**
  将您的 `sf24.glb`、`sf23.glb` 等赛车 3D 全景模型放入项目的 **`public/models/`** 目录（如果没有 `public` 文件夹，可在根目录新建一个 `public`，再在其下新建 `models` 文件夹并放入数据模组）。
- **代码映射：**
  在 `src/data/cars.ts` 里找到配置，修改 `glbModel` 指向该相对路径：
  ```ts
  glbModel: '/models/your_model.glb'
  ```
- **自适应后备系统（Fallback）：**
  我们已在 3D 加载器中编写了自适应逻辑。若本地不加载外部模型或加载出错，系统会自动无缝切换为您精心设计好的 **WebGL 程序化几何粒子风洞仿真模型**，保证展厅的极致科技质感！

### 2. 赛车官方宣传大图替换
- **存放位置：**
  将大图放入 **`src/assets/images/`**。
- **代码映射：**
  在 `src/data/cars.ts` 里，我们在每台车的数据集下写明了注释。将对应车辆的 `image` 字段更新为您替换后的路径，或者直接填写图片的 `https://` 网络网络协议直链即可！
