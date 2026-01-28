# 环境变量配置说明

## 开发环境 (Development)

在开发环境中，应用使用 Vite 代理将 API 请求转发到 `localhost:3000`。

### 配置文件：`.env.development`

```bash
VITE_API_BASE_URL=http://localhost:3000
```

### Vite 代理配置

在 `vite.config.ts` 中已配置以下代理规则：

- `/api` → `http://localhost:3000`
- `/file` → `http://localhost:3000`
- `/deepseek` → `http://localhost:3000`

这意味着在开发环境中，所有以 `/api`、`/file` 或 `/deepseek` 开头的请求都会自动转发到后端服务器。

## 生产环境 (Production)

在生产环境中，需要配置实际的 API 服务器地址。

### 配置文件：`.env.production`

```bash
VITE_API_BASE_URL=https://your-production-api.com
```

## 工作原理

1. **开发环境**：
   - `import.meta.env.DEV` 为 `true`
   - `getApiBaseUrl()` 返回空字符串 `''`
   - 请求使用相对路径（如 `/file/parse`）
   - Vite 代理自动将请求转发到 `localhost:3000`

2. **生产环境**：
   - `import.meta.env.DEV` 为 `false`
   - `getApiBaseUrl()` 返回 `VITE_API_BASE_URL` 的值
   - 请求使用完整 URL（如 `https://your-production-api.com/file/parse`）

## TypeScript 类型支持

在 `src/vite-env.d.ts` 中定义了环境变量的类型：

```typescript
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
}
```

这确保了在使用 `import.meta.env` 时有完整的 TypeScript 类型提示和检查。
