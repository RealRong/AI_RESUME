"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BriefcaseBusiness, Check, SearchCheck, Users } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { PageShell } from "@/components/common/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useCandidateListState } from "@/domains/candidate/hooks";
import { useJobState } from "@/domains/job/hooks";
import { useMatchingWorkspaceActions, useMatchingWorkspaceState } from "@/domains/matching/hooks";
import { useInstance } from "@/instance";
import { cn } from "@/lib/utils";

function SelectionSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-xl border border-border bg-muted/30 px-3 py-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-2 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-4/5" />
        </div>
      ))}
    </div>
  );
}

function MetricBar({
  label,
  value
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="text-fg-muted">{label}</span>
        <span className="font-medium text-foreground">{value}</span>
      </div>
      <Progress value={value} />
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  return (
    <div
      className="grid h-20 w-20 place-items-center rounded-full"
      style={{
        background: `conic-gradient(from 180deg, hsl(var(--foreground)) ${score}%, hsl(var(--border)) ${score}% 100%)`
      }}
    >
      <div className="grid h-14 w-14 place-items-center rounded-full bg-background text-lg font-semibold text-foreground">
        {score}
      </div>
    </div>
  );
}

function ResultColumn({
  title,
  items
}: {
  title: string;
  items: string[];
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      {items.length ? (
        <div className="space-y-1 text-sm leading-6 text-fg-muted">
          {items.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      ) : (
        <p className="text-sm text-fg-muted">暂无内容</p>
      )}
    </section>
  );
}

export function MatchingWorkspaceFeature() {
  const instance = useInstance();
  const { list: jobList } = useJobState();
  const { remote: candidateRemote } = useCandidateListState();
  const { workspace, results } = useMatchingWorkspaceState();
  const actions = useMatchingWorkspaceActions();
  const [resultDrawerOpen, setResultDrawerOpen] = useState(false);
  const [compareJobIds, setCompareJobIds] = useState<string[]>([]);

  useEffect(() => {
    void instance.job.fetchList();
    void instance.candidate.fetchList();
  }, [instance]);

  const selectedJob = useMemo(
    () => jobList.items.find((job) => job.id === workspace.jobId) ?? null,
    [jobList.items, workspace.jobId]
  );

  const selectedCandidates = useMemo(
    () => candidateRemote.items.filter((candidate) => workspace.candidateIds.includes(candidate.id)),
    [candidateRemote.items, workspace.candidateIds]
  );

  const analysisJobIds = useMemo(() => {
    const ids = workspace.jobId ? [workspace.jobId, ...compareJobIds.filter((id) => id !== workspace.jobId)] : compareJobIds;
    return Array.from(new Set(ids));
  }, [compareJobIds, workspace.jobId]);

  const canRun = analysisJobIds.length > 0 && workspace.candidateIds.length > 0 && !results.loading;

  const resultsByJob = useMemo(() => {
    return analysisJobIds.map((jobId) => ({
      job: jobList.items.find((item) => item.id === jobId) ?? null,
      results: results.items.filter((item) => item.jobId === jobId)
    }));
  }, [analysisJobIds, jobList.items, results.items]);

  function toggleCompareJob(jobId: string) {
    setCompareJobIds((prev) =>
      prev.includes(jobId) ? prev.filter((item) => item !== jobId) : [...prev, jobId].slice(0, 3)
    );
  }

  async function runMatching() {
    if (!analysisJobIds.length || workspace.candidateIds.length === 0) {
      return;
    }

    if (analysisJobIds.length === 1) {
      const primaryJobId = analysisJobIds[0];

      if (!primaryJobId) {
        return;
      }

      await instance.matching.createMatching({
        jobId: primaryJobId,
        candidateIds: workspace.candidateIds
      });
    } else {
      await instance.matching.compareJobs({
        jobIds: analysisJobIds,
        candidateIds: workspace.candidateIds
      });
    }

    setResultDrawerOpen(true);
  }

  return (
    <>
      <PageShell
        title="岗位匹配分析"
        description="支持单岗位分析和多 JD 对比，结果统一在右侧抽屉查看。"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setResultDrawerOpen(true)}
              disabled={!results.items.length && !results.loading && !results.error}
            >
              查看结果
            </Button>
            <Button onClick={() => void runMatching()} disabled={!canRun}>
              {results.loading ? "分析中..." : analysisJobIds.length > 1 ? "开始对比" : "开始分析"}
            </Button>
          </div>
        }
        aside={
          <section className="grid gap-3 md:grid-cols-4">
            <div className="rounded-xl border border-border bg-muted/20 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.14em] text-fg-muted">主岗位</p>
              <p className="mt-2 text-sm font-medium text-foreground">{selectedJob ? selectedJob.title : "未选择"}</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/20 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.14em] text-fg-muted">对比 JD</p>
              <p className="mt-2 text-sm font-medium text-foreground">{compareJobIds.length} 个</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/20 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.14em] text-fg-muted">候选人</p>
              <p className="mt-2 text-sm font-medium text-foreground">已选 {workspace.candidateIds.length} / 3</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/20 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.14em] text-fg-muted">模式</p>
              <p className="mt-2 text-sm font-medium text-foreground">{analysisJobIds.length > 1 ? "多 JD 对比" : "单岗位分析"}</p>
            </div>
          </section>
        }
      >
        <section className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
          <section className="rounded-xl border border-border bg-muted/20">
            <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
              <div>
                <h2 className="text-base font-semibold text-foreground">岗位</h2>
                <p className="mt-1 text-sm text-fg-muted">选择主岗位，并可附加 1-2 个对比 JD。</p>
              </div>
              <Badge variant="outline">{analysisJobIds.length} 个待分析</Badge>
            </div>
            <div className="space-y-2 px-4 py-4">
              {jobList.loading ? (
                <SelectionSkeleton />
              ) : jobList.error ? (
                <EmptyState title="岗位加载失败" description={jobList.error} inset />
              ) : jobList.items.length === 0 ? (
                <EmptyState title="暂无岗位" description="先创建岗位，再执行分析。" inset />
              ) : (
                jobList.items.map((job) => {
                  const active = workspace.jobId === job.id;
                  const comparing = compareJobIds.includes(job.id);

                  return (
                    <div key={job.id} className={cn("rounded-xl border border-border px-3 py-3", active ? "bg-background" : "bg-muted/30")}>
                      <div className="flex items-start justify-between gap-3">
                        <button type="button" onClick={() => actions.setJobId(job.id)} className="min-w-0 flex-1 text-left">
                          <p className="font-medium text-foreground">{job.title}</p>
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-fg-muted">{job.description}</p>
                        </button>
                        {active ? (
                          <div className="rounded-full bg-primary p-1 text-primary-foreground">
                            <Check className="h-3.5 w-3.5" />
                          </div>
                        ) : null}
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-2">
                          {job.requiredSkills.slice(0, 3).map((skill) => (
                            <Badge key={`${job.id}-${skill}`} variant="secondary" className="border-transparent">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => toggleCompareJob(job.id)}>
                          {comparing ? "取消对比" : "加入对比"}
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-muted/20">
            <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
              <div>
                <h2 className="text-base font-semibold text-foreground">候选人</h2>
                <p className="mt-1 text-sm text-fg-muted">最多选择 3 位候选人。</p>
              </div>
              <Badge variant="outline">{workspace.candidateIds.length} / 3</Badge>
            </div>
            <div className="space-y-2 px-4 py-4">
              {candidateRemote.loading ? (
                <SelectionSkeleton />
              ) : candidateRemote.error ? (
                <EmptyState title="候选人加载失败" description={candidateRemote.error} inset />
              ) : candidateRemote.items.length === 0 ? (
                <EmptyState title="暂无候选人" description="先上传并解析简历。" inset />
              ) : (
                candidateRemote.items.map((candidate) => {
                  const active = workspace.candidateIds.includes(candidate.id);
                  const disabled = !active && workspace.candidateIds.length >= 3;

                  return (
                    <button
                      key={candidate.id}
                      type="button"
                      onClick={() => actions.toggleCandidate(candidate.id)}
                      disabled={disabled}
                      className={cn(
                        "flex w-full items-start justify-between gap-3 rounded-xl border border-border px-3 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                        active ? "bg-background" : "bg-muted/30 hover:bg-muted/50"
                      )}
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-foreground">{candidate.name ?? "未识别姓名"}</p>
                          {candidate.city ? <span className="text-sm text-fg-muted">{candidate.city}</span> : null}
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm text-fg-muted">{candidate.skills.join(", ") || "暂无技能标签"}</p>
                      </div>
                      {active ? (
                        <div className="rounded-full bg-primary p-1 text-primary-foreground">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                      ) : null}
                    </button>
                  );
                })
              )}
            </div>
          </section>
        </section>
      </PageShell>

      <Drawer open={resultDrawerOpen} onOpenChange={setResultDrawerOpen} direction="right">
        <DrawerContent className="max-w-[760px]">
          <DrawerHeader className="px-4 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <DrawerTitle>分析结果</DrawerTitle>
                <DrawerDescription>
                  {analysisJobIds.length > 1 ? "多 JD 对比结果" : "单岗位分析结果"}
                  {selectedCandidates.length ? ` · ${selectedCandidates.map((candidate) => candidate.name ?? candidate.id).join("、")}` : ""}
                </DrawerDescription>
              </div>
              <div className="rounded-lg bg-muted/40 p-2 text-fg-muted">
                <SearchCheck className="h-4 w-4" />
              </div>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {results.error ? (
              <EmptyState title="分析失败" description={results.error} inset />
            ) : results.loading ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-border bg-muted/20 px-4 py-4">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="mt-3 h-4 w-full" />
                  <Skeleton className="mt-2 h-4 w-4/5" />
                  <div className="mt-4 space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
                <p className="text-sm text-fg-muted">正在生成匹配结果，请稍候。</p>
              </div>
            ) : results.items.length === 0 ? (
              <EmptyState title="暂无评分结果" description="点击“开始分析”后，这里会展示结果。" inset />
            ) : (
              <div className="space-y-6">
                {resultsByJob.map((group) => (
                  <section key={group.job?.id ?? "unknown"} className="space-y-4 border-b border-border pb-6 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-muted/40 p-2 text-fg-muted">
                          <BriefcaseBusiness className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-foreground">{group.job?.title ?? "未知岗位"}</h3>
                          <p className="mt-1 text-sm text-fg-muted">{group.job?.description ?? "暂无岗位描述"}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{group.results.length} 条结果</Badge>
                    </div>

                    {group.results.length ? (
                      <div className="space-y-5">
                        {group.results.map((result) => {
                          const candidate = candidateRemote.items.find((item) => item.id === result.candidateId);

                          return (
                            <article
                              key={result.matchingId}
                              className="space-y-4 rounded-xl border border-border bg-muted/15 px-4 py-4"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className="text-sm text-fg-muted">候选人</p>
                                  <p className="mt-1 text-lg font-semibold text-foreground">
                                    {candidate?.name ?? result.candidateId}
                                  </p>
                                  <p className="mt-2 text-sm leading-6 text-fg-muted">{result.summary}</p>
                                </div>
                                <ScoreRing score={result.overallScore} />
                              </div>

                              <div className="grid gap-4 lg:grid-cols-3">
                                <MetricBar label="技能匹配" value={result.dimensionScores.skillMatch} />
                                <MetricBar label="经验相关性" value={result.dimensionScores.experienceRelevance} />
                                <MetricBar label="教育契合度" value={result.dimensionScores.educationFit} />
                              </div>

                              <div className="grid gap-5 lg:grid-cols-3">
                                <ResultColumn title="匹配亮点" items={result.strengths} />
                                <ResultColumn title="主要风险" items={result.risks} />
                                <ResultColumn title="证据摘要" items={result.evidence} />
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    ) : (
                      <EmptyState title="该岗位暂无结果" description="当前还没有返回该岗位的匹配分析。" inset />
                    )}
                  </section>
                ))}
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
