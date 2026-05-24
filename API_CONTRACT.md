# API 契约文档

本文档定义前后端联调所需的 REST 与 SSE 契约，字段命名以实现优先，不追求过度抽象。

---

## 1. 通用约定

- Base URL:
  - 本地：`http://localhost:3001`
  - 线上：由 `NEXT_PUBLIC_API_BASE_URL` 注入
- 所有 JSON API 返回：

```json
{
  "data": {},
  "meta": {},
  "error": null
}
```

- 错误返回：

```json
{
  "data": null,
  "meta": {
    "requestId": "req_xxx"
  },
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request payload."
  }
}
```

---

## 2. 上传与解析

## `POST /api/uploads`

功能：

- 上传一个或多个 PDF
- 创建上传记录
- 启动解析任务

请求：

- `multipart/form-data`
- 字段名：`files`

响应：

```json
{
  "data": {
    "uploads": [
      {
        "uploadId": "uuid",
        "candidateId": "uuid",
        "fileName": "resume.pdf",
        "status": "uploaded"
      }
    ]
  },
  "meta": {},
  "error": null
}
```

## `GET /api/uploads/:uploadId`

响应：

```json
{
  "data": {
    "uploadId": "uuid",
    "status": "extracting",
    "fileName": "resume.pdf",
    "candidateId": "uuid",
    "errorMessage": null,
    "uploadedAt": "2026-05-24T10:00:00.000Z"
  },
  "meta": {},
  "error": null
}
```

## `GET /api/uploads/:uploadId/events`

类型：

- `text/event-stream`

事件示例：

```text
event: upload.progress
data: {"uploadId":"uuid","progress":25}

event: pdf.parsed
data: {"uploadId":"uuid","pageCount":2}

event: extract.partial
data: {"uploadId":"uuid","basic":{"name":"张三","email":"a@b.com"}}

event: extract.completed
data: {"uploadId":"uuid","candidateId":"uuid"}
```

---

## 3. 候选人

## `GET /api/candidates`

查询参数：

- `page`
- `pageSize`
- `keyword`
- `sortBy`
- `sortOrder`
- `status`
- `skills`

示例：

`/api/candidates?page=1&pageSize=20&keyword=react&sortBy=score&sortOrder=desc&status=pending,interviewing`

响应：

```json
{
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "张三",
        "email": "zhangsan@example.com",
        "city": "Shanghai",
        "status": "pending",
        "skills": ["React", "TypeScript", "Node.js"],
        "latestOverallScore": 86,
        "uploadedAt": "2026-05-24T10:00:00.000Z"
      }
    ]
  },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 132
  },
  "error": null
}
```

## `GET /api/candidates/:candidateId`

响应：

```json
{
  "data": {
    "id": "uuid",
    "basic": {
      "name": "张三",
      "phone": "13800000000",
      "email": "zhangsan@example.com",
      "city": "Shanghai"
    },
    "status": "interviewing",
    "skills": [
      { "name": "React", "type": "framework" }
    ],
    "education": [],
    "workExperiences": [],
    "projects": [],
    "latestMatching": {
      "jobId": "uuid",
      "overallScore": 86,
      "dimensionScores": {
        "skillMatch": 90,
        "experienceRelevance": 84,
        "educationFit": 78
      },
      "summary": "技能匹配较好，经验相关性较强。"
    },
    "pdfPreviewUrl": "https://..."
  },
  "meta": {},
  "error": null
}
```

## `PATCH /api/candidates/:candidateId`

功能：

- 前端人工修正候选人信息

请求：

```json
{
  "basic": {
    "name": "张三",
    "phone": "13800000000",
    "email": "zhangsan@example.com",
    "city": "Shanghai"
  },
  "skills": [
    { "name": "React", "type": "framework" }
  ],
  "education": [],
  "workExperiences": [],
  "projects": []
}
```

## `PATCH /api/candidates/:candidateId/status`

请求：

```json
{
  "status": "screening_passed"
}
```

响应：

```json
{
  "data": {
    "id": "uuid",
    "status": "screening_passed"
  },
  "meta": {},
  "error": null
}
```

---

## 4. JD

## `GET /api/jobs`

## `POST /api/jobs`

请求：

```json
{
  "title": "高级前端工程师",
  "description": "负责招聘业务平台开发",
  "requiredSkills": ["React", "TypeScript", "Next.js"],
  "bonusSkills": ["Node.js", "AI Product"]
}
```

## `GET /api/jobs/:jobId`

## `PATCH /api/jobs/:jobId`

## `DELETE /api/jobs/:jobId`

---

## 5. 匹配评分

## `POST /api/matchings`

请求：

```json
{
  "jobId": "uuid",
  "candidateIds": ["uuid1", "uuid2"]
}
```

响应：

```json
{
  "data": {
    "results": [
      {
        "matchingId": "uuid",
        "candidateId": "uuid1",
        "jobId": "uuid",
        "overallScore": 86,
        "dimensionScores": {
          "skillMatch": 90,
          "experienceRelevance": 84,
          "educationFit": 78
        },
        "summary": "候选人技能栈与岗位高度相关。",
        "strengths": ["React 经验充分"],
        "risks": ["教育背景不是明显优势"],
        "evidence": ["3 年 B 端系统经验"]
      }
    ]
  },
  "meta": {},
  "error": null
}
```

## `GET /api/matchings/:matchingId`

返回单条评分详情。

---

## 6. 服务端校验规则

- `POST /api/uploads`
  - 只允许 PDF
  - 建议单文件不超过 10MB
  - 单次不超过 10 个文件

- `PATCH /api/candidates/:id/status`
  - 状态必须在枚举内

- `POST /api/matchings`
  - `candidateIds` 长度为 `1~3`

---

## 7. 前端错误映射建议

- `UPLOAD_INVALID_FILE`：文件格式错误
- `UPLOAD_TOO_LARGE`：文件太大
- `PDF_PARSE_FAILED`：PDF 解析失败
- `AI_EXTRACTION_FAILED`：AI 提取失败
- `CANDIDATE_NOT_FOUND`：候选人不存在
- `JOB_NOT_FOUND`：JD 不存在
- `MATCHING_FAILED`：评分失败

