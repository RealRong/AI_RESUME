"use client";

import { useEffect } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, BriefcaseBusiness, LayoutGrid, SearchCheck, Upload } from "lucide-react";
import { WorkspaceFrame } from "@/components/common/workspace-frame";
import { StatCard } from "@/components/common/stat-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useInstance } from "@/instance";
import { useCandidateListState } from "@/domains/candidate/hooks";
import { useJobState } from "@/domains/job/hooks";
import { useMatchingWorkspaceState } from "@/domains/matching/hooks";
import { useUploadQueueState } from "@/domains/upload/hooks";

const quickLinks: Array<{
  href: Route;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    href: "/upload",
    label: "上传简历",
    description: "批量上传 PDF，并通过 SSE 观察解析进度。",
    icon: Upload
  },
  {
    href: "/dashboard/candidates",
    label: "候选人面板",
    description: "查看候选人列表、技能标签和详情页。",
    icon: LayoutGrid
  },
  {
    href: "/dashboard/jobs",
    label: "岗位 JD",
    description: "维护岗位描述、必备技能与加分项。",
    icon: BriefcaseBusiness
  },
  {
    href: "/dashboard/matching",
    label: "匹配分析",
    description: "选择 JD 和候选人，生成结构化评分。",
    icon: SearchCheck
  }
];

export default function HomePage() {
  const instance = useInstance();
  const { remote: candidateRemote } = useCandidateListState();
  const { list: jobList } = useJobState();
  const { results: matchingResults, workspace } = useMatchingWorkspaceState();
  const { queue } = useUploadQueueState();

  useEffect(() => {
    void instance.candidate.fetchList();
    void instance.job.fetchList();
  }, [instance]);

  return (
    <WorkspaceFrame>
      <header className="grid gap-6 border-b border-border pb-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="space-y-3">
          <p className="app-section-title">Dashboard Overview</p>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              智能简历分析工作台
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-fg-muted">
              首页现在作为统一概览页存在。上传、候选人、JD 与匹配分析都通过左侧导航进入，不再是一个只负责跳转的入口页。
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="outline">
            <Link href="/upload">上传简历</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/candidates">进入候选人面板</Link>
          </Button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Candidates"
          value={String(candidateRemote.total || candidateRemote.items.length)}
          detail="候选人总量"
        />
        <StatCard
          label="Jobs"
          value={String(jobList.items.length)}
          detail="当前 JD 数量"
        />
        <StatCard
          label="Uploads"
          value={String(queue.length)}
          detail="本次会话上传队列"
        />
        <StatCard
          label="Matching"
          value={String(matchingResults.items.length)}
          detail="最近评分结果数"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>优先从这里进入四个核心业务模块。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl border border-border bg-background p-5 transition hover:bg-muted"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      <div className="inline-flex rounded-md border border-border bg-card p-2">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-base font-medium text-foreground">{item.label}</p>
                        <p className="mt-2 text-sm leading-6 text-fg-muted">{item.description}</p>
                      </div>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 text-fg-muted" />
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workspace Status</CardTitle>
            <CardDescription>基于当前 domain 状态展示工作区进度。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">上传队列</p>
                <Badge variant="outline">{queue.length} items</Badge>
              </div>
              <p className="mt-2 text-sm text-fg-muted">
                已完成 {queue.filter((item) => item.status === "completed").length}，失败{" "}
                {queue.filter((item) => item.status === "failed").length}。
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">候选人数据</p>
                <Badge variant="outline">
                  {candidateRemote.loading ? "loading" : `${candidateRemote.items.length} loaded`}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-fg-muted">
                {candidateRemote.error
                  ? `列表加载报错：${candidateRemote.error}`
                  : "候选人列表已通过 candidate instance 同步到 candidate-domain。"}
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">匹配工作区</p>
                <Badge variant="outline">{workspace.candidateIds.length} selected</Badge>
              </div>
              <p className="mt-2 text-sm text-fg-muted">
                当前已选择 {workspace.candidateIds.length} 位候选人，目标 JD：
                {workspace.jobId ?? "未选择"}。
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </WorkspaceFrame>
  );
}
