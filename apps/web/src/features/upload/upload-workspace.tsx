"use client";

import { useMemo, useRef } from "react";
import { Upload, FileText } from "lucide-react";
import { PageShell } from "@/components/common/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/common/empty-state";
import { useInstance } from "@/instance";
import { useUploadQueueState } from "@/domains/upload/hooks";

export function UploadWorkspace() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const instance = useInstance();
  const { queue } = useUploadQueueState();

  const completedCount = useMemo(
    () => queue.filter((item) => item.status === "completed").length,
    [queue]
  );

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const uploads = await instance.upload.createUploads(Array.from(files));
    for (const upload of uploads) {
      instance.upload.subscribeUploadEvents(upload.uploadId);
    }
  }

  return (
    <PageShell
      title="上传中心"
      description="通过批量上传 PDF 简历，实时跟踪解析与提取过程。上传、状态更新与事件流都经由 upload instance 和 upload-domain 统一管理。"
      actions={
        <>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="application/pdf"
            className="hidden"
            onChange={(event) => void handleFiles(event.target.files)}
          />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            选择 PDF
          </Button>
          <Button onClick={() => fileInputRef.current?.click()}>
            批量上传
          </Button>
        </>
      }
      aside={
        <section className="grid gap-4 md:grid-cols-3">
          <div className="app-kpi">
            <p className="text-xs uppercase tracking-[0.14em] text-fg-muted">队列总数</p>
            <p className="mt-2 text-2xl font-semibold">{queue.length}</p>
          </div>
          <div className="app-kpi">
            <p className="text-xs uppercase tracking-[0.14em] text-fg-muted">已完成</p>
            <p className="mt-2 text-2xl font-semibold">{completedCount}</p>
          </div>
          <div className="app-kpi">
            <p className="text-xs uppercase tracking-[0.14em] text-fg-muted">进行中</p>
            <p className="mt-2 text-2xl font-semibold">
              {queue.filter((item) => item.status !== "completed" && item.status !== "failed").length}
            </p>
          </div>
        </section>
      }
    >
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Resume Upload Dropzone</CardTitle>
            <CardDescription>
              支持拖拽上传与点击上传。当前版本限制 PDF，后端会返回上传记录并开始 SSE 解析流。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-72 w-full flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-muted/30 text-center transition hover:bg-muted/60"
            >
              <Upload className="h-7 w-7" />
              <div className="space-y-2">
                <p className="text-base font-medium">拖拽 PDF 到此处，或点击选择文件</p>
                <p className="text-sm text-fg-muted">建议单次上传 5-10 份，每份不超过 10MB</p>
              </div>
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Extraction Stream</CardTitle>
            <CardDescription>展示最新上传任务的阶段、事件和基础抽取结果。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {queue.length === 0 ? (
              <EmptyState
                title="暂无上传任务"
                description="上传后这里会实时展示 parsing、extracting、completed 等事件。"
              />
            ) : (
              queue.slice(0, 3).map((item) => (
                <div key={item.uploadId} className="space-y-3 rounded-lg border border-border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.fileName}</p>
                      <p className="text-xs text-fg-muted">{item.uploadId}</p>
                    </div>
                    <Badge variant="outline">{item.status}</Badge>
                  </div>
                  <Progress value={item.progress} />
                  {item.partialExtraction?.basic ? (
                    <div className="rounded-md bg-muted/50 p-3 text-xs text-fg-muted">
                      <pre className="whitespace-pre-wrap font-mono">
                        {JSON.stringify(item.partialExtraction.basic, null, 2)}
                      </pre>
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <section className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload Queue</CardTitle>
            <CardDescription>所有上传都通过 upload-domain 管理，不在页面内直接维护业务状态。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {queue.length === 0 ? (
              <EmptyState
                title="队列为空"
                description="开始上传后，会在这里出现每份简历的进度、错误信息和提取结果。"
              />
            ) : (
              queue.map((item) => (
                <div key={item.uploadId} className="space-y-4 rounded-lg border border-border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="rounded-md bg-muted p-2">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{item.fileName}</p>
                        <p className="text-xs text-fg-muted">{item.candidateId || "candidate pending"}</p>
                      </div>
                    </div>
                    <Badge>{item.status}</Badge>
                  </div>
                  <Progress value={item.progress} />
                  {item.error ? <p className="text-sm text-destructive">{item.error}</p> : null}
                  {item.events?.length ? (
                    <>
                      <Separator />
                      <div className="space-y-2 text-xs text-fg-muted">
                        {item.events.slice(-3).map((event, index) => (
                          <div key={`${event.type}-${index}`} className="flex justify-between gap-4">
                            <span>{event.type}</span>
                            <span className="truncate">{JSON.stringify(event.payload)}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </PageShell>
  );
}
