"use client";

import { useEffect, useMemo, useState } from "react";
import type { CandidateDetail, CandidateStatus } from "@ai-resume/shared-types";
import { EmptyState } from "@/components/common/empty-state";
import { PageShell } from "@/components/common/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useInstance } from "@/instance";
import { getCandidateStatusLabel } from "@/lib/utils/display";

const STATUS_OPTIONS: CandidateStatus[] = [
  "pending",
  "screening_passed",
  "interviewing",
  "hired",
  "rejected"
];

function arrayToMultiline(items: string[]) {
  return items.join("\n");
}

function multilineToArray(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function MatchingScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="text-fg-muted">{label}</span>
        <span className="font-medium text-foreground">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-foreground" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function CandidateDetailFeature({ candidateId }: { candidateId: string }) {
  const instance = useInstance();
  const [detail, setDetail] = useState<CandidateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [draft, setDraft] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    skills: "",
    education: "",
    work: "",
    projects: ""
  });

  async function loadDetail() {
    setLoading(true);
    setError(null);

    try {
      const nextDetail = await instance.candidate.fetchDetail(candidateId);
      setDetail(nextDetail);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "候选人详情加载失败。");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDetail();
  }, [candidateId]);

  useEffect(() => {
    if (!detail || !editorOpen) {
      return;
    }

    setDraft({
      name: detail.basic.name ?? "",
      phone: detail.basic.phone ?? "",
      email: detail.basic.email ?? "",
      city: detail.basic.city ?? "",
      skills: detail.skills.map((skill) => `${skill.name},${skill.type}`).join("\n"),
      education: detail.education
        .map((item) => [item.school, item.major ?? "", item.degree ?? "", item.graduationDate ?? ""].join(" | "))
        .join("\n"),
      work: detail.workExperiences
        .map((item) => [item.companyName, item.title ?? "", item.startDate ?? "", item.endDate ?? "", item.summary ?? ""].join(" | "))
        .join("\n"),
      projects: detail.projects
        .map((item) => [item.projectName, item.techStack.join(","), item.roleSummary ?? "", arrayToMultiline(item.highlights).replace(/\n/g, " / ")].join(" | "))
        .join("\n")
    });
  }, [detail, editorOpen]);

  const parsedPayload = useMemo(() => ({
    basic: {
      name: draft.name || null,
      phone: draft.phone || null,
      email: draft.email || null,
      city: draft.city || null
    },
    skills: multilineToArray(draft.skills)
      .map((row) => {
        const [name, type] = row.split(",").map((item) => item.trim());
        return name ? { name, type: type || "general" } : null;
      })
      .filter((item): item is { name: string; type: string } => Boolean(item)),
    education: multilineToArray(draft.education)
      .map((row) => {
        const [school, major, degree, graduationDate] = row.split("|").map((item) => item.trim());
        return school ? { school, major: major || null, degree: degree || null, graduationDate: graduationDate || null } : null;
      })
      .filter((item): item is { school: string; major: string | null; degree: string | null; graduationDate: string | null } => Boolean(item)),
    workExperiences: multilineToArray(draft.work)
      .map((row) => {
        const [companyName, title, startDate, endDate, summary] = row.split("|").map((item) => item.trim());
        return companyName ? { companyName, title: title || null, startDate: startDate || null, endDate: endDate || null, summary: summary || null } : null;
      })
      .filter((item): item is { companyName: string; title: string | null; startDate: string | null; endDate: string | null; summary: string | null } => Boolean(item)),
    projects: multilineToArray(draft.projects)
      .map((row) => {
        const [projectName, techStack, roleSummary, highlights] = row.split("|").map((item) => item.trim());
        return projectName
          ? {
              projectName,
              techStack: techStack ? techStack.split(",").map((item) => item.trim()).filter(Boolean) : [],
              roleSummary: roleSummary || null,
              highlights: highlights ? highlights.split("/").map((item) => item.trim()).filter(Boolean) : []
            }
          : null;
      })
      .filter((item): item is { projectName: string; techStack: string[]; roleSummary: string | null; highlights: string[] } => Boolean(item))
  }), [draft]);

  async function handleStatusChange(status: CandidateStatus) {
    if (!detail || saving || detail.status === status) {
      return;
    }

    setSaving(true);
    try {
      await instance.candidate.updateStatus(candidateId, status);
      await loadDetail();
    } finally {
      setSaving(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await instance.candidate.updateProfile(candidateId, parsedPayload);
      setEditorOpen(false);
      await loadDetail();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "候选人信息更新失败。");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageShell
        title="候选人详情"
        description={`查看候选人的完整解析信息、状态流转和简历预览。编号：${candidateId}`}
        actions={
          <Button variant="outline" onClick={() => setEditorOpen(true)} disabled={!detail}>
            手动修正
          </Button>
        }
        aside={
          detail ? (
            <section className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => void handleStatusChange(status)}
                  className={detail.status === status
                    ? "rounded-full bg-foreground px-3 py-1 text-xs text-background"
                    : "rounded-full bg-muted px-3 py-1 text-xs text-fg-muted transition-colors hover:text-foreground"}
                >
                  {getCandidateStatusLabel(status)}
                </button>
              ))}
            </section>
          ) : null
        }
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
          <section className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-6">
              <div className="space-y-6 divide-y divide-border">
                <section className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">{detail.basic.name ?? "未识别姓名"}</h2>
                      <p className="mt-1 text-sm text-fg-muted">{detail.basic.email ?? "未识别邮箱"}</p>
                    </div>
                    <Badge variant="secondary">{getCandidateStatusLabel(detail.status)}</Badge>
                  </div>
                  <div className="grid gap-3 text-sm">
                    <div className="flex justify-between gap-4"><span className="text-fg-muted">电话</span><span>{detail.basic.phone ?? "--"}</span></div>
                    <div className="flex justify-between gap-4"><span className="text-fg-muted">城市</span><span>{detail.basic.city ?? "--"}</span></div>
                  </div>
                </section>

                <section className="space-y-4 pt-6">
                  <h3 className="text-base font-semibold text-foreground">技能标签</h3>
                  <div className="flex flex-wrap gap-2">
                    {detail.skills.length ? detail.skills.map((skill) => (
                      <Badge key={`${skill.name}-${skill.type}`} variant="secondary" className="border-transparent">
                        {skill.name}
                      </Badge>
                    )) : <p className="text-sm text-fg-muted">暂无技能标签</p>}
                  </div>
                </section>

                <section className="space-y-5 pt-6">
                  <h3 className="text-base font-semibold text-foreground">教育与经历</h3>
                  <div>
                    <p className="mb-3 text-sm font-medium">教育经历</p>
                    {detail.education.length ? (
                      <div className="space-y-3">
                        {detail.education.map((education) => (
                          <div key={education.id} className="text-sm">
                            <p className="font-medium">{education.school}</p>
                            <p className="mt-1 text-fg-muted">{education.major ?? "专业待补充"} / {education.degree ?? "学历待补充"} / {education.graduationDate ?? "时间待补充"}</p>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-sm text-fg-muted">暂无教育经历</p>}
                  </div>
                  <div>
                    <p className="mb-3 text-sm font-medium">工作经历</p>
                    {detail.workExperiences.length ? (
                      <div className="space-y-3">
                        {detail.workExperiences.map((work) => (
                          <div key={work.id} className="text-sm">
                            <p className="font-medium">{work.companyName}</p>
                            <p className="mt-1 text-fg-muted">{work.title ?? "岗位待补充"} / {[work.startDate, work.endDate].filter(Boolean).join(" - ") || "时间待补充"}</p>
                            <p className="mt-2 text-fg-muted">{work.summary ?? "暂无工作内容摘要"}</p>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-sm text-fg-muted">暂无工作经历</p>}
                  </div>
                </section>
              </div>
            </div>

            <div className="space-y-6">
              <section className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-foreground">评分详情</h3>
                  <p className="text-sm text-fg-muted">展示该候选人最近生成的岗位匹配结果。</p>
                </div>
                {detail.matchings.length ? (
                  <div className="space-y-4">
                    {detail.matchings.map((matching) => (
                      <article key={matching.matchingId} className="space-y-4 rounded-xl bg-muted/20">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm text-fg-muted">{matching.jobTitle ?? "未命名岗位"}</p>
                            <p className="mt-1 text-sm text-fg-muted">
                              {new Date(matching.createdAt).toLocaleString("zh-CN")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-fg-muted">综合分</p>
                            <p className="text-2xl font-semibold text-foreground">{matching.overallScore}</p>
                          </div>
                        </div>
                        <p className="text-sm leading-6 text-fg-muted">{matching.summary}</p>
                        <div className="grid gap-4">
                          <MatchingScoreBar label="技能匹配度" value={matching.dimensionScores.skillMatch} />
                          <MatchingScoreBar label="经验相关性" value={matching.dimensionScores.experienceRelevance} />
                          <MatchingScoreBar label="教育背景契合度" value={matching.dimensionScores.educationFit} />
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="暂无评分记录" description="完成岗位匹配分析后，这里会显示最近评分结果。" inset />
                )}
              </section>

              <section className="space-y-4">
                <h3 className="text-base font-semibold text-foreground">项目经历</h3>
                {detail.projects.length ? (
                  <div className="space-y-3">
                    {detail.projects.map((project) => (
                      <div key={project.id} className="text-sm">
                        <p className="font-medium">{project.projectName}</p>
                        {project.techStack.length ? <p className="mt-1 text-fg-muted">{project.techStack.join(", ")}</p> : null}
                        <p className="mt-2 text-fg-muted">{project.roleSummary ?? "暂无职责摘要"}</p>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-fg-muted">暂无项目经历</p>}
              </section>

              <section className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-foreground">PDF 预览</h3>
                  <p className="mt-1 text-sm text-fg-muted">如已生成可用链接，会在这里直接展示简历内容。</p>
                </div>
                {detail.pdfPreviewUrl ? (
                  <iframe title="candidate-pdf-preview" src={detail.pdfPreviewUrl} className="h-[520px] w-full rounded-xl bg-background" />
                ) : (
                  <EmptyState title="暂无 PDF 预览" description="当前还没有可用的简历预览链接。" inset />
                )}
              </section>
            </div>
          </section>
        )}
      </PageShell>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-[860px]">
          <DialogHeader>
            <DialogTitle>手动修正候选人信息</DialogTitle>
            <DialogDescription>一行一条记录。教育 / 工作 / 项目使用 `|` 分隔字段。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <section className="space-y-2">
              <label className="text-sm font-medium">姓名</label>
              <Input value={draft.name} onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))} />
            </section>
            <section className="space-y-2">
              <label className="text-sm font-medium">电话</label>
              <Input value={draft.phone} onChange={(event) => setDraft((prev) => ({ ...prev, phone: event.target.value }))} />
            </section>
            <section className="space-y-2">
              <label className="text-sm font-medium">邮箱</label>
              <Input value={draft.email} onChange={(event) => setDraft((prev) => ({ ...prev, email: event.target.value }))} />
            </section>
            <section className="space-y-2">
              <label className="text-sm font-medium">城市</label>
              <Input value={draft.city} onChange={(event) => setDraft((prev) => ({ ...prev, city: event.target.value }))} />
            </section>
          </div>
          <section className="space-y-2">
            <label className="text-sm font-medium">技能（每行 `技能,类型`）</label>
            <Textarea value={draft.skills} onChange={(event) => setDraft((prev) => ({ ...prev, skills: event.target.value }))} className="min-h-[120px]" />
          </section>
          <section className="space-y-2">
            <label className="text-sm font-medium">教育（每行 `学校 | 专业 | 学历 | 毕业时间`）</label>
            <Textarea value={draft.education} onChange={(event) => setDraft((prev) => ({ ...prev, education: event.target.value }))} className="min-h-[120px]" />
          </section>
          <section className="space-y-2">
            <label className="text-sm font-medium">工作（每行 `公司 | 职位 | 开始 | 结束 | 摘要`）</label>
            <Textarea value={draft.work} onChange={(event) => setDraft((prev) => ({ ...prev, work: event.target.value }))} className="min-h-[140px]" />
          </section>
          <section className="space-y-2">
            <label className="text-sm font-medium">项目（每行 `项目 | 技术栈逗号分隔 | 职责摘要 | 亮点/亮点`）</label>
            <Textarea value={draft.projects} onChange={(event) => setDraft((prev) => ({ ...prev, projects: event.target.value }))} className="min-h-[140px]" />
          </section>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditorOpen(false)}>取消</Button>
            <Button onClick={() => void handleSave()} disabled={saving}>{saving ? "保存中..." : "保存修正"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
