"use client";

import { useEffect } from "react";
import { PageShell } from "@/components/common/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/empty-state";
import { Progress } from "@/components/ui/progress";
import { useInstance } from "@/instance";
import { useJobState } from "@/domains/job/hooks";
import { useMatchingWorkspaceActions, useMatchingWorkspaceState } from "@/domains/matching/hooks";
import { useCandidateListState } from "@/domains/candidate/hooks";

export function MatchingWorkspaceFeature() {
  const instance = useInstance();
  const { list: jobList } = useJobState();
  const { remote: candidateRemote } = useCandidateListState();
  const { workspace, results } = useMatchingWorkspaceState();
  const actions = useMatchingWorkspaceActions();

  useEffect(() => {
    void instance.job.fetchList();
    void instance.candidate.fetchList();
  }, [instance]);

  async function runMatching() {
    if (!workspace.jobId || workspace.candidateIds.length === 0) return;
    await instance.matching.createMatching({
      jobId: workspace.jobId,
      candidateIds: workspace.candidateIds
    });
  }

  return (
    <PageShell
      title="岗位匹配分析"
      description="选择岗位与候选人，查看匹配得分和评估摘要。"
      actions={
        <Button
          onClick={() => void runMatching()}
          disabled={!workspace.jobId || workspace.candidateIds.length === 0 || results.loading}
        >
          开始分析
        </Button>
      }
    >
      <section className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>选择 JD</CardTitle>
              <CardDescription>先确定本次分析对应的岗位。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {jobList.items.length === 0 ? (
                <EmptyState title="暂无 JD" description="先到 JD 页面创建岗位，再回到这里执行评分。" />
              ) : (
                jobList.items.map((job) => (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => actions.setJobId(job.id)}
                    className={`w-full rounded-lg border p-4 text-left transition ${
                      workspace.jobId === job.id ? "border-primary bg-muted/60" : "border-border hover:bg-muted/40"
                    }`}
                  >
                    <p className="font-medium">{job.title}</p>
                    <p className="mt-2 line-clamp-2 text-sm text-fg-muted">{job.description}</p>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>选择候选人</CardTitle>
              <CardDescription>最多选择 3 位候选人进行对比。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {candidateRemote.items.length === 0 ? (
                <EmptyState title="暂无候选人" description="先上传并完成简历解析，候选人才能参与匹配。" />
              ) : (
                candidateRemote.items.map((candidate) => {
                  const active = workspace.candidateIds.includes(candidate.id);
                  return (
                    <button
                      key={candidate.id}
                      type="button"
                      onClick={() => actions.toggleCandidate(candidate.id)}
                      className={`flex w-full items-center justify-between gap-3 rounded-lg border p-4 text-left transition ${
                        active ? "border-primary bg-muted/60" : "border-border hover:bg-muted/40"
                      }`}
                    >
                      <div>
                        <p className="font-medium">{candidate.name ?? "未识别姓名"}</p>
                        <p className="text-sm text-fg-muted">{candidate.skills.join(", ") || "暂无技能"}</p>
                      </div>
                      {active ? <Badge>已选</Badge> : null}
                    </button>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>评分结果</CardTitle>
            <CardDescription>展示匹配得分及各维度结果。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.error ? (
              <EmptyState title="评分失败" description={results.error} />
            ) : results.loading ? (
              <p className="text-sm text-fg-muted">正在生成匹配结果...</p>
            ) : results.items.length === 0 ? (
              <EmptyState title="暂无评分结果" description="选择岗位和候选人后，点击“开始分析”。" />
            ) : (
              results.items.map((result) => (
                <div key={result.matchingId} className="space-y-4 rounded-lg border border-border p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-fg-muted">候选人编号</p>
                      <p className="font-medium">{result.candidateId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-fg-muted">综合分</p>
                      <p className="text-3xl font-semibold">{result.overallScore}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span>技能匹配</span>
                        <span>{result.dimensionScores.skillMatch}</span>
                      </div>
                      <Progress value={result.dimensionScores.skillMatch} />
                    </div>
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span>经验相关性</span>
                        <span>{result.dimensionScores.experienceRelevance}</span>
                      </div>
                      <Progress value={result.dimensionScores.experienceRelevance} />
                    </div>
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span>教育契合度</span>
                        <span>{result.dimensionScores.educationFit}</span>
                      </div>
                      <Progress value={result.dimensionScores.educationFit} />
                    </div>
                  </div>
                  <div className="rounded-md bg-muted/50 p-4 text-sm leading-6 text-fg-muted">
                    {result.summary}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </PageShell>
  );
}
