# AI 智能简历分析平台

一个面向招聘场景的全栈应用，支持 PDF 简历上传、AI 结构化信息提取、岗位匹配评分、候选人管理与多 JD 对比分析。

当前仓库已完成：

- PDF 批量上传与进度展示
- PDF 首页缩略图预览
- AI 结构化提取与 SSE 渐进渲染
- 岗位管理与候选人管理
- 候选人详情、状态流转、手动修正
- 岗位匹配分析与多 JD 对比
- 暗黑 / 亮色主题切换

## 项目架构说明

本项目采用 `pnpm workspace + turborepo` 的 monorepo 结构，前后端分离，公共类型共享。

```text
.
├── apps
│   ├── web                  # Next.js 前端
│   └── api                  # Express 后端
├── packages
│   └── shared-types         # 前后端共享类型与 zod schema
├── DATABASE_SCHEMA.sql      # Supabase / Postgres 建表脚本
├── DESIGN.md                # 设计文档
├── API_CONTRACT.md          # API 约定
├── JOTAI_DOMAIN_GUIDE.md    # 前端领域化状态规范
└── README.md
```

### 前端架构

前端位于 `apps/web`，基于 Next.js App Router 构建，主要分层如下：

- `src/app`
  - 路由入口与页面装配
- `src/components/ui`
  - shadcn 风格基础组件
- `src/components/common`
  - 通用布局与公共业务组件
- `src/features`
  - 页面级业务编排
- `src/domains`
  - 领域状态、selectors、actions、hooks
- `src/instance`
  - 统一业务调用入口，约束为 `useInstance()` / `instance.domain.action()`

前端状态管理遵循“领域化建模”，不允许散落大量业务 atom。当前已拆分为：

- `upload-domain`
- `candidate-domain`
- `job-domain`
- `matching-domain`
- `ui-domain`
- `settings-domain`

### 后端架构

后端位于 `apps/api`，基于 Express，职责是提供 REST API、SSE、文件上传、PDF 解析、AI 编排与数据持久化。

主要目录：

- `src/routes`
  - HTTP 路由
- `src/services`
  - 业务编排、AI 提取、上传处理、匹配分析
- `src/repositories`
  - Supabase Postgres / Storage 访问
- `src/schemas`
  - 入参校验
- `src/middleware`
  - 错误处理与请求校验
- `src/clients`
  - Supabase client

### 数据与存储架构

- 结构化数据：`Supabase Postgres`
- 文件存储：`Supabase Storage`
- AI 调用：兼容 OpenAI 风格接口

核心数据实体包括：

- `resume_uploads`
- `candidates`
- `candidate_skills`
- `candidate_educations`
- `candidate_work_experiences`
- `candidate_projects`
- `jobs`
- `candidate_matchings`

## 技术选型及理由

### 前端

- `Next.js`
  - 适合 Vercel 部署
  - 路由、构建、静态资源与页面组织成熟
- `React`
  - 组件化能力强，适合中后台复杂交互
- `Tailwind CSS`
  - 便于快速建立语义化、统一化设计系统
- `shadcn 风格组件`
  - 组件基础质量高，可控性强，适合黑白极简风格
- `Jotai`
  - 轻量，适合按领域拆分状态，避免 Redux 级别样板代码

### 后端

- `Express`
  - 足够轻，便于落地文件上传、SSE、RESTful API
  - 与 Vercel Serverless / Functions 兼容成本低
- `pdf-parse + pdfjs-dist`
  - 支持 PDF 文本提取与前端首页缩略图能力

### 数据层

- `Supabase Postgres`
  - 关系型模型适合候选人、教育、工作、项目、岗位、评分记录
  - 与 Vercel 配合顺滑
- `Supabase Storage`
  - 适合存储原始简历 PDF
  - 支持签名 URL，便于详情页预览

### 类型与校验

- `TypeScript`
  - 统一前后端类型边界
- `zod`
  - 请求数据与共享 schema 校验清晰

## 本地开发环境搭建指南

### 1. 环境要求

- Node.js `>= 20`
- pnpm `>= 10`
- 一个可用的 Supabase 项目

### 2. 安装依赖

在仓库根目录执行：

```bash
pnpm install
```

### 3. 准备环境变量

根目录已有模板文件：

- [.env.example](/.env.example:1)

建议按当前仓库约定分别创建：

- 根目录 `.env.local`
- `apps/web/.env.local`
- `apps/api/.env.local`

前端至少需要：

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

后端至少需要：

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_STORAGE_BUCKET=resumes-private
APP_BASE_URL=http://localhost:3001
WEB_BASE_URL=http://localhost:3000
OPENAI_API_KEY=
```

说明：

- `publishable key` 给前端使用
- `service role key` 只能给后端使用
- 当前项目支持前端通过“AI 设置”弹窗手动配置 AI `baseUrl` 与 `apiKey`，因此 `OPENAI_API_KEY` 可暂时留空

### 4. 初始化数据库

在 Supabase SQL Editor 中执行：

- [DATABASE_SCHEMA.sql](/DATABASE_SCHEMA.sql:1)

然后在 Supabase Storage 中创建 bucket：

- `resumes-private`

### 5. 启动本地开发

在仓库根目录执行：

```bash
pnpm dev
```

默认端口：

- Web: `http://localhost:3000`
- API: `http://localhost:3001`

如果只想单独启动：

```bash
pnpm --filter @ai-resume/web dev
pnpm --filter @ai-resume/api dev
```

### 6. 生产构建验证

```bash
pnpm --filter @ai-resume/web build
pnpm --filter @ai-resume/api build
```

## 部署方式说明

推荐部署到 `Vercel`，采用“同仓库双项目”模式。

### 部署结构

- `resume-web`
  - Root Directory: `apps/web`
- `resume-api`
  - Root Directory: `apps/api`

### 1. 部署 API

在 Vercel 导入同一个仓库，创建后端项目：

- Root Directory: `apps/api`
- Framework Preset: `Other`

仓库中已包含：

- [apps/api/vercel.json](/apps/api/vercel.json:1)

它会将 Express 服务作为 Vercel Node Function 部署。

后端环境变量：

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_STORAGE_BUCKET=resumes-private
APP_BASE_URL=https://your-api-domain.vercel.app
WEB_BASE_URL=https://your-web-domain.vercel.app
OPENAI_API_KEY=
```

部署完成后先验证：

```text
https://your-api-domain.vercel.app/health
```

### 2. 部署 Web

再创建前端项目：

- Root Directory: `apps/web`
- Framework Preset: `Next.js`

前端环境变量：

```env
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

### 3. 部署顺序建议

建议顺序如下：

1. 先部署 API
2. 拿到 API 正式域名
3. 将前端的 `NEXT_PUBLIC_API_BASE_URL` 指向该域名
4. 再部署 Web

### 4. 线上联调检查项

部署完成后建议至少检查：

1. `/health` 是否返回正常
2. 前端上传 PDF 是否成功
3. SSE 提取过程是否正常流式返回
4. 候选人详情页 PDF 预览是否可用
5. 岗位匹配分析是否能成功生成结果

## 开发过程中的关键技术决策与思考

### 1. 采用 monorepo 而不是前后端拆仓

原因是前后端共享：

- 候选人 / 岗位 / 匹配结果 DTO
- zod schema
- API 返回结构

这样可以显著减少接口漂移与重复定义。

### 2. Jotai 必须领域化，而不是散 atom

项目页面交互多，如果用“一个输入框一个 atom”的方式，状态很快失控。  
因此统一改成：

- `domains/*/atoms.ts`
- `domains/*/selectors.ts`
- `domains/*/actions.ts`
- `domains/*/hooks.ts`

并要求业务操作经 `useInstance()` 统一收口。

### 3. AI 提取采用单次调用 + SSE 分段回传

没有把“基本信息 / 教育 / 工作 / 技能 / 项目”拆成多次 AI 请求，而是：

- 后端单次调用 AI 获取完整结构化结果
- 再按领域分段通过 SSE 推送给前端

这样做的原因是：

- 降低模型调用成本
- 降低多次调用带来的时延和不一致
- 前端仍然能保留“逐步渲染”的体验

### 4. PDF 首页缩略图放在前端生成

缩略图使用 `pdfjs-dist` 在浏览器端提取首页并生成预览图，而不是在服务端做渲染。  
这样做的收益是：

- 不增加后端渲染依赖
- 不增加 Vercel Function 负担
- 用户上传时可以立即看到预览

### 5. 候选人详情保留“手动修正”能力

AI 提取不可能完全准确，特别是：

- 日期格式
- 公司 / 项目字段切分
- 技能归类

因此详情页保留手动修正入口，确保系统不是只读演示，而是具备真实使用闭环。

### 6. 匹配分析结果放在 Drawer，而不是单独大页面堆叠

这样可以让用户保持在选择上下文中，快速切换：

- 主岗位
- 对比 JD
- 候选人选择
- 结果查看

交互效率更高，也更适合桌面端分析台场景。

## 当前状态

当前仓库的代码能力与题目要求对照说明，见：

- [DELIVERY_STATUS.md](/DELIVERY_STATUS.md:1)

当前已验证通过：

```bash
pnpm --filter @ai-resume/api build
pnpm --filter @ai-resume/web build
```
