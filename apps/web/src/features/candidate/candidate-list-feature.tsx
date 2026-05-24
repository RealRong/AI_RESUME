"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { CandidateStatus, CandidateListItem } from "@ai-resume/shared-types";
import { ArrowUpDown, Search, Scale } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { PageShell } from "@/components/common/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCandidateListActions, useCandidateListState } from "@/domains/candidate/hooks";
import { useInstance } from "@/instance";
import { cn } from "@/lib/utils";
import { getCandidateStatusLabel } from "@/lib/utils/display";

const STATUS_OPTIONS: CandidateStatus[] = [
  "pending",
  "screening_passed",
  "interviewing",
  "hired",
  "rejected"
];

function CandidateTableSkeleton() {
  return (
    <section>
      <div className="pb-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-52" />
        </div>
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="grid gap-4 py-4 first:pt-0 last:pb-0 md:grid-cols-[1.1fr_112px_80px_1fr_156px]"
          >
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-12" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-14 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="flex gap-2 justify-end">
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
        ))}
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

function CompareDialog({
  open,
  onOpenChange,
  items
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CandidateListItem[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[920px]">
        <DialogHeader>
          <DialogTitle>候选人对比</DialogTitle>
          <DialogDescription>并排查看候选人的状态、分数和技能摘要。</DialogDescription>
        </DialogHeader>
        {items.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <section key={item.id} className="space-y-4 rounded-xl bg-muted/20 px-4 py-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{item.name ?? "未识别姓名"}</h3>
                  <p className="mt-1 text-sm text-fg-muted">{item.email ?? "未识别邮箱"}</p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <Badge variant="secondary" className="border-transparent">
                    {getCandidateStatusLabel(item.status)}
                  </Badge>
                  <span className="text-xl font-semibold text-foreground">{item.latestOverallScore ?? "--"}</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-fg-muted">城市</span>
                    <span>{item.city ?? "--"}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-fg-muted">上传时间</span>
                    <span>{new Date(item.uploadedAt).toLocaleDateString("zh-CN")}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.skills.length ? item.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="border-transparent">
                      {skill}
                    </Badge>
                  )) : <span className="text-sm text-fg-muted">暂无技能</span>}
                </div>
                <Button asChild className="w-full">
                  <Link href={`/dashboard/candidates/${item.id}`}>进入详情</Link>
                </Button>
              </section>
            ))}
          </div>
        ) : (
          <EmptyState title="暂无对比对象" description="先勾选 2-3 位候选人，再打开对比。" inset />
        )}
      </DialogContent>
    </Dialog>
  );
}

export function CandidateListFeature() {
  const instance = useInstance();
  const { query, remote, selection } = useCandidateListState();
  const actions = useCandidateListActions();
  const [compareOpen, setCompareOpen] = useState(false);

  useEffect(() => {
    void instance.candidate.fetchList({
      page: 1,
      pageSize: 200
    });
  }, [instance]);

  const filteredItems = useMemo(() => {
    const items = [...remote.items];
    const normalizedKeyword = query.keyword.trim().toLowerCase();
    const keywordFiltered = normalizedKeyword
      ? items.filter((item) => {
          const haystacks = [
            item.name,
            item.email,
            item.city,
            ...item.skills,
            ...item.schools
          ]
            .filter(Boolean)
            .map((value) => String(value).toLowerCase());

          return haystacks.some((value) => value.includes(normalizedKeyword));
        })
      : items;

    const statusFiltered = query.filters.status.length
      ? keywordFiltered.filter((item) => query.filters.status.includes(item.status))
      : keywordFiltered;

    const skillFiltered = query.filters.skills.length
      ? statusFiltered.filter((item) =>
          query.filters.skills.every((skill) => item.skills.includes(skill))
        )
      : statusFiltered;

    const sortedItems = [...skillFiltered].sort((a, b) => {
      if (query.sortBy === "name") {
        const left = a.name ?? "";
        const right = b.name ?? "";
        return query.sortOrder === "asc" ? left.localeCompare(right) : right.localeCompare(left);
      }

      if (query.sortBy === "score") {
        const left = a.latestOverallScore ?? -1;
        const right = b.latestOverallScore ?? -1;
        return query.sortOrder === "asc" ? left - right : right - left;
      }

      const left = new Date(a.uploadedAt).getTime();
      const right = new Date(b.uploadedAt).getTime();
      return query.sortOrder === "asc" ? left - right : right - left;
    });

    return sortedItems;
  }, [query.filters.skills, query.filters.status, query.keyword, query.sortBy, query.sortOrder, remote.items]);

  const topSkills = useMemo(() => {
    const counts = new Map<string, number>();

    for (const item of remote.items) {
      for (const skill of item.skills) {
        counts.set(skill, (counts.get(skill) ?? 0) + 1);
      }
    }

    return [...counts.entries()]
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
      .slice(0, 8)
      .map(([skill]) => skill);
  }, [remote.items]);

  const pageCount = Math.max(1, Math.ceil(filteredItems.length / query.pageSize));
  const safePage = Math.min(query.page, pageCount);
  const pageItems = useMemo(() => {
    const start = (safePage - 1) * query.pageSize;
    return filteredItems.slice(start, start + query.pageSize);
  }, [filteredItems, query.pageSize, safePage]);

  const compareItems = useMemo(
    () => filteredItems.filter((item) => selection.compareIds.includes(item.id)),
    [filteredItems, selection.compareIds]
  );

  return (
    <>
      <PageShell
        title="候选人"
        description="查看候选人列表、处理状态和核心信息。支持排序、筛选、对比和详情查看。"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCompareOpen(true)}
              disabled={selection.compareIds.length < 2}
            >
              <Scale className="h-4 w-4" />
              对比 {selection.compareIds.length}
            </Button>
            <Tabs value={query.viewMode} onValueChange={(value) => actions.setViewMode(value as "table" | "card")}>
              <TabsList>
                <TabsTrigger value="table">表格</TabsTrigger>
                <TabsTrigger value="card">卡片</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        }
        aside={
          <section className="space-y-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative max-w-xl flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />
                <Input
                  value={query.keyword}
                  onChange={(event) => actions.setKeyword(event.target.value)}
                  placeholder="搜索姓名、技能、学校、邮箱"
                  className="h-9 rounded-lg bg-muted/40 pl-9 focus-visible:ring-1"
                />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => actions.setSort({
                    sortBy: query.sortBy === "uploadedAt" ? "score" : query.sortBy === "score" ? "name" : "uploadedAt",
                    sortOrder: query.sortOrder
                  })}
                >
                  <ArrowUpDown className="h-4 w-4" />
                  {query.sortBy === "uploadedAt" ? "按上传时间" : query.sortBy === "score" ? "按评分" : "按姓名"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    actions.setSort({
                      sortBy: query.sortBy,
                      sortOrder: query.sortOrder === "asc" ? "desc" : "asc"
                    })
                  }
                >
                  {query.sortOrder === "asc" ? "升序" : "降序"}
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {STATUS_OPTIONS.map((status) => {
                const active = query.filters.status.includes(status);

                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => actions.toggleStatusFilter(status)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs transition-colors",
                      active ? "bg-foreground text-background" : "bg-muted text-fg-muted hover:text-foreground"
                    )}
                  >
                    {getCandidateStatusLabel(status)}
                  </button>
                );
              })}
              <span className="ml-auto text-sm text-fg-muted">共 {filteredItems.length} 条</span>
            </div>

            {topSkills.length ? (
              <div className="flex flex-wrap items-center gap-2">
                {topSkills.map((skill) => {
                  const active = query.filters.skills.includes(skill);

                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => actions.toggleSkillFilter(skill)}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs transition-colors",
                        active ? "bg-foreground text-background" : "bg-muted text-fg-muted hover:text-foreground"
                      )}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </section>
        }
      >
        {remote.loading ? (
          query.viewMode === "table" ? <CandidateTableSkeleton /> : <CandidateCardSkeleton />
        ) : remote.error ? (
          <EmptyState title="加载失败" description={remote.error} />
        ) : filteredItems.length === 0 ? (
          <EmptyState title="暂无候选人数据" description="完成简历上传后，候选人会出现在这里。" />
        ) : query.viewMode === "table" ? (
          <section>
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
                {pageItems.map((item) => {
                  const comparing = selection.compareIds.includes(item.id);
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{item.name ?? "未识别姓名"}</p>
                          <p className="text-xs text-fg-muted">{item.email ?? "未识别邮箱"}</p>
                          {item.schools[0] ? <p className="text-xs text-fg-muted">{item.schools[0]}</p> : null}
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
                          {item.skills.length ? item.skills.slice(0, 4).map((skill) => (
                            <Badge key={skill} variant="secondary" className="border-transparent">
                              {skill}
                            </Badge>
                          )) : <span className="text-fg-muted">暂无技能</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => actions.toggleCompare(item.id)}>
                            {comparing ? "取消对比" : "加入对比"}
                          </Button>
                          <Button asChild size="sm">
                            <Link href={`/dashboard/candidates/${item.id}`}>查看详情</Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </section>
        ) : (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pageItems.map((item) => {
              const comparing = selection.compareIds.includes(item.id);
              return (
                <article key={item.id} className="rounded-xl border bg-muted/30 px-5 py-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{item.name ?? "未识别姓名"}</h3>
                      <p className="mt-1 text-sm text-fg-muted">{item.city ?? "城市未识别"}</p>
                    </div>
                    <Badge variant="secondary" className="border-transparent">
                      {getCandidateStatusLabel(item.status)}
                    </Badge>
                  </div>
                  <div className="mt-4 space-y-4">
                    <p className="text-sm text-fg-muted">{item.email ?? "未识别邮箱"}</p>
                    <div className="flex flex-wrap gap-2">
                      {item.skills.length ? item.skills.slice(0, 4).map((skill) => (
                        <Badge key={skill} variant="secondary" className="border-transparent">
                          {skill}
                        </Badge>
                      )) : <Badge variant="outline">暂无技能</Badge>}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-fg-muted">综合分</span>
                      <span className="text-xl font-semibold">{item.latestOverallScore ?? "--"}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => actions.toggleCompare(item.id)}>
                        {comparing ? "取消对比" : "加入对比"}
                      </Button>
                      <Button asChild className="flex-1">
                        <Link href={`/dashboard/candidates/${item.id}`}>进入详情</Link>
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {filteredItems.length ? (
          <section className="mt-6 flex items-center justify-end gap-3 text-sm text-fg-muted">
            <Button
              variant="outline"
              size="sm"
              onClick={() => actions.setPage(Math.max(1, safePage - 1))}
              disabled={safePage <= 1}
            >
              上一页
            </Button>
            <span>第 {safePage} / {pageCount} 页</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => actions.setPage(Math.min(pageCount, safePage + 1))}
              disabled={safePage >= pageCount}
            >
              下一页
            </Button>
          </section>
        ) : null}
      </PageShell>

      <CompareDialog open={compareOpen} onOpenChange={setCompareOpen} items={compareItems} />
    </>
  );
}
