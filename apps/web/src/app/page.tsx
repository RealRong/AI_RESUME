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
import { getCandidateStatusLabel, getUploadStatusLabel } from "@/lib/utils/display";

const quickLinks: Array<{
  href: Route;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    href: "/upload",
    label: "上传简历",
    description: "批量导入 PDF，查看处理进度。",
    icon: Upload
  },
  {
    href: "/dashboard/candidates",
    label: "候选人",
    description: "查看列表、画像与详情。",
    icon: LayoutGrid
  },
  {
    href: "/dashboard/jobs",
    label: "岗位管理",
    description: "维护岗位描述、必备技能与加分项。",
    icon: BriefcaseBusiness
  },
  {
    href: "/dashboard/matching",
    label: "匹配分析",
    description: "选择岗位与候选人，生成匹配结果。",
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
      <header className="grid gap-5 border-b border-border pb-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="space-y-3">
          <p className="app-section-title">总览</p>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              智能简历分析工作台
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-fg-muted">
              在一个工作区内完成上传、候选人筛选、岗位维护与匹配分析，保持统一的处理节奏和信息视图。
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="outline">
            <Link href="/upload">上传简历</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/candidates">查看候选人</Link>
          </Button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="候选人"
          value={String(candidateRemote.total || candidateRemote.items.length)}
          detail="候选人总量"
        />
        <StatCard
          label="岗位"
          value={String(jobList.items.length)}
          detail="当前岗位数量"
        />
        <StatCard
          label="上传"
          value={String(queue.length)}
          detail="当前会话上传记录"
        />
        <StatCard
          label="匹配"
          value={String(matchingResults.items.length)}
          detail="最近生成的匹配结果"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>快捷入口</CardTitle>
            <CardDescription>从这里进入四个核心模块。</CardDescription>
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
            <CardTitle>当前状态</CardTitle>
            <CardDescription>快速查看上传、候选人和匹配进度。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">上传队列</p>
                <Badge variant="outline">{queue.length} 条</Badge>
              </div>
              <p className="mt-2 text-sm text-fg-muted">
                已完成 {queue.filter((item) => item.status === "completed").length}，失败{" "}
                {queue.filter((item) => item.status === "failed").length}。
              </p>
              {queue[0] ? (
                <p className="mt-2 text-sm text-fg-muted">
                  最近一条：{queue[0].fileName} · {getUploadStatusLabel(queue[0].status)}
                </p>
              ) : null}
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">候选人数据</p>
                <Badge variant="outline">
                  {candidateRemote.loading ? "加载中" : `${candidateRemote.items.length} 人`}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-fg-muted">
                {candidateRemote.error
                  ? `列表加载失败：${candidateRemote.error}`
                  : candidateRemote.items[0]
                    ? `最近候选人：${candidateRemote.items[0].name ?? "未识别姓名"} · ${getCandidateStatusLabel(candidateRemote.items[0].status)}`
                    : "上传并完成处理后，候选人会出现在这里。"}
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">匹配工作区</p>
                <Badge variant="outline">{workspace.candidateIds.length} 位已选</Badge>
              </div>
              <p className="mt-2 text-sm text-fg-muted">
                当前已选择 {workspace.candidateIds.length} 位候选人，目标岗位：
                {workspace.jobId ?? "未选择"}。
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </WorkspaceFrame>
  );
}
