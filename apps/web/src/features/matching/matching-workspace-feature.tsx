"use client";

import { useEffect } from "react";
import { PageShell } from "@/components/common/page-shell";
import { Button } from "@/components/ui/button";
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
      description="选择岗位与候选人，查看匹配得分、亮点、风险和证据摘要。"
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
          <section className="rounded-xl bg-muted/20">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-lg font-semibold text-foreground">选择岗位</h2>
              <p className="mt-1 text-sm text-fg-muted">先确定本次分析对应的岗位。</p>
            </div>
            <div className="space-y-3 px-5 py-5">
              {jobList.items.length === 0 ? (
                <EmptyState title="暂无 JD" description="先到 JD 页面创建岗位，再回到这里执行评分。" />
              ) : (
                jobList.items.map((job) => (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => actions.setJobId(job.id)}
                    className={`w-full rounded-lg px-4 py-4 text-left transition ${
                      workspace.jobId === job.id ? "bg-background" : "hover:bg-muted/30"
                    }`}
                  >
                    <p className="font-medium">{job.title}</p>
                    <p className="mt-2 line-clamp-2 text-sm text-fg-muted">{job.description}</p>
                  </button>
                ))
              )}
            </div>
          </section>

          <section className="rounded-xl bg-muted/20">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-lg font-semibold text-foreground">选择候选人</h2>
              <p className="mt-1 text-sm text-fg-muted">最多选择 3 位候选人进行对比。</p>
            </div>
            <div className="space-y-3 px-5 py-5">
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
                      className={`flex w-full items-center justify-between gap-3 rounded-lg px-4 py-4 text-left transition ${
                        active ? "bg-background" : "hover:bg-muted/30"
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
            </div>
          </section>
        </div>

        <section className="rounded-xl bg-muted/20">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-lg font-semibold text-foreground">分析结果</h2>
            <p className="mt-1 text-sm text-fg-muted">展示匹配得分及各维度结论。</p>
          </div>
          <div className="space-y-4 px-5 py-5">
            {results.error ? (
              <EmptyState title="评分失败" description={results.error} />
            ) : results.loading ? (
              <p className="text-sm text-fg-muted">正在生成匹配结果...</p>
            ) : results.items.length === 0 ? (
              <EmptyState title="暂无评分结果" description="选择岗位和候选人后，点击“开始分析”。" />
            ) : (
              results.items.map((result) => (
                <article key={result.matchingId} className="space-y-5 rounded-xl bg-background px-5 py-5">
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
                  <div className="grid gap-4 lg:grid-cols-3">
                    <section className="space-y-3 rounded-lg bg-muted/30 px-4 py-4">
                      <h3 className="text-sm font-medium text-foreground">匹配亮点</h3>
                      <div className="space-y-2 text-sm text-fg-muted">
                        {result.strengths.length ? (
                          result.strengths.map((item) => (
                            <p key={item}>{item}</p>
                          ))
                        ) : (
                          <p>暂无亮点摘要</p>
                        )}
                      </div>
                    </section>
                    <section className="space-y-3 rounded-lg bg-muted/30 px-4 py-4">
                      <h3 className="text-sm font-medium text-foreground">主要风险</h3>
                      <div className="space-y-2 text-sm text-fg-muted">
                        {result.risks.length ? (
                          result.risks.map((item) => (
                            <p key={item}>{item}</p>
                          ))
                        ) : (
                          <p>暂无风险摘要</p>
                        )}
                      </div>
                    </section>
                    <section className="space-y-3 rounded-lg bg-muted/30 px-4 py-4">
                      <h3 className="text-sm font-medium text-foreground">证据摘要</h3>
                      <div className="space-y-2 text-sm text-fg-muted">
                        {result.evidence.length ? (
                          result.evidence.map((item) => (
                            <p key={item}>{item}</p>
                          ))
                        ) : (
                          <p>暂无证据摘要</p>
                        )}
                      </div>
                    </section>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </section>
    </PageShell>
  );
}
