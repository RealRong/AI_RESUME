# 项目脚手架与目录约束

本文档定义代码目录、模块边界、命名规范和首批应创建的文件，避免实现阶段边写边改结构。

---

## 1. 根目录结构

```text
.
├── apps
│   ├── api
│   └── web
├── packages
│   ├── eslint-config
│   ├── shared-types
│   └── tsconfig
├── DESIGN.md
├── IMPLEMENTATION_PLAN.md
├── API_CONTRACT.md
├── DATABASE_SCHEMA.sql
├── JOTAI_DOMAIN_GUIDE.md
├── REQUIREMENT.md
└── package.json
```

---

## 2. Web 目录

```text
apps/web/src
├── app
│   ├── (dashboard)
│   │   ├── dashboard
│   │   │   ├── candidates
│   │   │   ├── jobs
│   │   │   └── matching
│   ├── upload
│   ├── layout.tsx
│   └── page.tsx
├── components
│   ├── ui
│   ├── charts
│   └── common
├── features
│   ├── upload
│   ├── candidate
│   ├── job
│   └── matching
├── domains
│   ├── candidate
│   ├── job
│   ├── upload
│   ├── matching
│   └── ui
├── lib
│   ├── api
│   ├── utils
│   ├── sse
│   └── pdf
└── styles
```

### 目录职责

- `app`：路由与页面入口
- `components/ui`：shadcn/ui 生成组件
- `components/common`：跨业务复用展示组件
- `features`：页面级业务编排
- `domains`：领域状态与动作
- `lib`：无业务归属的工具

---

## 3. API 目录

```text
apps/api/src
├── app.ts
├── server.ts
├── routes
│   ├── uploads.routes.ts
│   ├── candidates.routes.ts
│   ├── jobs.routes.ts
│   └── matchings.routes.ts
├── controllers
├── services
├── repositories
├── domains
├── middleware
├── prompts
├── schemas
├── clients
└── utils
```

### 命名规范

- 路由文件：`*.routes.ts`
- 控制器文件：`*.controller.ts`
- 服务文件：`*.service.ts`
- 仓储文件：`*.repository.ts`
- schema 文件：`*.schema.ts`

---

## 4. Shared Types 目录

```text
packages/shared-types/src
├── candidate.ts
├── upload.ts
├── job.ts
├── matching.ts
├── api.ts
└── index.ts
```

共享层只放：

- DTO
- 枚举
- zod schema
- API 响应类型

共享层不放：

- 业务实现
- 数据库访问
- React 代码

---

## 5. 首批建议创建文件

## 根目录

- `package.json`
- `pnpm-workspace.yaml`
- `turbo.json`
- `.gitignore`
- `.env.example`

## Web

- `apps/web/package.json`
- `apps/web/next.config.ts`
- `apps/web/tailwind.config.ts`
- `apps/web/components.json`
- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/upload/page.tsx`
- `apps/web/src/app/dashboard/candidates/page.tsx`

## API

- `apps/api/package.json`
- `apps/api/vercel.json`
- `apps/api/src/app.ts`
- `apps/api/src/server.ts`
- `apps/api/src/routes/uploads.routes.ts`
- `apps/api/src/routes/candidates.routes.ts`

---

## 6. 组件边界规则

- 页面组件不直接请求数据库
- 页面组件不直接操作原始 atom
- `features` 可以组合多个领域
- `components/common` 不依赖具体页面路由
- `components/ui` 不写业务逻辑

---

## 7. 样式规则

- 统一设计令牌使用 CSS variables
- 颜色、圆角、阴影先在全局定义
- 不允许页面内联大段 class 拼接导致不可维护
- 图表与状态标签需要统一色板

---

## 8. 环境变量模板

根目录 `.env.example` 建议包含：

```env
NEXT_PUBLIC_API_BASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

OPENAI_API_KEY=
SUPABASE_URL=
SUPABASE_SECRET_KEY=
DATABASE_URL=
APP_BASE_URL=
WEB_BASE_URL=
```

