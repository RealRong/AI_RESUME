"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { PageShell } from "@/components/common/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/empty-state";
import { useCandidateListActions, useCandidateListState } from "@/domains/candidate/hooks";
import { useInstance } from "@/instance";

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
      title="候选人面板"
      description="列表页负责搜索、分页、视图切换和进入详情。请求入口统一通过 candidate instance。"
      actions={
        <Tabs value={query.viewMode} onValueChange={(value) => actions.setViewMode(value as "table" | "card")}>
          <TabsList>
            <TabsTrigger value="table">表格</TabsTrigger>
            <TabsTrigger value="card">卡片</TabsTrigger>
          </TabsList>
        </Tabs>
      }
      aside={
        <section className="app-toolbar">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-muted" />
              <Input
                value={query.keyword}
                onChange={(event) => actions.setKeyword(event.target.value)}
                placeholder="搜索姓名、学校、技能"
                className="pl-9"
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
      {remote.error ? (
        <EmptyState title="加载失败" description={remote.error} />
      ) : remote.items.length === 0 ? (
        <EmptyState
          title="暂无候选人数据"
          description="当前后端还没有候选人记录。完成上传解析后，这里会展示真实列表。"
        />
      ) : query.viewMode === "table" ? (
        <Card>
          <CardHeader>
            <CardTitle>Candidate Table</CardTitle>
            <CardDescription>状态、评分和技能摘要保持在同一层级，避免彩色噪音。</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>姓名</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>评分</TableHead>
                  <TableHead>技能</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {remote.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.name ?? "未识别姓名"}</p>
                        <p className="text-xs text-fg-muted">{item.email ?? "no email"}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.status}</Badge>
                    </TableCell>
                    <TableCell>{item.latestOverallScore ?? "--"}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="flex flex-wrap gap-2">
                        {item.skills.length ? item.skills.map((skill) => <Badge key={skill}>{skill}</Badge>) : <span className="text-fg-muted">暂无技能</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/candidates/${item.id}`}>查看详情</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {remote.items.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>{item.name ?? "未识别姓名"}</CardTitle>
                    <CardDescription>{item.city ?? "城市未识别"}</CardDescription>
                  </div>
                  <Badge variant="outline">{item.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-fg-muted">{item.email ?? "no email"}</p>
                <div className="flex flex-wrap gap-2">
                  {item.skills.length ? item.skills.map((skill) => <Badge key={skill}>{skill}</Badge>) : <Badge variant="outline">暂无技能</Badge>}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-fg-muted">综合分</span>
                  <span className="text-xl font-semibold">{item.latestOverallScore ?? "--"}</span>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/dashboard/candidates/${item.id}`}>进入详情</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </PageShell>
  );
}
