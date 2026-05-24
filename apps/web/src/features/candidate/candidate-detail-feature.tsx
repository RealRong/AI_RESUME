"use client";

import { useEffect, useState } from "react";
import type { CandidateDetail } from "@ai-resume/shared-types";
import { PageShell } from "@/components/common/page-shell";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { useInstance } from "@/instance";
import { getCandidateStatusLabel } from "@/lib/utils/display";

export function CandidateDetailFeature({ candidateId }: { candidateId: string }) {
  const instance = useInstance();
  const [detail, setDetail] = useState<CandidateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    void instance.candidate
      .fetchDetail(candidateId)
      .then(setDetail)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "候选人详情加载失败。");
      })
      .finally(() => setLoading(false));
  }, [candidateId, instance]);

  return (
    <PageShell
      title="候选人详情"
      description={`查看候选人的基础信息、技能标签、经历和简历预览。编号：${candidateId}`}
    >
      {loading ? (
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      ) : error ? (
        <EmptyState title="详情加载失败" description={error} />
      ) : !detail ? (
        <EmptyState title="暂无详情数据" description="当前候选人还没有可展示的详细信息。" />
      ) : (
        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <div className="rounded-xl bg-muted/30 p-6">
              <div className="space-y-6 divide-y divide-border">
                <section className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">
                        {detail.basic.name ?? "未识别姓名"}
                      </h2>
                      <p className="mt-1 text-sm text-fg-muted">
                        {detail.basic.email ?? "未识别邮箱"}
                      </p>
                    </div>
                    <Badge variant="secondary">{getCandidateStatusLabel(detail.status)}</Badge>
                  </div>
                  <div className="grid gap-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-fg-muted">电话</span>
                      <span>{detail.basic.phone ?? "--"}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-fg-muted">城市</span>
                      <span>{detail.basic.city ?? "--"}</span>
                    </div>
                  </div>
                </section>

                <section className="space-y-4 pt-6">
                  <h3 className="text-base font-semibold text-foreground">技能标签</h3>
                  <div className="flex flex-wrap gap-2">
                    {detail.skills.length ? (
                      detail.skills.map((skill) => (
                        <Badge
                          key={`${skill.name}-${skill.type}`}
                          variant="secondary"
                          className="border-transparent"
                        >
                          {skill.name}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-fg-muted">暂无技能标签</p>
                    )}
                  </div>
                </section>

                <section className="space-y-5 pt-6">
                  <h3 className="text-base font-semibold text-foreground">教育与经历</h3>

                  <div>
                    <p className="mb-3 text-sm font-medium">教育经历</p>
                    {detail.education.length ? (
                      <div className="space-y-3">
                        {detail.education.map((education) => (
                          <div key={education.id} className="rounded-lg bg-background px-4 py-3 text-sm">
                            <p className="font-medium">{education.school}</p>
                            <p className="text-fg-muted">
                              {education.major ?? "专业待补充"} / {education.degree ?? "学历待补充"}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-fg-muted">暂无教育经历</p>
                    )}
                  </div>

                  <div>
                    <p className="mb-3 text-sm font-medium">工作经历</p>
                    {detail.workExperiences.length ? (
                      <div className="space-y-3">
                        {detail.workExperiences.map((work) => (
                          <div key={work.id} className="rounded-lg bg-background px-4 py-3 text-sm">
                            <p className="font-medium">{work.companyName}</p>
                            <p className="text-fg-muted">{work.title ?? "岗位待补充"}</p>
                            <p className="mt-2 text-fg-muted">{work.summary ?? "暂无工作内容摘要"}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-fg-muted">暂无工作经历</p>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-xl bg-muted/30 p-6">
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-foreground">项目经历</h3>
                {detail.projects.length ? (
                  <div className="space-y-3">
                    {detail.projects.map((project) => (
                      <div key={project.id} className="rounded-lg bg-background px-4 py-3 text-sm">
                        <p className="font-medium">{project.projectName}</p>
                        <p className="mt-2 text-fg-muted">{project.roleSummary ?? "暂无职责摘要"}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-fg-muted">暂无项目经历</p>
                )}
              </div>
            </section>

            <section className="rounded-xl bg-muted/30 p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-foreground">PDF 预览</h3>
                  <p className="mt-1 text-sm text-fg-muted">
                    如已生成可用链接，会在这里直接展示简历内容。
                  </p>
                </div>
                {detail.pdfPreviewUrl ? (
                  <iframe
                    title="candidate-pdf-preview"
                    src={detail.pdfPreviewUrl}
                    className="h-[520px] w-full rounded-xl bg-background"
                  />
                ) : (
                  <EmptyState
                    title="暂无 PDF 预览"
                    description="当前还没有可用的简历预览链接。"
                    inset
                  />
                )}
              </div>
            </section>
          </div>
        </section>
      )}
    </PageShell>
  );
}
