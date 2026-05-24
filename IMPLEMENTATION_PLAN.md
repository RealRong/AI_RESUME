# AI 智能简历分析平台实施计划

## 1. 目标

本文档用于把 [DESIGN.md](/Users/realrong/Desktop/AI_RESUME/DESIGN.md) 转换为可执行的开发计划，作为代码落地顺序、验收边界与任务拆分依据。

---

## 2. MVP 边界

第一版 MVP 必须完成：

- PDF 批量上传，至少支持 5 份同时上传
- 后端完成 PDF 文本提取与清洗
- AI 提取基本信息、教育、工作经历、技能
- SSE 流式返回提取进度与部分结果
- JD 创建与编辑
- 单个 JD 对单个或多个候选人的匹配评分
- 候选人列表页
- 候选人详情页
- 候选人状态流转
- Vercel 可部署版本

第一版可以暂缓：

- PDF 首页缩略图
- OCR 扫描件识别
- 多 JD 并行对比
- 键盘快捷键
- 深度审计看板

---

## 3. 里程碑

## M1：仓库初始化

验收标准：

- Monorepo 目录结构建立完成
- `apps/web`、`apps/api`、`packages/shared-types` 可独立启动
- 基础 TypeScript、ESLint、Tailwind 配置完成

任务：

- 建立 workspace 根配置
- 初始化 Next.js 项目
- 初始化 Express 项目
- 配置共享 tsconfig 与 lint 规则
- 配置基础环境变量模板

## M2：数据库与基础服务

验收标准：

- Supabase 项目建立
- 基础表结构创建完成
- 本地与线上均可连接数据库
- Storage bucket 可上传 PDF

任务：

- 执行 [DATABASE_SCHEMA.sql](/Users/realrong/Desktop/AI_RESUME/DATABASE_SCHEMA.sql)
- 创建 `resumes-private` bucket
- 创建 DB 访问层与 Repository 基础实现
- 配置签名 URL 生成能力

## M3：上传与解析主链路

验收标准：

- 前端支持拖拽/点击上传
- 支持多文件上传
- 文件状态可视化
- 后端完成 PDF 文本提取
- 任务状态持久化

任务：

- 实现上传组件
- 实现 `POST /api/uploads`
- 实现文件落盘到 Storage
- 实现 PDF 解析服务
- 记录 `resume_uploads` 与 `candidates`

## M4：AI 提取与 SSE

验收标准：

- 前端可订阅 SSE
- 后端流式推送解析阶段事件
- 提取结果逐步出现在页面
- 结构化结果可落库

任务：

- 实现 `GET /api/uploads/:uploadId/events`
- 实现 `ai-extraction-service`
- 实现 schema 校验与回退
- 前端接入 SSE 并渲染进度

## M5：候选人管理

验收标准：

- 列表页支持分页、搜索、筛选、排序
- 支持表格/卡片视图切换
- 详情页可展示完整候选人信息与 PDF
- 状态变更可持久化

任务：

- 实现 `GET /api/candidates`
- 实现 `GET /api/candidates/:id`
- 实现 `PATCH /api/candidates/:id/status`
- 建立 candidate 领域前端模型

## M6：JD 与评分

验收标准：

- 可创建/编辑 JD
- 可对候选人执行匹配评分
- 页面能展示综合分、子维度分与评语

任务：

- 实现 JD CRUD
- 实现 `POST /api/matchings`
- 实现图表组件
- 建立 matching 领域模型

## M7：部署与验收

验收标准：

- Web 与 API 均部署到 Vercel
- 生产环境可跑通上传、解析、评分主链路
- 关键错误可追踪

任务：

- 配置 Vercel 双项目
- 注入环境变量
- 进行端到端验收

---

## 4. 详细开发顺序

推荐严格按下面顺序推进：

1. 建项目结构与基础依赖
2. 建数据库 schema 与 Storage bucket
3. 建共享 DTO 和 schema
4. 建 API 基础骨架与错误处理中间件
5. 建上传 API
6. 建 PDF 解析服务
7. 建 SSE 事件通道
8. 建 AI 提取服务
9. 建候选人列表与详情页
10. 建 JD 与匹配评分
11. 做部署与联调

---

## 5. 前端开发拆分

## 5.1 基础层

- App Layout
- 主题样式变量
- API Client
- Toast / Dialog / Sheet / Table / Badge / Tabs
- 全局错误边界
- 全局 Skeleton

## 5.2 业务功能层

### 上传

- `ResumeUploadDropzone`
- `UploadQueueList`
- `UploadItemCard`
- `ExtractionProgressPanel`

### 候选人

- `CandidateToolbar`
- `CandidateTable`
- `CandidateCardGrid`
- `CandidateStatusBadge`
- `CandidateCompareBar`

### 候选人详情

- `CandidateHeader`
- `CandidateBasicInfoPanel`
- `CandidateEducationPanel`
- `CandidateWorkPanel`
- `CandidateProjectPanel`
- `CandidatePdfPreview`
- `CandidateMatchingPanel`

### JD

- `JobList`
- `JobEditorForm`
- `SkillTagInput`

### 匹配

- `MatchingConfigPanel`
- `MatchingRadarChart`
- `MatchingScoreCard`
- `MatchingSummaryPanel`

---

## 6. 后端开发拆分

## 6.1 基础设施

- `app.ts`
- 路由注册
- 错误处理中间件
- 请求日志中间件
- schema 校验中间件

## 6.2 Repository

- `upload-repository`
- `candidate-repository`
- `job-repository`
- `matching-repository`
- `audit-log-repository`
- `storage-repository`

## 6.3 Service

- `upload-service`
- `pdf-parser-service`
- `resume-cleaner-service`
- `ai-extraction-service`
- `matching-service`
- `candidate-service`
- `job-service`

---

## 7. 联调验收清单

每次阶段性交付至少检查以下内容：

- 上传 1 份 PDF 是否成功
- 批量上传 5 份 PDF 是否成功
- SSE 是否能连续收到事件
- 候选人列表是否支持搜索和分页
- 状态更新后列表和详情是否同步
- JD 保存后是否能立即参与评分
- 评分结果是否有综合分、子评分、评语
- PDF 预览签名 URL 是否正常

---

## 8. 非功能验收

- 页面在 `1280px` 以上桌面端正常展示
- 首屏 Loading 和错误态完整
- 无散乱 atom
- API 响应结构统一
- 所有关键路径都有日志
- 生产环境密钥只出现在服务端

---

## 9. 建议交付文件

后续代码阶段建议至少创建：

- `.env.example`
- `pnpm-workspace.yaml` 或等价 workspace 配置
- `turbo.json` 或等价任务编排配置
- `apps/web/README.md`
- `apps/api/README.md`
- `packages/shared-types/src/index.ts`

