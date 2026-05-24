# 交付状态

本文档用于对应 `REQUIREMENT.md` 的最终落地状态，区分：

- 已在仓库代码中完成
- 需要外部平台操作后才能真正生效

## 1. 已完成的代码能力

### 简历上传与解析

- 支持拖拽上传与点击上传，仅允许 PDF
- 支持批量上传，前端展示上传进度与处理状态
- 后端解析多页 PDF 文本并清洗
- 上传过程中生成 PDF 首页缩略图
- 上传过程中通过 SSE 持续返回结构化提取分段结果
- 前端逐步渲染：
  - 基本信息
  - 教育背景
  - 工作经历
  - 技能标签
  - 项目经历

### AI 智能信息提取

- 已接入 AI Provider 配置能力，前端可配置 `baseUrl` 与 `apiKey`
- 上传后使用单次 AI 调用完成结构化提取
- SSE 分段返回结构化内容，前端渐进展示
- 支持前端手动修正候选人信息
- 后端对常见日期格式做归一化处理，例如：
  - `2023`
  - `2023.06`
  - `2023/06`
  - `2023-06-15`

### 岗位匹配与智能评分

- 支持岗位创建与编辑
- 支持输入岗位描述、必备技能、加分技能
- 支持候选人与岗位的 AI/规则混合匹配评分
- 返回并展示：
  - 综合匹配度评分
  - 技能匹配度
  - 经验相关性
  - 教育背景契合度
  - AI 评语摘要
  - 优势、风险、证据摘要
- 匹配结果以可视化方式展示：
  - 环形分数视图
  - 维度进度条
- 支持多个 JD 同时对比评分
- 分析结果统一在 Drawer 中展示

### 候选人管理面板

- 候选人列表支持：
  - 表格视图 / 卡片视图切换
  - 按评分、上传时间、姓名排序
  - 按状态筛选
  - 按技能标签筛选
  - 关键字搜索：姓名、邮箱、城市、技能、学校
  - 分页
- 候选人详情页支持：
  - 完整结构化解析结果
  - 最近匹配评分详情
  - 原始 PDF 预览
  - 状态流转管理
  - 手动修正 AI 提取结果
- 支持候选人 2-3 人对比

### 前端工程质量

- 前端采用 `Next.js + React + Tailwind + shadcn 风格组件 + Jotai`
- Jotai 采用按领域拆分建模，不使用大量散乱业务 atom
- 业务调用通过 `useInstance()` / `instance.domain.action()` 组织
- 全站中文文案统一
- 黑白极简风格已收敛，减少无意义边框、阴影、卡片嵌套与冗余 padding
- 全局错误态、空态、加载态已补齐
- 已提供骨架屏
- 已支持深浅主题切换
- 已支持键盘快捷键
- 主布局滚动区域已限制为 `main`

## 2. 当前仓库中的关键页面

- `/upload`
  - 上传中心
  - 缩略图预览
  - SSE 渐进提取结果
- `/dashboard/candidates`
  - 候选人列表与筛选
  - 视图切换与多人对比
- `/dashboard/candidates/[id]`
  - 候选人详情
  - 手动修正
  - 匹配评分详情
  - PDF 预览
- `/dashboard/jobs`
  - 岗位管理
  - Drawer 编辑器
- `/dashboard/matching`
  - 单岗位分析
  - 多 JD 对比
  - Drawer 结果展示

## 3. 仍需你在外部平台完成的事项

这些不属于仓库代码本身，必须在平台侧执行：

- 在 Supabase 控制台确认：
  - SQL Schema 已执行
  - `resumes-private` bucket 已创建
  - 相关策略允许服务端上传与签名访问
- 在 Vercel 创建两个项目：
  - `resume-web`
  - `resume-api`
- 在 Vercel 分别注入环境变量
- 将 `NEXT_PUBLIC_API_BASE_URL` 指向线上 API 地址
- 将 `APP_BASE_URL` 与 `WEB_BASE_URL` 改为线上正式域名
- 根据是否启用 AI，补充可用的 OpenAI 兼容配置

## 4. 本地运行前提

需要准备：

- 根目录 `.env.local`
- `apps/api/.env.local`
- `apps/web/.env.local`

至少应包含：

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`
- `APP_BASE_URL`
- `WEB_BASE_URL`

`OPENAI_API_KEY` 当前不是必填，只要你在前端 AI 设置弹窗里填入兼容 Provider 配置即可。

## 5. 当前验证结果

已验证：

- `pnpm --filter @ai-resume/api build`
- `pnpm --filter @ai-resume/web build`

两端构建均通过。
