"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, PencilLine, BriefcaseBusiness } from "lucide-react";
import type { Job } from "@ai-resume/shared-types";
import { EmptyState } from "@/components/common/empty-state";
import { PageShell } from "@/components/common/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useJobActions, useJobState } from "@/domains/job/hooks";
import { useInstance } from "@/instance";

function parseTags(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function JobListSkeleton() {
  return (
    <section className="rounded-xl bg-muted/20">
      <div className="border-b border-border pb-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-52" />
        </div>
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-3">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-full max-w-3xl" />
                <Skeleton className="h-4 w-4/5 max-w-2xl" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-14 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function JobListFeature() {
  const instance = useInstance();
  const { list, editor } = useJobState();
  const actions = useJobActions();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void instance.job.fetchList();
  }, [instance]);

  const filteredJobs = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    if (!normalizedKeyword) {
      return list.items;
    }

    return list.items.filter((job) => {
      const haystack = [
        job.title,
        job.description,
        ...job.requiredSkills,
        ...job.bonusSkills
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedKeyword);
    });
  }, [keyword, list.items]);

  function openCreateDrawer() {
    actions.resetDraft();
    setDrawerOpen(true);
  }

  function openEditDrawer(job: Job) {
    actions.setActiveJob(job);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
  }

  async function handleSave() {
    if (!editor.draft.title || !editor.draft.description || saving) {
      return;
    }

    setSaving(true);

    try {
      if (editor.activeJobId) {
        await instance.job.updateJob(editor.activeJobId, editor.draft);
      } else {
        await instance.job.createJob(editor.draft);
      }

      actions.resetDraft();
      setDrawerOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageShell
        title="岗位管理"
        description="集中维护岗位说明、核心要求和加分项，编辑统一在右侧抽屉完成。"
        actions={
          <Button onClick={openCreateDrawer}>
            <Plus className="h-4 w-4" />
            新建岗位
          </Button>
        }
        aside={
          <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="w-full max-w-xl">
              <Input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="搜索岗位名称、描述或技能关键词"
                className="h-9 rounded-lg bg-muted/40 focus-visible:ring-1"
              />
            </div>
            <div className="flex items-center gap-3 text-sm text-fg-muted">
              <span>共 {filteredJobs.length} 个岗位</span>
            </div>
          </section>
        }
      >
        {list.loading ? (
          <JobListSkeleton />
        ) : list.error ? (
          <EmptyState title="岗位加载失败" description={list.error} />
        ) : filteredJobs.length === 0 ? (
          list.items.length === 0 ? (
            <section className="rounded-xl bg-muted/20 px-6 py-12">
              <EmptyState
                title="暂无岗位数据"
                description="先创建第一条岗位信息，后续即可在这里集中维护和编辑。"
                inset
              />
              <div className="mt-6 flex justify-center">
                <Button onClick={openCreateDrawer}>
                  <Plus className="h-4 w-4" />
                  新建岗位
                </Button>
              </div>
            </section>
          ) : (
            <section className="rounded-xl bg-muted/20 px-6 py-12">
              <EmptyState
                title="没有匹配结果"
                description="当前搜索条件下没有找到岗位，尝试更换关键词。"
                inset
              />
            </section>
          )
        ) : (
          <section className="rounded-xl bg-muted/20">
            <div className="border-b border-border pb-4">
              <h2 className="text-lg font-semibold text-foreground">岗位列表</h2>
              <p className="mt-1 text-sm text-fg-muted">在列表中快速浏览岗位重点，点击右侧按钮进入抽屉编辑。</p>
            </div>
            <div className="divide-y divide-border">
              {filteredJobs.map((job) => (
                <article key={job.id} className="py-5 transition-colors hover:bg-muted/20">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>
                        <span className="text-sm text-fg-muted">
                          更新于 {formatDate(job.updatedAt)}
                        </span>
                      </div>
                      <p className="mt-3 max-w-4xl text-sm leading-6 text-fg-muted">
                        {job.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {job.requiredSkills.map((skill) => (
                          <Badge key={`${job.id}-required-${skill}`} variant="secondary" className="border-transparent">
                            {skill}
                          </Badge>
                        ))}
                        {job.bonusSkills.map((skill) => (
                          <Badge key={`${job.id}-bonus-${skill}`} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="hidden text-right text-sm text-fg-muted md:block">
                        <p>{job.requiredSkills.length} 项必备</p>
                        <p className="mt-1">{job.bonusSkills.length} 项加分</p>
                      </div>
                      <Button variant="outline" onClick={() => openEditDrawer(job)}>
                        <PencilLine className="h-4 w-4" />
                        编辑
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </PageShell>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} direction="right">
        <DrawerContent>
          <DrawerHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <DrawerTitle>{editor.activeJobId ? "编辑岗位" : "新建岗位"}</DrawerTitle>
                <DrawerDescription>
                  维护岗位标题、岗位说明、必备技能和加分项。保存后会自动刷新列表。
                </DrawerDescription>
              </div>
              <div className="rounded-lg bg-muted/40 p-2 text-fg-muted">
                <BriefcaseBusiness className="h-5 w-5" />
              </div>
            </div>
          </DrawerHeader>

          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
            <section className="space-y-2">
              <label className="text-sm font-medium text-foreground">岗位标题</label>
              <Input
                value={editor.draft.title}
                onChange={(event) => actions.updateDraft({ title: event.target.value })}
                placeholder="例如：AI Native 全栈工程师"
                className="bg-muted/30"
              />
            </section>

            <section className="space-y-2">
              <label className="text-sm font-medium text-foreground">岗位描述</label>
              <Textarea
                value={editor.draft.description}
                onChange={(event) => actions.updateDraft({ description: event.target.value })}
                placeholder="输入岗位职责、业务背景和候选人画像"
                className="min-h-[220px] bg-muted/30"
              />
            </section>

            <section className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-foreground">技能要求</h3>
                <p className="mt-1 text-sm text-fg-muted">使用英文逗号分隔多个技能。</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-fg-muted">必备技能</label>
                <Input
                  value={editor.draft.requiredSkills.join(", ")}
                  onChange={(event) =>
                    actions.updateDraft({ requiredSkills: parseTags(event.target.value) })
                  }
                  placeholder="React, TypeScript, Next.js"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-fg-muted">加分技能</label>
                <Input
                  value={editor.draft.bonusSkills.join(", ")}
                  onChange={(event) =>
                    actions.updateDraft({ bonusSkills: parseTags(event.target.value) })
                  }
                  placeholder="LLM 应用, Node.js, Supabase"
                  className="bg-background"
                />
              </div>
            </section>
          </div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button
                variant="outline"
                onClick={() => {
                  actions.resetDraft();
                  closeDrawer();
                }}
              >
                取消
              </Button>
            </DrawerClose>
            <Button variant="outline" onClick={() => actions.resetDraft()}>
              重置
            </Button>
            <Button onClick={() => void handleSave()} disabled={saving}>
              {saving ? "保存中..." : editor.activeJobId ? "更新岗位" : "保存岗位"}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
