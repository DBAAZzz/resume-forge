# 前端 API Mocking 最佳实践指南

## 1. 方案概述

本项目采用 **MSW (Mock Service Worker)** 结合 **Faker.js** 构建了一套高效、逼真的前端模拟数据方案。

- **MSW**: 在 Service Worker 层拦截网络请求，这意味着我们在 DevTools 的 Network 面板能看到真实的请求记录，且无需修改应用代码即可切换 Mock 与真实接口。
- **Faker.js**: 用于生成随机但语义化（Realistic）的模拟数据（如真实的人名、地址、职业等），避免了 "Test 1", "Test 2" 这种无意义的死数据。

## 2. 目录结构

```text
src/
├── api/             # API 定义层
│   ├── types.ts     # TypeScript 接口定义 (Single Source of Truth)
│   ├── user.ts      # 用户相关 API Fetch 函数
│   └── resume.ts    # 简历相关 API Fetch 函数
├── mocks/           # Mock 核心配置
│   ├── browser.ts   # MSW Worker 设置
│   └── handlers.ts  # 请求拦截与处理逻辑 (Faker 数据生成在此处)
├── store/           # 状态管理 (Zustand)
│   ├── useUserStore.ts
│   └── useResumeStore.ts
└── main.tsx         # 入口文件 (开发环境下启动 MSW)
```

## 3. 核心工作流

新增一个 API 接口的推荐步骤如下：

### 第一步：定义类型 (Type Definition)

在 `src/api/types.ts` 中定义接口返回的数据结构。

```typescript
// src/api/types.ts
export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  // ...
}
```

### 第二步：编写 Mock Handler (Handler Implementation)

在 `src/mocks/handlers.ts` 中拦截请求并生成模拟数据。

```typescript
// src/mocks/handlers.ts
import { http, HttpResponse, delay } from 'msw';
import { faker } from '@faker-js/faker';

export const handlers = [
  http.get('/api/me', async () => {
    // 1. 模拟网络延迟 (可选)
    await delay(500);

    // 2. 生成动态数据
    const user = {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      avatar: faker.image.avatar(),
    };

    // 3. 返回 JSON 响应
    return HttpResponse.json(user);
  }),
];
```

### 第三步：封装 Fetch 函数 (API Layer)

在 `src/api/` 目录下创建对应的 fetch 函数。

```typescript
// src/api/user.ts
import type { UserProfile } from './types';

export const fetchUserProfile = async (): Promise<UserProfile> => {
  const response = await fetch('/api/me');
  if (!response.ok) throw new Error('Failed to fetch user');
  return response.json();
};
```

### 第四步：接入状态管理 (Store Integration)

在 Store 中调用 fetch 函数并更新状态。

```typescript
// src/store/useUserStore.ts
export const useUserStore = create((set) => ({
  currentUser: null,
  fetchCurrentUser: async () => {
    const user = await fetchUserProfile();
    set({ currentUser: user });
  },
}));
```

## 4. 最佳实践 (Best Practices)

### 1. 随机数据的稳定性

虽然 Faker 生成的是随机数据，但有时我们需要相对固定的数据以便测试。

- **技巧**: 如果需要固定数据，可以在 handler 外部定义常量，或者使用 `faker.seed(123)` 设置随机种子。但在大多数开发场景下，完全随机有助于发现 UI 布局在不同长度内容下的边界情况。

### 2. 模拟真实网络环境

不要立即返回数据。使用 MSW 的 `delay()` 函数模拟真实世界的网络延迟（如 200ms - 1000ms）。这能强制我们在组件中正确处理 `loading` 状态。

```typescript
await delay(500); // 模拟 500ms 延迟
```

### 3. 类型安全

- **Import Type**: 在导入接口时使用 `import type { ... }`，确保这些仅用于类型检查的代码不会被打包到生产环境 JS 中。
- **API 合约**: `src/api/types.ts` 应作为前后端的契约。如果后端 API 变更，只需更新此文件，TypeScript 编译器会帮助我们发现所有受影响的 Mock 和组件代码。

### 4. 环境隔离

确保 MSW 仅在开发环境 (`development`) 启动。

```typescript
// src/main.tsx
async function enableMocking() {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }
  const { worker } = await import('./mocks/browser');
  return worker.start();
}
```

### 5. 模块化 Handler

随着接口增多，`handlers.ts` 会变得臃肿。建议按功能模块拆分：

- `src/mocks/handlers/user.ts`
- `src/mocks/handlers/resume.ts`
- 然后在 `src/mocks/handlers.ts` 中统一合并导出。

## 5. 调试技巧

- **Network Tab**: 所有的 Mock 请求都会显示在浏览器 Network 面板中，状态码通常为 `200 OK` (from ServiceWorker)。
- **Console**: MSW 启动时会在控制台打印 `[MSW] Mocking enabled.`。
- **Bypass Mock**: 如果需要临时请求真实后端，可以在 Network 面板中勾选 "Bypass for network"，或者在 handler 中配置透传。

---

_文档更新日期: 2026-01-25_
