# Jotai 领域建模指南

本文档单独约束前端状态建模，优先级高于组件实现习惯。实现阶段如与局部便利性冲突，以本指南为准。

---

## 1. 核心规则

- Jotai 只做领域状态，不做数据库替身
- 每个领域控制在 `1~3` 个根 atom
- 页面组件不允许直接定义业务 atom
- 不允许把筛选器、弹窗、选中项拆成遍地 atom
- 所有写操作必须经由 actions 或 domain hooks

---

## 2. 领域划分

## `candidate-domain`

负责：

- 候选人列表查询条件
- 列表数据
- 选择态
- 对比态
- 详情态缓存

## `upload-domain`

负责：

- 当前上传队列
- 上传进度
- SSE 订阅状态
- 提取中间结果

## `job-domain`

负责：

- JD 列表
- JD 编辑草稿
- 当前选中的 JD

## `matching-domain`

负责：

- 当前评分工作区
- 候选人与 JD 的组合选择
- 评分结果缓存

## `ui-domain`

负责：

- 全局 Drawer/Sheet 这类真正跨页面共享的 UI 状态
- 主题切换

---

## 3. 推荐文件结构

```text
domains/candidate
├── atoms.ts
├── selectors.ts
├── actions.ts
├── hooks.ts
└── types.ts
```

---

## 4. 正确示例

```ts
type CandidateListState = {
  query: {
    keyword: string;
    page: number;
    pageSize: number;
    sortBy: 'score' | 'uploadedAt' | 'name';
    sortOrder: 'asc' | 'desc';
    filters: {
      status: string[];
      skills: string[];
    };
    viewMode: 'table' | 'card';
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
  };
};
```

这类聚合结构是允许的，因为它表达的是“候选人列表领域状态”。

---

## 5. 错误示例

以下命名方式原则上禁止：

- `searchTextAtom`
- `statusFilterAtom`
- `skillsFilterAtom`
- `sortByAtom`
- `sortOrderAtom`
- `tableViewAtom`
- `compareModalOpenAtom`
- `selectedRowIdsAtom`

问题不是这些字段不能存在，而是它们不应该以彼此割裂的 atom 形式散落。

---

## 6. 推荐 API

页面消费：

- `useCandidateListState()`
- `useCandidateListActions()`
- `useCandidateDetailState()`
- `useUploadQueueState()`
- `useUploadQueueActions()`
- `useMatchingWorkspaceState()`

页面不直接消费：

- `useAtom(candidateListStateAtom)` 后到处手写 set

---

## 7. 建议领域接口

## candidate actions

- `setKeyword(keyword: string)`
- `setPage(page: number)`
- `setSort(sortBy, sortOrder)`
- `setFilters(filters)`
- `setViewMode(viewMode)`
- `toggleSelected(id: string)`
- `toggleCompare(id: string)`
- `hydrateList(payload)`
- `setListLoading(loading: boolean)`
- `setListError(message: string | null)`

## upload actions

- `enqueueFiles(files)`
- `setUploadProgress(uploadId, progress)`
- `appendEvent(uploadId, event)`
- `setPartialExtraction(uploadId, payload)`
- `markUploadCompleted(uploadId, candidateId)`
- `markUploadFailed(uploadId, error)`

---

## 8. Provider 策略

- 全局共享领域放在 App 级 Provider
- 上传页或详情页的短生命周期草稿态可放子树 Provider
- 离开页面就应该释放的状态，不进全局根 Provider

---

## 9. 与服务端数据的关系

Jotai 中的数据分为两类：

- 远端快照：API 返回的实体数据
- 本地会话态：筛选、选择、编辑草稿、上传进度

要求：

- 远端快照不随意局部手改
- 如发生人工修正，应经过表单草稿态提交到服务端
- 提交成功后重新 hydrate 领域状态

---

## 10. 代码审查红线

出现以下任一情况，视为不符合本项目约束：

- 一个页面内定义多个业务 atom
- 为每个筛选项各写一个 atom
- 组件树跨层直接 set 多个 atom 协调业务
- 没有 actions 层，页面直接拼写状态结构
- 同一领域状态分别存在于 React state、Jotai、URL 三处且无统一来源

