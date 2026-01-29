# React 最佳实践

## 1. 优化图标导入 (Deep Imports)

### 做法

使用深度导入来引用图标，而不是从顶层包导入。

```tsx
// 推荐做法
import User from 'lucide-react/dist/esm/icons/user';

// 不推荐做法
// import { User } from 'lucide-react';
```

### 原因

- **减小 bundle 体积**：直接导入具体图标文件可以避免构建工具（如 Vite/Webpack）在处理 Tree Shaking 时引入不必要的代码，特别是在开发环境下能显著提升热更新（HMR）速度。
- **提高编译性能**：减少了编译器解析顶层索引文件的负担。

## 2. 显式设置组件名称 (displayName)

### 做法

为经过 `memo` 或 `forwardRef` 处理的组件显式设置 `displayName`。

```tsx
export const AISuggestionsPanel = memo(() => {
  // ... 组件逻辑
});

AISuggestionsPanel.displayName = 'AISuggestionsPanel';
```

### 原因

- **调试友好**：在 React DevTools 中，经过高阶组件（HOC）处理的组件默认可能显示为 `Anonymous` 或 `Memo(...)`。设置 `displayName` 后，可以清晰地识别组件身份，方便性能分析（Profiling）和错误定位。

## 3. 使用三元运算进行条件渲染

### 做法

在 JSX 中渲染条件内容时，优先使用三元运算符 `condition ? <Component /> : null`，而不是逻辑与 `condition && <Component />`。

```tsx
// 推荐做法
{
  aiSuggestions.score >= 0 ? <div className="...">SCORE: {aiSuggestions.score}</div> : null;
}

// 不推荐做法
// {aiSuggestions.score >= 0 && <div className="...">SCORE: {aiSuggestions.score}</div>}
```

### 原因

- **避免渲染意外数值**：在 JavaScript 中，如果 `condition` 是数值 `0`（例如数组长度、分数等），`0 && <Component />` 会在页面上意外渲染出字符 "0"。
- **一致性与可读性**：三元运算符强制要求处理 `else` 情况（通常是 `null`），使渲染逻辑更加严谨，减少由于虚值（falsy values）导致的 UI 异常。
