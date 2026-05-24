"use client";

import { useEffect } from "react";
import { PageShell } from "@/components/common/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/empty-state";
import { useInstance } from "@/instance";
import { useJobActions, useJobState } from "@/domains/job/hooks";

function parseTags(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function JobListFeature() {
  const instance = useInstance();
  const { list, editor } = useJobState();
  const actions = useJobActions();

  useEffect(() => {
    void instance.job.fetchList();
  }, [instance]);

  async function handleSave() {
    if (!editor.draft.title || !editor.draft.description) {
      return;
    }

    if (editor.activeJobId) {
      await instance.job.updateJob(editor.activeJobId, editor.draft);
    } else {
      await instance.job.createJob(editor.draft);
    }
    actions.resetDraft();
  }

  return (
    <PageShell
      title="岗位 JD 管理"
      description="JD 维护通过 job instance 统一进入后端，草稿状态放在 job-domain，页面只负责表单绑定。"
      actions={
        <Button variant="outline" onClick={() => actions.resetDraft()}>
          新建 JD
        </Button>
      }
    >
      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Job List</CardTitle>
            <CardDescription>点击左侧条目会把内容 hydrate 到编辑草稿。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {list.error ? (
              <EmptyState title="JD 加载失败" description={list.error} />
            ) : list.items.length === 0 ? (
              <EmptyState title="暂无岗位" description="当前接口没有返回岗位数据，可以直接在右侧创建第一条 JD。" />
            ) : (
              list.items.map((job) => (
                <button
                  key={job.id}
                  type="button"
                  onClick={() => actions.setActiveJob(job)}
                  className="flex w-full flex-col gap-2 rounded-lg border border-border p-4 text-left transition hover:bg-muted/40"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{job.title}</p>
                    <Badge variant="outline">{job.requiredSkills.length} 必备</Badge>
                  </div>
                  <p className="line-clamp-2 text-sm text-fg-muted">{job.description}</p>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Editor</CardTitle>
            <CardDescription>采用黑白极简的结构化表单，不在页面里直接发请求或维护业务草稿迁移。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">岗位标题</label>
              <Input
                value={editor.draft.title}
                onChange={(event) => actions.updateDraft({ title: event.target.value })}
                placeholder="例如：高级前端工程师"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">岗位描述</label>
              <Textarea
                value={editor.draft.description}
                onChange={(event) => actions.updateDraft({ description: event.target.value })}
                placeholder="输入岗位职责与候选人画像"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">必备技能</label>
              <Input
                value={editor.draft.requiredSkills.join(", ")}
                onChange={(event) =>
                  actions.updateDraft({ requiredSkills: parseTags(event.target.value) })
                }
                placeholder="React, TypeScript, Next.js"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">加分技能</label>
              <Input
                value={editor.draft.bonusSkills.join(", ")}
                onChange={(event) =>
                  actions.updateDraft({ bonusSkills: parseTags(event.target.value) })
                }
                placeholder="AI product, Node.js"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => actions.resetDraft()}>
                重置
              </Button>
              <Button onClick={() => void handleSave()}>
                {editor.activeJobId ? "更新 JD" : "保存 JD"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </PageShell>
  );
}
