# 前端实现清单

本文档用于约束接下来前端代码落地的优先级、组件边界和视觉方向。  
核心前提：

- UI 组件必须严格基于 `shadcn/ui`
- 风格必须保持**黑白极简**
- 前端状态必须继续遵循 [JOTAI_DOMAIN_GUIDE.md](/Users/realrong/Desktop/AI_RESUME/JOTAI_DOMAIN_GUIDE.md)
- 页面与交互实现必须与 [DESIGN.md](/Users/realrong/Desktop/AI_RESUME/DESIGN.md) 和 [API_CONTRACT.md](/Users/realrong/Desktop/AI_RESUME/API_CONTRACT.md) 对齐

---

## 1. 总体目标

下一阶段前端不是继续堆页面占位，而是把现有骨架推进成：

- 具备完整设计约束
- 基于 `shadcn/ui` 的组件系统
- 有真实数据交互能力
- 黑白极简风格统一
- 可直接接后端上传与 SSE

---

## 2. 设计约束

## 2.1 视觉方向

- 主色仅使用黑、白、灰
- 禁止彩色大面积背景
- 禁止渐变主视觉继续扩散到业务页面
- 强调留白、边框、排版、层级，而不是靠颜色堆信息
- 卡片、面板、表格、弹层都采用低噪音风格

建议基调：

- 背景：`white` / `zinc-50`
- 文本：`zinc-950` / `zinc-700` / `zinc-500`
- 边框：`zinc-200` / `zinc-300`
- 强调：仅通过粗细、对比度、间距表达

## 2.2 组件来源约束

- 基础 UI 必须优先使用 `shadcn/ui`
- 不允许手写一套平行组件系统替代 `shadcn/ui`
- 可以在 `shadcn/ui` 组件基础上封装业务组件
- 所有交互容器优先从以下组件组合：
  - `Button`
  - `Input`
  - `Textarea`
  - `Dialog`
  - `Sheet`
  - `DropdownMenu`
  - `Popover`
  - `Select`
  - `Command`
  - `Tabs`
  - `Table`
  - `Badge`
  - `Card`
  - `Skeleton`
  - `Form`
  - `Separator`
  - `ScrollArea`
  - `Tooltip`

---

## 3. 优先级顺序

必须按这个顺序推进，避免前端做成一堆静态壳：

1. 建立黑白极简设计令牌
2. 安装并生成第一批 `shadcn/ui` 基础组件
3. 重构全局布局与页面 Shell
4. 完成上传页真实交互
5. 完成候选人列表页
6. 完成候选人详情页
7. 完成 JD 管理页
8. 完成匹配分析页
9. 统一错误态、加载态、空态

---

## 4. 具体任务清单

## 4.1 建立设计系统基础

目标：

- 清掉当前偏暖色与演示性质较强的首页视觉
- 建立黑白极简的全局样式基线

要做的事：

- 重构 [apps/web/src/app/globals.css](/Users/realrong/Desktop/AI_RESUME/apps/web/src/app/globals.css)
- 定义黑白灰 CSS variables
- 统一圆角、边框、阴影、焦点样式
- 统一页面最大宽度、留白、标题层级
- 明确桌面端主布局的间距系统

验收标准：

- 全站不再依赖彩色背景氛围
- 页面看起来像专业产品，而不是 demo landing page

## 4.2 初始化 shadcn/ui 组件集合

目标：

- 建立统一 UI 组件基座

要做的事：

- 安装并生成第一批 `shadcn/ui` 组件
- 建立 [apps/web/src/components/ui](/Users/realrong/Desktop/AI_RESUME/apps/web/src/components) 目录下的真实组件文件
- 补充 `cn`、表单、toast、dialog、table 等基础能力

建议首批组件：

- `button`
- `input`
- `textarea`
- `card`
- `badge`
- `table`
- `dialog`
- `sheet`
- `dropdown-menu`
- `tabs`
- `select`
- `command`
- `skeleton`
- `form`
- `scroll-area`
- `separator`
- `tooltip`

验收标准：

- 新页面和新业务组件不再直接手写重复的基础 UI

## 4.3 重构页面 Shell

目标：

- 建立统一的后台工作台结构

要做的事：

- 重构 [apps/web/src/components/common/page-shell.tsx](/Users/realrong/Desktop/AI_RESUME/apps/web/src/components/common/page-shell.tsx)
- 加入统一 Header 区、工具栏区、内容区
- 预留 breadcrumb / 操作区 / 统计区插槽
- 统一页面标题、副标题和动作按钮布局

验收标准：

- 上传页、候选人页、JD 页、匹配页共享同一套骨架

## 4.4 完成上传页

目标：

- 接上真实上传链路
- 用 `shadcn/ui` 做出整洁而克制的工作流页面

要做的事：

- 重构 [apps/web/src/features/upload/upload-workspace.tsx](/Users/realrong/Desktop/AI_RESUME/apps/web/src/features/upload/upload-workspace.tsx)
- 建立 `ResumeUploadDropzone`
- 建立 `UploadQueueList`
- 建立 `UploadProgressCard`
- 建立 `ExtractionEventPanel`
- 接入 `POST /api/uploads`
- 接入 `GET /api/uploads/:uploadId/events`
- 在 `upload-domain` 中维护上传队列与事件流状态

验收标准：

- 可上传多个 PDF
- 能展示上传状态、解析状态、提取结果
- 页面风格仍然克制、纯净

## 4.5 完成候选人列表页

目标：

- 真正进入“管理台”而不是纯占位表格

要做的事：

- 重构 [apps/web/src/features/candidate/candidate-list-feature.tsx](/Users/realrong/Desktop/AI_RESUME/apps/web/src/features/candidate/candidate-list-feature.tsx)
- 使用 `shadcn/ui` 的 `Table`、`Tabs`、`Badge`、`Input`、`Select`
- 加入搜索栏、状态筛选、排序切换、视图切换
- 接入 `GET /api/candidates`
- 让 `candidate-domain` 驱动列表状态

验收标准：

- 支持分页
- 支持关键字搜索
- 支持状态筛选
- 表格层级清晰，黑白灰风格统一

## 4.6 完成候选人详情页

目标：

- 建立真正可用的详情工作台

要做的事：

- 重构 [apps/web/src/features/candidate/candidate-detail-feature.tsx](/Users/realrong/Desktop/AI_RESUME/apps/web/src/features/candidate/candidate-detail-feature.tsx)
- 拆出：
  - `CandidateHeader`
  - `CandidateBasicInfoCard`
  - `CandidateSkillsCard`
  - `CandidateEducationCard`
  - `CandidateWorkCard`
  - `CandidatePdfPreviewCard`
  - `CandidateMatchingSummaryCard`
- 接入 `GET /api/candidates/:candidateId`
- 预留人工修正入口

验收标准：

- 信息分组清晰
- PDF 预览区域不喧宾夺主
- 评分摘要与结构化信息并存

## 4.7 完成 JD 管理页

目标：

- 从占位容器变成可编辑页面

要做的事：

- 重构 [apps/web/src/features/job/job-list-feature.tsx](/Users/realrong/Desktop/AI_RESUME/apps/web/src/features/job/job-list-feature.tsx)
- 建立 `JobListPanel`
- 建立 `JobEditorForm`
- 建立 `SkillTagEditor`
- 接入 `GET /api/jobs`
- 接入 `POST /api/jobs`
- 接入 `PATCH /api/jobs/:jobId`

验收标准：

- 可以创建和编辑 JD
- 表单交互简洁，不浮夸

## 4.8 完成匹配分析页

目标：

- 提供一个结构清晰的分析工作区

要做的事：

- 重构 [apps/web/src/features/matching/matching-workspace-feature.tsx](/Users/realrong/Desktop/AI_RESUME/apps/web/src/features/matching/matching-workspace-feature.tsx)
- 建立 `MatchingConfigPanel`
- 建立 `MatchingScoreCards`
- 建立 `MatchingRadarChart`
- 建立 `MatchingSummaryPanel`
- 接入 `POST /api/matchings`

验收标准：

- 能选择 JD
- 能选择候选人
- 能展示综合分、子维度分、AI 评语

## 4.9 全局状态与交互细节

目标：

- 把页面从“能显示”提升到“能用”

要做的事：

- 接入全局 loading/skeleton
- 补全 API error 展示
- 补全空数据状态
- 统一表单提交中状态
- 建立 toast 反馈
- 建立删除/状态变更确认弹层

验收标准：

- 不出现裸错误
- 不出现白屏式等待
- 所有关键动作都有反馈

---

## 5. Jotai 落地要求

前端继续开发时必须遵守：

- 不新增散乱 atom
- 页面组件只调用 domain hooks
- 服务端实体数据与本地交互态分层
- 上传页的 SSE 状态统一放在 `upload-domain`
- 候选人筛选、分页、选择态统一放在 `candidate-domain`
- JD 编辑草稿统一放在 `job-domain`
- 匹配工作区统一放在 `matching-domain`

本阶段建议优先补全这些 actions：

- `upload-domain`
  - `enqueueUploads`
  - `setUploadProgress`
  - `appendUploadEvent`
  - `setPartialExtraction`
  - `markUploadCompleted`
  - `markUploadFailed`

- `candidate-domain`
  - `setKeyword`
  - `setPage`
  - `setSort`
  - `setFilters`
  - `setViewMode`
  - `hydrateList`

- `job-domain`
  - `setActiveJob`
  - `updateDraft`
  - `resetDraft`
  - `hydrateJobs`

- `matching-domain`
  - `setJobId`
  - `toggleCandidate`
  - `hydrateResults`

---

## 6. 样式红线

以下内容一律禁止：

- 渐变主背景扩散到业务后台
- 蓝紫色、橙色、彩色标签泛滥
- 组件风格混用 `shadcn/ui` 和自制大杂烩
- 高饱和按钮到处出现
- 页面元素阴影过重
- 用颜色代替排版层级

允许的强调方式：

- 字号
- 字重
- 边框
- 分割线
- 留白
- 局部深色按钮

---

## 7. 推荐下一步执行顺序

如果继续编码，建议按下面顺序一项一项落：

1. 先重构全局样式和页面 shell
2. 再安装并生成 `shadcn/ui` 基础组件
3. 然后先做上传页，因为它已经有后端主链路
4. 接着做候选人列表页和详情页
5. 最后做 JD 页和匹配分析页

---

## 8. 本阶段完成定义

这一阶段只有满足以下条件，才算前端进入可用状态：

- 全站基础组件来源统一为 `shadcn/ui`
- 页面视觉统一为黑白极简
- 上传页接通真实后端
- 候选人列表与详情接通真实 API
- 全局 loading / error / empty 状态齐全
- Jotai 领域建模没有被破坏

