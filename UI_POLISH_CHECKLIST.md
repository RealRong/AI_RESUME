# UI 美化清单

本文档用于约束下一轮前端 UI 收敛工作，作为直接落地依据。  
范围限定为 `apps/web`，并继续遵循已有约束：

- 样式唯一源文件是 [apps/web/src/global.css](/Users/realrong/Desktop/AI_RESUME/apps/web/src/global.css)
- 组件必须严格基于 `shadcn/ui`
- 风格必须保持黑白极简
- 颜色必须继续使用语义 token，不允许回退到具体调色板 class
- 页面交互与数据流继续走 `useInstance() -> instance.domain.action(...)`

---

## 1. 本轮目标

这一轮不新增业务能力，重点做现有界面的视觉收敛和文案清理：

1. 侧边栏正规化，贴紧左侧，与屏幕同高，去掉无意义阴影。
2. 页面主布局收紧，减少 demo 感和浮层感。
3. 清理无意义 debug 文本、占位说明、技术实现提示。
4. 全站统一为中文文案，不再混用英文导航和英文标题。
5. 保持 `shadcn` 组件体系和 `global.css` 语义样式的一致性。

---

## 2. Sidebar 改造

目标是把当前 sidebar 从“卡片式漂浮导航”改成“应用主导航”。

### 2.1 布局改造

- 调整 [apps/web/src/components/common/workspace-frame.tsx](/Users/realrong/Desktop/AI_RESUME/apps/web/src/components/common/workspace-frame.tsx)。
- 调整 [apps/web/src/components/common/app-sidebar.tsx](/Users/realrong/Desktop/AI_RESUME/apps/web/src/components/common/app-sidebar.tsx)。
- Sidebar 在桌面端必须贴紧左边，不再作为居中网格里的一张卡片。
- Sidebar 必须与屏幕同高，至少达到 `min-h-screen` 级别。
- 主内容区和 sidebar 分离，形成明确的“左导航 / 右工作区”结构。
- 页面整体容器不要再把 sidebar 包进一个大居中盒子里。

### 2.2 视觉改造

- 去掉 sidebar 外层无意义 `shadow`。
- 去掉过强的圆角卡片感，弱化“浮起来”的感觉。
- 保留必要边框，但边框只用于结构分隔，不用于制造装饰感。
- sidebar 背景、分隔线、选中态全部使用 `global.css` 里的语义 token。
- 导航项的选中态要更清晰，但不能依赖彩色强调。

### 2.3 文案改造

当前存在英文导航和英文标题，需统一改中文：

- `Upload` -> `上传简历`
- `Candidates` -> `候选人`
- `Jobs` -> `岗位管理`
- `Matching` -> `匹配分析`
- `Workspace` -> `工作台`

需要同步清理 sidebar 内这种偏说明书式文案：

- `所有业务页都从同一导航骨架进入。`

这类文案不是产品信息，应该删除或替换成简短产品级描述。

### 2.4 验收标准

- 桌面端 sidebar 贴左显示，不悬浮，不漂移。
- sidebar 与屏幕同高。
- sidebar 没有无意义阴影。
- 导航文案全部中文。
- 导航选中态统一、稳定、极简。

---

## 3. 页面主框架收敛

### 3.1 布局密度

- 收紧页面外边距和顶部留白，避免过大的 demo 式留白。
- 页面内容区保留阅读舒适度，但不要出现“内容缩在中间、两边大片空白”的问题。
- 首页、上传页、候选人页、岗位页、匹配页的页头层级要统一。

### 3.2 容器样式

- 去掉无意义的大圆角、大阴影、过度嵌套卡片。
- 卡片存在的前提必须是为了结构分组，而不是为了“看起来像设计稿”。
- 优先使用边框、留白、字重建立层级，而不是叠影和装饰块。

### 3.3 验收标准

- 各页都遵循同一 Shell 规则。
- 页面结构清楚，但没有过度包装。
- 首屏看起来像正式应用，而不是 demo 展示页。

---

## 4. Debug 文本清理

当前部分页面仍带有明显的开发阶段说明文案，需要清理。

### 4.1 重点清理方向

- 删除“接口暂未返回”“这里会展示事件”“当前接口没有返回”这类偏开发说明文本。
- 删除仅用于解释实现状态的占位段落。
- 删除不面向最终用户的技术术语提示。
- 删除“同一导航骨架”“工作区状态”这类内部表达。

### 4.2 需要重点检查的现有页面

- [apps/web/src/app/page.tsx](/Users/realrong/Desktop/AI_RESUME/apps/web/src/app/page.tsx)
- [apps/web/src/features/upload/upload-workspace.tsx](/Users/realrong/Desktop/AI_RESUME/apps/web/src/features/upload/upload-workspace.tsx)
- [apps/web/src/features/candidate/candidate-detail-feature.tsx](/Users/realrong/Desktop/AI_RESUME/apps/web/src/features/candidate/candidate-detail-feature.tsx)
- [apps/web/src/features/candidate/candidate-list-feature.tsx](/Users/realrong/Desktop/AI_RESUME/apps/web/src/features/candidate/candidate-list-feature.tsx)
- [apps/web/src/features/job/job-list-feature.tsx](/Users/realrong/Desktop/AI_RESUME/apps/web/src/features/job/job-list-feature.tsx)
- [apps/web/src/features/matching/matching-workspace-feature.tsx](/Users/realrong/Desktop/AI_RESUME/apps/web/src/features/matching/matching-workspace-feature.tsx)

### 4.3 替换原则

- 开发态解释文案改成产品态提示文案。
- 空状态只说明“现在没有什么”和“下一步做什么”。
- 错误态只说明“发生了什么”和“如何重试”。
- 不向用户暴露实现细节，例如 `SSE`、`api`、`pdfPreviewUrl`、`extracting`、`completed` 这类内部术语。

### 4.4 验收标准

- 页面上不再出现面向开发者的说明文本。
- 空态、错态、加载态都能被普通中文用户直接理解。

---

## 5. 中文统一

### 5.1 范围

全站所有用户可见文案都要统一为中文，包括：

- 导航
- 页头标题
- 卡片标题
- 表单标签
- 空状态
- 错误提示
- 按钮文案
- 列表状态
- 上传状态

### 5.2 现有明显英文项

当前需要优先替换的包括但不限于：

- `Dashboard Overview`
- `Workspace Status`
- `Candidates`
- `Jobs`
- `Matching`
- `Upload`
- `loading` / `completed` / `uploading` / `parsing` / `extracting`

### 5.3 状态文案建议

业务状态面向用户时建议转成中文展示：

- `uploading` -> `上传中`
- `parsing` -> `解析中`
- `extracting` -> `提取中`
- `completed` -> `已完成`
- `failed` -> `失败`

注意：

- 领域状态枚举本身可以继续保留英文，避免影响程序结构。
- 但 UI 展示层必须做统一中文映射，不直接裸露英文状态值。

### 5.4 验收标准

- 所有用户可见文案统一为中文。
- 不再混杂中英双语导航和标题。
- 内部状态值不直接展示给用户。

---

## 6. 首页与各业务页收敛建议

### 6.1 首页

- 首页从“概览型 dashboard”继续收敛为真正的工作台首页。
- 去掉演示感较强的统计块文案。
- 强化“最近上传 / 待处理 / 快捷入口”这类真实工作流信息。
- 首页标题与副标题统一中文。

### 6.2 上传页

- 上传区域文案全部中文。
- 上传记录只保留必要字段，不展示技术实现细节。
- 事件流展示如果保留，应转成用户可理解的时间线或状态列表。

### 6.3 候选人页

- 列表页突出筛选、状态、基本信息，不要堆开发态说明。
- 详情页空态和预览态文案全部转中文产品表达。

### 6.4 岗位页

- 统一将 `JD` 相关区域做成中文信息架构，但可以保留 `JD` 这个行业缩写。
- 表单说明文案不要过长。

### 6.5 匹配页

- 页面目标表达为“选择岗位并发起匹配分析”。
- 空状态和按钮说明以动作导向为主，不写实现细节。

---

## 7. 样式约束

本轮继续严格遵循以下规则：

- 不允许使用 `zinc-*`、`gray-*`、`slate-*` 这类原始调色板类名作为主要样式语言。
- 优先使用 `bg-background`、`text-foreground`、`text-fg-muted`、`border-border`、`bg-muted`、`text-accent` 等语义类名。
- 如需补充语义映射，应优先修改：
  - [apps/web/src/global.css](/Users/realrong/Desktop/AI_RESUME/apps/web/src/global.css)
  - [apps/web/tailwind.preset.cjs](/Users/realrong/Desktop/AI_RESUME/apps/web/tailwind.preset.cjs)
- 不允许为了局部页面方便，重新引入一套“临时颜色规则”。

---

## 8. 实施顺序

建议按下面顺序落地：

1. 重构 `WorkspaceFrame` 和 `AppSidebar`。
2. 统一导航中文化。
3. 统一页头、卡片和页面容器样式。
4. 清理首页 debug 文案。
5. 清理上传页 debug 文案和状态展示。
6. 清理候选人页、岗位页、匹配页的空态和错误态文案。
7. 建立全局状态文案映射，禁止直接显示英文状态值。
8. 做一次全站走查，检查是否仍残留英文或开发态说明。

---

## 9. 完成标准

这一轮完成后，前端至少要达到：

- Sidebar 已成为正式应用导航，而不是浮动卡片。
- 全站中文统一。
- 开发态说明文案全部清理。
- 视觉上没有多余阴影、漂浮感和演示感。
- 页面结构更像正式产品，可继续进入下一轮细节打磨。
