"use client";

import { useEffect, useState } from "react";
import type { CandidateDetail } from "@ai-resume/shared-types";
import { PageShell } from "@/components/common/page-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { useInstance } from "@/instance";

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
        setError(err instanceof Error ? err.message : "Failed to load candidate.");
      })
      .finally(() => setLoading(false));
  }, [candidateId, instance]);

  return (
    <PageShell
      title={`候选人详情 · ${candidateId}`}
      description="详情页展示结构化信息、技能摘要和 PDF 预览入口。当前数据获取统一经过 candidate instance。"
    >
      {loading ? (
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      ) : error ? (
        <EmptyState title="详情加载失败" description={error} />
      ) : !detail ? (
        <EmptyState title="没有详情数据" description="当前接口未返回候选人详情。" />
      ) : (
        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle>{detail.basic.name ?? "未识别姓名"}</CardTitle>
                    <CardDescription>{detail.basic.email ?? "未识别邮箱"}</CardDescription>
                  </div>
                  <Badge variant="outline">{detail.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm">
                <div className="flex justify-between gap-4"><span className="text-fg-muted">电话</span><span>{detail.basic.phone ?? "--"}</span></div>
                <div className="flex justify-between gap-4"><span className="text-fg-muted">城市</span><span>{detail.basic.city ?? "--"}</span></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>技能标签</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {detail.skills.length ? detail.skills.map((skill) => <Badge key={`${skill.name}-${skill.type}`}>{skill.name}</Badge>) : <p className="text-sm text-fg-muted">暂无技能标签</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>教育与经历</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-medium">教育经历</p>
                  {detail.education.length ? detail.education.map((education) => (
                    <div key={education.id} className="rounded-md border border-border p-3 text-sm">
                      <p className="font-medium">{education.school}</p>
                      <p className="text-fg-muted">{education.major ?? "专业待补充"} / {education.degree ?? "学历待补充"}</p>
                    </div>
                  )) : <p className="text-sm text-fg-muted">暂无教育经历</p>}
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium">工作经历</p>
                  {detail.workExperiences.length ? detail.workExperiences.map((work) => (
                    <div key={work.id} className="rounded-md border border-border p-3 text-sm">
                      <p className="font-medium">{work.companyName}</p>
                      <p className="text-fg-muted">{work.title ?? "岗位待补充"}</p>
                      <p className="mt-2 text-fg-muted">{work.summary ?? "暂无工作内容摘要"}</p>
                    </div>
                  )) : <p className="text-sm text-fg-muted">暂无工作经历</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>项目经历</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {detail.projects.length ? detail.projects.map((project) => (
                  <div key={project.id} className="rounded-md border border-border p-3 text-sm">
                    <p className="font-medium">{project.projectName}</p>
                    <p className="mt-2 text-fg-muted">{project.roleSummary ?? "暂无职责摘要"}</p>
                  </div>
                )) : <p className="text-sm text-fg-muted">暂无项目经历</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>PDF 预览</CardTitle>
                <CardDescription>当前详情接口返回签名地址时，这里将直接嵌入预览。</CardDescription>
              </CardHeader>
              <CardContent>
                {detail.pdfPreviewUrl ? (
                  <iframe
                    title="candidate-pdf-preview"
                    src={detail.pdfPreviewUrl}
                    className="h-[520px] w-full rounded-md border border-border"
                  />
                ) : (
                  <EmptyState title="暂无 PDF 预览" description="接口还没有返回可用的 pdfPreviewUrl。" />
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </PageShell>
  );
}
