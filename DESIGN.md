# AI 智能简历分析平台设计文档

## 1. 文档目标

基于 [REQUIREMENT.md](/Users/realrong/Desktop/AI_RESUME/REQUIREMENT.md) 设计一套适合在 `Vercel` 部署的全栈方案，满足以下约束：

- 前端：`Next.js + React + TypeScript + shadcn/ui + Tailwind CSS + Jotai`
- 后端：`Express`
- 数据库：优先选用与 `Vercel` 集成顺滑的方案
- 部署：计划部署在 `Vercel`
- 状态管理：`Jotai` 必须采用领域化建模，禁止散落大量无组织 atom

本文档目标不是给出所有实现细节，而是给出一套可以直接进入开发的工程与架构设计。

---

## 2. 总体方案

### 2.1 技术选型结论

#### 前端

- `Next.js`：负责页面渲染、路由、SEO 基础能力、静态资源管理
- `React 18+`：组件化 UI 与交互
- `Tailwind CSS`：设计令牌与原子化样式
- `shadcn/ui`：高质量基础组件，便于做出不粗糙的管理后台
- `Jotai`：仅承担前端交互态与领域会话态，不替代服务端数据库

#### 后端

- `Express`：提供 REST API、SSE 流接口、文件上传、任务编排
- PDF 解析建议：
  - 首选 `pdf-parse` 或 `pdfjs-dist` 做文本提取
  - 首页缩略图如需服务端生成，可补充 `pdf-poppler` / 第三方渲染服务；第一版可降级为仅展示文件名与解析中状态

#### 数据与存储

- **推荐主方案：`Supabase Postgres + Supabase Storage`**
  - `Supabase Postgres`：结构化数据存储
  - `Supabase Storage`：存储原始 PDF、预览图、解析中间文件
  - 原因：
    - 与 Vercel 集成成熟
    - 关系型建模更适合候选人、教育经历、工作经历、项目经历、JD、评分结果等实体
    - 后续可扩展全文检索、向量检索、RLS、审计

#### 部署

- `Vercel` 部署前端 `Next.js`
- `Vercel` 部署后端 `Express`
- 建议采用**同仓库双应用**模式：
  - `apps/web`：Next.js
  - `apps/api`：Express
  - 分别在 Vercel 建两个 Project，便于独立构建与环境变量管理

### 2.2 选型说明

根据 Vercel 官方文档，当前 `Express` 在 Vercel 上以 **单个 Vercel Function** 形式运行，适合本项目的 API 聚合与 SSE 场景，但要控制包体积并做好错误处理。根据 Vercel 当前存储文档，`Vercel Postgres` 已不再作为新项目独立产品提供，新项目应通过 `Marketplace` 连接外部 Postgres；Supabase 已在 Vercel Marketplace/集成路径中提供较顺滑的连接体验与环境变量注入。因此本方案优先采用 `Supabase`。  

参考资料：

- Vercel Express on Vercel: https://vercel.com/docs/frameworks/backend/express
- Vercel Storage Overview: https://vercel.com/docs/storage
- Postgres on Vercel: https://vercel.com/docs/postgres
- Supabase x Vercel Marketplace: https://supabase.com/docs/guides/integrations/vercel-marketplace

---

## 3. 架构设计

### 3.1 高层架构

```text
Browser
  -> Next.js Web App
      -> Express API
          -> Supabase Postgres
          -> Supabase Storage
          -> OpenAI API
```

### 3.2 核心链路

#### 链路 A：简历上传与解析

1. 用户在前端拖拽或选择 PDF
2. 前端调用上传接口，直传或经 API 中转上传到 Storage
3. API 创建 `resume_upload` 记录与初始 `candidate` 草稿记录
4. API 解析 PDF 文本
5. API 保存原始文本、清洗文本、解析状态
6. API 发起 AI 信息提取任务
7. 通过 SSE 将提取进度和部分结构化结果逐步推送前端
8. 提取完成后写入候选人完整结构化数据

#### 链路 B：岗位匹配与评分

1. 用户录入或编辑 JD
2. 选择一个或多个候选人触发匹配
3. API 组合 JD + 候选人结构化数据 + 清洗文本
4. 调用 AI 输出评分、子维度评分、评语、证据摘要
5. 存储评分快照，返回结果并更新候选人列表视图

#### 链路 C：候选人管理

1. 列表查询走 REST API
2. 支持分页、筛选、排序、关键词搜索
3. 详情页获取候选人聚合信息、评分历史、PDF 预览地址
4. 状态变更调用 PATCH 接口，列表与详情同步更新

---

## 4. 工程结构设计

建议仓库结构：

```text
.
├── apps
│   ├── web                      # Next.js
│   │   ├── src
│   │   │   ├── app
│   │   │   ├── components
│   │   │   ├── features
│   │   │   ├── domains
│   │   │   ├── lib
│   │   │   └── styles
│   │   └── package.json
│   └── api                      # Express
│       ├── src
│       │   ├── routes
│       │   ├── controllers
│       │   ├── services
│       │   ├── domains
│       │   ├── repositories
│       │   ├── prompts
│       │   ├── middleware
│       │   └── utils
│       └── package.json
├── packages
│   ├── shared-types             # 前后端共享 DTO / Schema
│   ├── eslint-config
│   └── tsconfig
├── docs
└── REQUIREMENT.md
```

### 4.1 前端目录原则

- `components`：纯展示通用组件，不承载业务规则
- `features`：面向页面/业务功能的组合层
- `domains`：领域模型、Jotai store、selectors、actions
- `lib`：请求封装、图表、上传工具、时间与格式化工具

### 4.2 后端目录原则

- `routes`：路由定义
- `controllers`：HTTP 入参与响应整形
- `services`：业务编排与事务边界
- `domains`：领域对象与规则
- `repositories`：DB/Storage 访问
- `prompts`：AI 提示词模板

---

## 5. 前端设计

## 5.1 页面规划

### `/dashboard/candidates`

候选人管理主页面：

- 顶部：搜索、筛选、排序、视图切换、创建 JD、批量操作
- 主区：
  - 表格视图
  - 卡片视图
- 右侧或弹层：
  - 快速预览
  - 候选人状态修改

### `/dashboard/candidates/[id]`

候选人详情页：

- 基本信息
- 技能标签
- 教育经历
- 工作经历
- 项目经历
- AI 提取日志/修正记录
- 与某个 JD 的评分详情
- 原始 PDF 预览

### `/dashboard/jobs`

JD 管理页：

- JD 列表
- 新建/编辑 JD
- 必备技能、加分技能标签化编辑

### `/dashboard/matching`

评分与对比页：

- 选择 JD
- 选择 1~3 位候选人
- 展示综合分、子维度分、评语
- 雷达图/柱状图对比

### `/upload`

上传入口页：

- 拖拽上传区
- 批量文件列表
- 上传进度
- 解析进度
- SSE 实时抽取结果卡片

## 5.2 UI 设计原则

- 风格定位：专业招聘分析台，不做通用后台模板感
- 组件风格：卡片、分组面板、浅层阴影、清晰信息层级
- 响应式重点：桌面端 `>=1280px` 优先，平板兼容
- 图表建议：
  - 综合分：环形进度图
  - 子评分：雷达图或横向柱状图
  - 状态分布：堆叠柱或标签统计

## 5.3 前端数据获取策略

- 页面首屏：服务端获取或路由级加载
- 高频交互：客户端请求 REST API
- 流式结果：使用原生 `EventSource` 或基于 `fetch` 的 SSE 读取器
- PDF 预览：使用浏览器内嵌预览或 `react-pdf`

---

## 6. Jotai 领域化建模规范

本项目**禁止**出现“每个输入框一个 atom、每个弹窗一个 atom、每个列表字段一个 atom”的散乱状态方案。Jotai 只允许按**领域聚合**建模。

## 6.1 领域划分

建议拆成以下领域：

- `candidate-domain`
- `job-domain`
- `upload-domain`
- `matching-domain`
- `ui-domain`

每个领域内部只暴露：

- `state atom`
- `derived selectors`
- `actions`
- `hooks`

## 6.2 推荐目录

```text
apps/web/src/domains/
├── candidate
│   ├── model.ts
│   ├── atoms.ts
│   ├── selectors.ts
│   ├── actions.ts
│   └── hooks.ts
├── job
├── upload
├── matching
└── ui
```

## 6.3 建模原则

### 原则一：以“领域状态树”而不是“控件状态点”建模

示例：

- 正确：`candidateListQueryAtom`
- 正确：`candidateSelectionAtom`
- 正确：`candidateComparePanelAtom`
- 错误：`nameFilterAtom`、`schoolFilterAtom`、`cardViewAtom`、`statusDialogOpenAtom` 到处散落

### 原则二：每个领域最多 1~3 个根 atom

根 atom 负责保存领域聚合状态，其他状态尽量由 selector 推导。

例如 `candidate-domain` 可只有：

- `candidateListStateAtom`
- `candidateDetailStateAtom`
- `candidateUiStateAtom`

### 原则三：原子操作通过 actions 暴露

不要在页面里直接 `setAtom` 操作深层结构，应封装动作：

- `setKeyword`
- `setFilters`
- `toggleCompareCandidate`
- `changeCandidateStatus`

### 原则四：服务端数据与本地交互态分层

- 服务端实体快照：候选人、JD、评分结果
- 本地交互态：筛选器、选择项、对比面板、编辑草稿、上传队列

### 原则五：可回收的临时态放在局部 Provider

如上传页的临时状态、某个详情页编辑态，不要污染全局。

## 6.4 建议状态结构

```ts
type CandidateListState = {
  query: {
    keyword: string;
    sortBy: 'score' | 'uploadedAt' | 'name';
    sortOrder: 'asc' | 'desc';
    filters: {
      status: string[];
      skills: string[];
      educationLevels: string[];
    };
    viewMode: 'table' | 'card';
    page: number;
    pageSize: number;
  };
  selection: {
    selectedIds: string[];
    compareIds: string[];
  };
  remote: {
    items: CandidateListItem[];
    total: number;
    loading: boolean;
    error: string | null;
    lastFetchedAt: string | null;
  };
};
```

## 6.5 推荐用法

- 页面只消费领域 hook，例如：
  - `useCandidateList()`
  - `useCandidateFilters()`
  - `useUploadQueue()`
  - `useMatchingWorkspace()`
- 页面组件不直接知道 atom 内部结构
- 原子与领域实体命名统一，禁止 `fooAtom2`、`tempAtom`、`testAtom`

---

## 7. 后端设计

## 7.1 API 风格

- 协议：RESTful + SSE
- 数据格式：`application/json`
- 文件上传：`multipart/form-data`

## 7.2 API 列表

### 上传与解析

- `POST /api/uploads`
  - 上传单个或多个 PDF
  - 返回上传任务与文件信息

- `GET /api/uploads/:uploadId/events`
  - SSE 订阅解析与 AI 提取进度

- `GET /api/uploads/:uploadId`
  - 获取上传任务详情

### 候选人

- `GET /api/candidates`
  - 列表查询：分页、搜索、筛选、排序

- `GET /api/candidates/:candidateId`
  - 获取候选人详情

- `PATCH /api/candidates/:candidateId`
  - 更新候选人基础信息、技能、教育等修正字段

- `PATCH /api/candidates/:candidateId/status`
  - 更新状态

### JD

- `GET /api/jobs`
- `POST /api/jobs`
- `GET /api/jobs/:jobId`
- `PATCH /api/jobs/:jobId`
- `DELETE /api/jobs/:jobId`

### 匹配评分

- `POST /api/matchings`
  - 请求体：`jobId + candidateIds`
  - 返回评分任务结果

- `GET /api/matchings/:matchingId`
  - 查询单次匹配详情

## 7.3 SSE 事件设计

建议事件：

- `upload.accepted`
- `upload.progress`
- `pdf.parsed`
- `resume.cleaned`
- `extract.started`
- `extract.partial`
- `extract.completed`
- `matching.started`
- `matching.completed`
- `job.failed`

前端按事件类型驱动界面分步更新。

## 7.4 后端模块划分

### `upload-service`

- 校验文件类型与大小
- 上传至 Storage
- 创建上传记录

### `resume-parser-service`

- 解析 PDF
- 页级文本拼接
- 文本清洗
- 结构化上下文预处理

### `ai-extraction-service`

- 调用 LLM 提取结构化字段
- 生成增量事件
- 输出标准 JSON

### `matching-service`

- 读取 JD
- 读取候选人结构化信息
- 生成评分与评语
- 持久化评分快照

### `candidate-service`

- 列表聚合查询
- 详情聚合查询
- 状态流转

---

## 8. AI 处理设计

## 8.1 提取流程

1. PDF 文本提取
2. 文本清洗
3. 分块与字段引导
4. LLM 提取结构化 JSON
5. 服务端 schema 校验
6. 不合法字段回退与修复
7. 写库

## 8.2 输出结构

AI 提取结果建议统一为稳定 JSON：

```json
{
  "basic": {
    "name": "",
    "phone": "",
    "email": "",
    "city": ""
  },
  "education": [],
  "workExperiences": [],
  "skills": [],
  "projects": []
}
```

## 8.3 评分输出结构

```json
{
  "overallScore": 86,
  "dimensionScores": {
    "skillMatch": 90,
    "experienceRelevance": 84,
    "educationFit": 78
  },
  "summary": "候选人技能匹配较强，但教育背景与岗位偏好存在一定差距。",
  "strengths": [],
  "risks": [],
  "evidence": []
}
```

## 8.4 AI 调用原则

- Prompt 必须固定输出 schema
- 所有模型输出先做 `zod` 或等价 schema 校验
- 对高风险字段做二次修正：
  - 邮箱
  - 电话
  - 时间区间
  - 学历枚举
- 保留原始文本与 AI 结构化结果，支持前端人工修正

---

## 9. 数据模型设计

数据库推荐：`Supabase Postgres`

## 9.1 核心表

### `resume_uploads`

- `id`
- `file_name`
- `file_path`
- `file_size`
- `mime_type`
- `preview_image_path`
- `status`
- `error_message`
- `uploaded_at`

### `candidates`

- `id`
- `upload_id`
- `name`
- `phone`
- `email`
- `city`
- `status`
- `raw_text`
- `cleaned_text`
- `source_file_url`
- `created_at`
- `updated_at`

### `candidate_educations`

- `id`
- `candidate_id`
- `school`
- `major`
- `degree`
- `graduation_date`
- `sort_order`

### `candidate_work_experiences`

- `id`
- `candidate_id`
- `company_name`
- `title`
- `start_date`
- `end_date`
- `summary`
- `sort_order`

### `candidate_projects`

- `id`
- `candidate_id`
- `project_name`
- `tech_stack`
- `role_summary`
- `highlights`
- `sort_order`

### `candidate_skills`

- `id`
- `candidate_id`
- `skill_name`
- `skill_type`

### `jobs`

- `id`
- `title`
- `description`
- `required_skills`
- `bonus_skills`
- `created_at`
- `updated_at`

### `candidate_matchings`

- `id`
- `candidate_id`
- `job_id`
- `overall_score`
- `skill_match_score`
- `experience_relevance_score`
- `education_fit_score`
- `summary`
- `strengths_json`
- `risks_json`
- `evidence_json`
- `created_at`

### `candidate_audit_logs`

- `id`
- `candidate_id`
- `action_type`
- `before_json`
- `after_json`
- `operator`
- `created_at`

## 9.2 状态枚举

候选人状态：

- `pending`
- `screening_passed`
- `interviewing`
- `hired`
- `rejected`

上传/解析状态：

- `uploaded`
- `parsing`
- `extracting`
- `completed`
- `failed`

---

## 10. 查询与性能设计

## 10.1 列表查询策略

候选人列表是核心读路径，必须优先优化。

- 默认分页查询
- 按 `status`、`uploaded_at`、`overall_score` 建索引
- 技能标签筛选可走关联表或预聚合字段
- 关键词搜索第一版可基于：
  - `name`
  - `email`
  - `school`
  - `cleaned_text` 的简化搜索

后续可升级为 Postgres 全文检索。

## 10.2 前端性能策略

- 列表页使用虚拟滚动或分页二选一，第一版建议分页
- 卡片/表格视图共享同一份领域数据，不重复拉取
- 详情页按区块懒加载 PDF 预览
- SSE 页面仅维护当前上传任务的订阅，离开页面立即释放

## 10.3 Vercel 场景注意点

由于 `Express` 在 Vercel 上作为单个函数运行：

- 需要避免引入过重原生依赖
- 避免在内存中长期持有大文件
- 上传后应尽快转存到对象存储
- 复杂 PDF 预览生成任务可以延后为异步任务

---

## 11. 安全与错误处理

## 11.1 输入校验

- 文件类型必须为 PDF
- 限制文件大小与单次批量数
- 所有 REST 入参使用 schema 校验

## 11.2 错误处理

- API 层统一错误响应格式
- SSE 中推送 `job.failed`
- 前端统一 toast + inline error 双通道提示

建议错误响应：

```json
{
  "code": "UPLOAD_INVALID_FILE",
  "message": "Only PDF files are allowed.",
  "requestId": "xxx"
}
```

## 11.3 数据安全

- 服务端保存 API Key，前端不直连模型密钥
- 原始 PDF 走私有存储桶
- 预览 URL 使用签名链接
- 保留人工修正审计日志

---

## 12. 部署设计

## 12.1 推荐部署形态

### Vercel Project A: `resume-web`

- Root Directory: `apps/web`
- Framework Preset: `Next.js`

### Vercel Project B: `resume-api`

- Root Directory: `apps/api`
- Framework Preset: `Other`
- 运行 `Express` 入口

### 数据层

- `Supabase Postgres`
- `Supabase Storage`

## 12.2 环境变量

### 前端

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

### 后端

- `OPENAI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `DATABASE_URL`
- `APP_BASE_URL`
- `WEB_BASE_URL`

## 12.3 为什么不建议前后端硬塞进同一个 Next 项目

虽然技术上可以把 API 路由写在 Next 内，但本题已明确后端使用 `Express`。为了满足要求且保持边界清晰，更合理的方式是：

- 前端专注 UI、交互与路由
- 后端专注上传、解析、SSE、AI 编排
- 两端独立部署、独立扩缩容、独立观察日志

---

## 13. 开发阶段建议

## 13.1 第一阶段：主链路打通

- 完成上传 PDF
- 完成 PDF 文本解析
- 完成 AI 提取
- 完成候选人列表与详情
- 完成 JD 输入与单人评分

## 13.2 第二阶段：体验增强

- 批量上传进度
- SSE 分步渲染
- 评分图表
- 状态流转动画反馈
- Skeleton 与全局 Loading

## 13.3 第三阶段：加分项

- PDF 首页缩略图
- 多 JD 对比
- 候选人对比
- 亮暗主题
- 键盘快捷键

---

## 14. 风险与应对

## 14.1 PDF 解析质量不稳定

风险：

- 扫描版 PDF 可能提取不到文本

应对：

- 第一版明确只保证文本型 PDF
- 扫描件作为后续 OCR 增强项

## 14.2 SSE 在弱网络场景中断

风险：

- 提取中页面刷新或网络中断

应对：

- 后端持久化任务状态
- 前端支持重新拉取任务详情与结果

## 14.3 Vercel 函数包体与执行约束

风险：

- PDF 解析链路过重

应对：

- 首版控制依赖
- 复杂预览和缩略图生成后移

---

## 15. 最终建议

本项目推荐采用以下最终组合：

- 前端：`Next.js + React + Tailwind + shadcn/ui + Jotai`
- 后端：`Express`
- 数据库：`Supabase Postgres`
- 文件存储：`Supabase Storage`
- 部署：`Vercel` 双 Project
- 状态管理：`Jotai` 按领域聚合建模

这是当前最稳妥的方案，原因是：

- 满足题目对 React/Next 与 Express 的要求
- 满足 Vercel 部署目标
- 避免使用已停止新开通的 `Vercel Postgres`
- 保持数据关系建模清晰
- 能够自然支持 SSE、批量上传、评分对比、人工修正与后续扩展

如果后续要继续落地实现，建议下一步先补一份：

- `MVP 开发任务拆解`
- `数据库 schema SQL`
- `前后端目录脚手架`

