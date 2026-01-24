# Vite + React + TypeScript + Zustand 项目

这是一个使用现代化技术栈搭建的 React 应用模板,集成了 Zustand 状态管理库。

## 🚀 技术栈

- **Vite** - 下一代前端构建工具
- **React 18** - 用于构建用户界面的 JavaScript 库
- **TypeScript** - JavaScript 的超集,提供类型安全
- **Zustand** - 轻量级的 React 状态管理库

## 📦 项目结构

```
esume-forge/
├── src/
│   ├── components/          # React 组件
│   │   ├── Counter.tsx      # 计数器组件示例
│   │   ├── Counter.css
│   │   ├── UserList.tsx     # 用户列表组件示例
│   │   ├── UserList.css
│   │   └── index.ts         # 组件导出
│   ├── store/               # Zustand 状态管理
│   │   ├── useCounterStore.ts  # 计数器 store
│   │   ├── useUserStore.ts     # 用户 store (带中间件)
│   │   └── index.ts            # store 导出
│   ├── App.tsx              # 主应用组件
│   ├── App.css
│   ├── main.tsx             # 应用入口
│   └── index.css            # 全局样式
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🎯 功能特性

### 1. 计数器示例 (Counter)

- 展示基本的 Zustand store 使用
- 包含增加、减少、重置等操作
- 演示状态的全局共享

### 2. 用户列表示例 (UserList)

- 展示异步操作处理
- 使用 Zustand 中间件:
  - `devtools` - Redux DevTools 支持
  - `persist` - localStorage 持久化
- 包含加载状态、错误处理

### 3. 现代化 UI 设计

- 渐变色背景和按钮
- 流畅的动画效果
- 响应式布局
- 玻璃态设计 (Glassmorphism)

## 🛠️ 开发指南

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173 查看应用

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 📚 Zustand 使用说明

### 创建 Store

```typescript
import { create } from 'zustand';

interface State {
  count: number;
  increment: () => void;
}

export const useStore = create<State>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

### 在组件中使用

```typescript
import { useStore } from './store';

function Component() {
  // 订阅整个 store
  const { count, increment } = useStore();

  // 或者只订阅特定状态 (性能优化)
  const count = useStore((state) => state.count);

  return <button onClick={increment}>{count}</button>;
}
```

### 使用中间件

```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export const useStore = create<State>()(
  devtools(
    persist(
      (set) => ({
        // your state
      }),
      {
        name: 'storage-key', // localStorage key
      }
    )
  )
);
```

## 🎨 样式系统

项目使用了现代化的 CSS 设计系统:

- **CSS 变量** - 统一的颜色和主题管理
- **渐变色** - 丰富的视觉效果
- **动画** - 流畅的用户体验
- **响应式** - 适配不同屏幕尺寸

## 🔧 调试工具

安装 [Redux DevTools](https://github.com/reduxjs/redux-devtools) 浏览器扩展来调试 Zustand store。

## 📖 学习资源

- [Vite 文档](https://vitejs.dev/)
- [React 文档](https://react.dev/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [Zustand 文档](https://github.com/pmndrs/zustand)

## 📝 License

MIT
