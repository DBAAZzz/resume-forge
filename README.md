# Resume Forge

本人的 Vibe Codeing 作品。

AI 简历分析与优化工具，支持简历解析、岗位匹配分析、流式反馈和编辑迭代。

## 在线访问

- Demo：已部署在 Vercel（可从仓库 About 的 Website 入口访问）
- GitHub：<https://github.com/DBAAZzz/resume-forge>
- 演示视频：待补充

## 演示视频

[![Resume Forge Demo](https://img.youtube.com/vi/YOUR_VIDEO_ID/maxresdefault.jpg)](https://www.bilibili.com/video/BV1vGcPz9EwS/)

## 功能概览

- 简历解析：支持 `PDF / Markdown / DOC / DOCX` 上传与文本提取
- 岗位匹配：基于目标岗位与 JD 输出匹配建议
- 流式分析：通过 SSE 实时返回分析过程与结果
- 深度洞察：时间线审计、技能一致性、量化建议、岗位匹配度
- 内容编辑：内置编辑器，支持格式整理与二次分析
- 密钥安全：前端公钥加密传输 API Key（`RSA-OAEP (SHA-256)`）

## 技术栈

- Frontend：React 19、TypeScript、Vite、Zustand、TanStack Query、TipTap、Tailwind CSS、Framer Motion
- Backend：Fastify、AI SDK、Zod、SSE
- Parsing：pdf-parse、mammoth、xlsx
- Monorepo：pnpm workspace

## 快速开始

### 1. 环境要求

- Node.js `20+`
- pnpm（项目锁定 `pnpm@10.28.2`）

### 2. 安装依赖

```bash
corepack enable
pnpm install
```

### 3. 配置环境变量

```bash
cp server/.env.example server/.env
```

`server/.env` 至少配置：

- `DEEPSEEK_API_KEY`
- `DEEPSEEK_BASE_URL`

### 4. 启动开发环境

```bash
pnpm dev
```

默认端口：

- Web：`http://localhost:5173`
- Server：`http://localhost:3000`

可单独启动：

```bash
pnpm dev:web
pnpm dev:server
```

## 常用命令

```bash
pnpm dev
pnpm build
pnpm lint
pnpm lint:check
pnpm format
```

## 项目结构

```text
resume-forge/
├── web/                 # 前端应用
├── server/              # Fastify 后端
├── shared/types/        # 前后端共享类型
└── api/                 # Serverless 入口（部署环境转发）
```

## 关键接口

- `POST /file/parse`：上传并解析简历文件
- `GET /file/template/resume`：下载 Markdown 简历模板
- `POST /deepseek/analyze-resume`：基础分析（SSE）
- `POST /deepseek/analyze/deep-insights`：深度分析（SSE）
- `POST /deepseek/format/hierarchy/stream`：层次化格式整理（SSE）
- `GET /crypto/deepseek-public-key`：获取前端加密公钥
- `GET /health`：健康检查

## 开发与协作

欢迎通过 Issue / PR 参与改进。

- Bug 反馈：提供复现步骤、预期行为、实际行为、运行环境
- 功能建议：建议先开 Issue 对齐方案
- PR：保持改动聚焦，提交前建议执行 `pnpm lint`

## 注意事项

- 上传文件仅用于解析与分析，不做持久化存储
- 当前稳定支持 DeepSeek，其他模型厂商在规划中
- 仓库目前未包含 `LICENSE` 文件，复用前请先确认授权范围

## Roadmap

- 接入更多模型厂商（OpenAI / 智谱）
- 完善优化前后差异可视化
- 增强岗位匹配评估维度与解释性
