"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { PageShell } from "@/components/common/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/empty-state";
import { useCandidateListActions, useCandidateListState } from "@/domains/candidate/hooks";
import { useInstance } from "@/instance";
import { getCandidateStatusLabel } from "@/lib/utils/display";

function CandidateTableSkeleton() {
  return (
    <section>
      <div className="pb-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-52" />
        </div>
      </div>
      <div>
        <div className="divide-y divide-border">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="grid gap-4 py-4 first:pt-0 last:pb-0 md:grid-cols-[1.2fr_120px_80px_1fr_112px]"
            >
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-12" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-14 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
              <Skeleton className="h-9 w-20" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CandidateCardSkeleton() {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <article key={index} className="rounded-xl bg-muted/30 px-5 py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <div className="mt-4 space-y-4">
            <Skeleton className="h-4 w-32" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-14 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-7 w-12" />
            </div>
            <Skeleton className="h-9 w-full" />
          </div>
        </article>
      ))}
    </section>
  );
}

export function CandidateListFeature() {
  const instance = useInstance();
  const { query, remote } = useCandidateListState();
  const actions = useCandidateListActions();

  useEffect(() => {
    void instance.candidate.fetchList();
  }, [
    instance,
    query.keyword,
    query.page,
    query.pageSize,
    query.sortBy,
    query.sortOrder
  ]);

  return (
    <PageShell
      title="候选人"
      description="查看候选人列表、处理状态和核心信息。"
      actions={
        <Tabs value={query.viewMode} onValueChange={(value) => actions.setViewMode(value as "table" | "card")}>
          <TabsList>
            <TabsTrigger value="table">表格</TabsTrigger>
            <TabsTrigger value="card">卡片</TabsTrigger>
          </TabsList>
        </Tabs>
      }
      aside={
        <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative max-w-xl flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />
              <Input
                value={query.keyword}
                onChange={(event) => actions.setKeyword(event.target.value)}
                placeholder="搜索姓名、学校、技能"
                className="h-9 rounded-lg bg-muted/40 pl-9 focus-visible:ring-1"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-fg-muted">
            <span>共 {remote.total} 条</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => actions.setPage(Math.max(1, query.page - 1))}
              disabled={query.page <= 1}
            >
              上一页
            </Button>
            <span>第 {query.page} 页</span>
            <Button variant="outline" size="sm" onClick={() => actions.setPage(query.page + 1)}>
              下一页
            </Button>
          </div>
        </section>
      }
    >
      {remote.loading ? (
        query.viewMode === "table" ? <CandidateTableSkeleton /> : <CandidateCardSkeleton />
      ) : remote.error ? (
        <EmptyState title="加载失败" description={remote.error} />
      ) : remote.items.length === 0 ? (
        <EmptyState
          title="暂无候选人数据"
          description="完成简历上传后，候选人会出现在这里。"
        />
      ) : query.viewMode === "table" ? (
        <section>
          <div className="pb-4">
            <h2 className="text-lg font-semibold text-foreground">候选人列表</h2>
            <p className="mt-1 text-sm text-fg-muted">集中查看状态、评分和技能摘要。</p>
          </div>
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>姓名</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>评分</TableHead>
                  <TableHead>技能</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {remote.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{item.name ?? "未识别姓名"}</p>
                        <p className="text-xs text-fg-muted">{item.email ?? "未识别邮箱"}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="border-transparent">
                        {getCandidateStatusLabel(item.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{item.latestOverallScore ?? "--"}</span>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="flex flex-wrap gap-2">
                        {item.skills.length ? (
                          item.skills.slice(0, 4).map((skill) => (
                            <Badge key={skill} variant="secondary" className="border-transparent">
                              {skill}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-fg-muted">暂无技能</span>
                        )}
                        {item.skills.length > 4 ? (
                          <Badge variant="outline">+{item.skills.length - 4}</Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm">
                        <Link href={`/dashboard/candidates/${item.id}`}>查看详情</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {remote.items.map((item) => (
            <article key={item.id} className="rounded-xl bg-muted/30 px-5 py-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {item.name ?? "未识别姓名"}
                  </h3>
                  <p className="mt-1 text-sm text-fg-muted">{item.city ?? "城市未识别"}</p>
                </div>
                <Badge variant="secondary" className="border-transparent">
                  {getCandidateStatusLabel(item.status)}
                </Badge>
              </div>
              <div className="mt-4 space-y-4">
                <p className="text-sm text-fg-muted">{item.email ?? "未识别邮箱"}</p>
                <div className="flex flex-wrap gap-2">
                  {item.skills.length ? (
                    item.skills.slice(0, 4).map((skill) => (
                      <Badge key={skill} variant="secondary" className="border-transparent">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline">暂无技能</Badge>
                  )}
                  {item.skills.length > 4 ? <Badge variant="outline">+{item.skills.length - 4}</Badge> : null}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-fg-muted">综合分</span>
                  <span className="text-xl font-semibold">{item.latestOverallScore ?? "--"}</span>
                </div>
                <Button asChild className="w-full">
                  <Link href={`/dashboard/candidates/${item.id}`}>进入详情</Link>
                </Button>
              </div>
            </article>
          ))}
        </section>
      )}
    </PageShell>
  );
}
