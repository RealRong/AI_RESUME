# API App

Express API 骨架，负责上传、解析、SSE 与匹配评分接口。

## Local Env

本地开发默认从以下位置按顺序加载环境变量，已存在的系统环境变量优先级更高：

1. `apps/api/.env.local`
2. `apps/api/.env`
3. 根目录 `.env.local`
4. 根目录 `.env`

当前仓库已提供 `apps/api/.env` 模板，启动前至少需要把 `SUPABASE_SERVICE_ROLE_KEY` 替换为 Supabase service role key。
