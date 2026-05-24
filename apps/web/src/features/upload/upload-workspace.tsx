"use client";

import { useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, ImageOff, LoaderCircle, Upload } from "lucide-react";
import { PageShell } from "@/components/common/page-shell";
import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useUploadQueueState } from "@/domains/upload/hooks";
import type { UploadQueueItem } from "@/domains/upload/types";
import { useInstance } from "@/instance";
import { cn } from "@/lib/utils";
import { getUploadStatusLabel } from "@/lib/utils/display";

function formatFileSize(size?: number) {
  if (!size) {
    return null;
  }

  if (size < 1024 * 1024) {
    return `${Math.round(size / 102.4) / 10} KB`;
  }

  return `${Math.round(size / (1024 * 102.4)) / 10} MB`;
}

function UploadPreviewThumbnail({ item }: { item: UploadQueueItem }) {
  if (item.preview?.thumbnailStatus === "ready" && item.preview.thumbnailUrl) {
    return (
      <div className="relative h-[164px] w-[118px] overflow-hidden rounded-lg bg-background">
        <img
          src={item.preview.thumbnailUrl}
          alt={`${item.fileName} 首页缩略图`}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  if (item.preview?.thumbnailStatus === "generating") {
    return <Skeleton className="h-[164px] w-[118px] rounded-lg" />;
  }

  return (
    <div className="flex h-[164px] w-[118px] flex-col items-center justify-center rounded-lg bg-muted text-fg-muted">
      {item.preview?.thumbnailStatus === "failed" ? (
        <ImageOff className="h-6 w-6" />
      ) : (
        <FileText className="h-6 w-6" />
      )}
      <p className="mt-3 text-xs">PDF 预览</p>
    </div>
  );
}

function UploadBasicInfo({ item }: { item: UploadQueueItem }) {
  const basic = item.partialExtraction?.basic;

  if (basic) {
    const rows = [
      { label: "姓名", value: basic.name },
      { label: "邮箱", value: basic.email },
      { label: "电话", value: basic.phone },
      { label: "城市", value: basic.city }
    ].filter((row) => row.value);

    if (rows.length === 0) {
      return <p className="text-sm text-fg-muted">正在整理候选人基础信息</p>;
    }

    return (
      <div className="grid gap-2 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4">
            <span className="text-fg-muted">{row.label}</span>
            <span className="truncate text-right text-foreground">{String(row.value)}</span>
          </div>
        ))}
      </div>
    );
  }

  if (item.status === "uploading" || item.status === "parsing" || item.status === "extracting") {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-3/5" />
      </div>
    );
  }

  return <p className="text-sm text-fg-muted">基础信息将在处理完成后显示</p>;
}

function UploadQueueRow({ item }: { item: UploadQueueItem }) {
  const progressLabel = item.status === "completed" ? 100 : item.progress;
  const recentEvent = item.events?.[item.events.length - 1];

  return (
    <div className="grid gap-4 py-5 first:pt-0 last:pb-0 lg:grid-cols-[118px_minmax(0,1fr)] lg:items-start">
      <UploadPreviewThumbnail item={item} />

      <div className="min-w-0 space-y-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{item.fileName}</p>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-fg-muted">
                <span>{item.candidateId || "候选人档案准备中"}</span>
                {formatFileSize(item.fileSize) ? <span>{formatFileSize(item.fileSize)}</span> : null}
                {item.preview?.pageCount ? <span>{item.preview.pageCount} 页</span> : null}
              </div>
            </div>
            <Badge variant="outline">{getUploadStatusLabel(item.status)}</Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4 text-xs text-fg-muted">
              <span>
                {recentEvent?.payload.message
                  ? String(recentEvent.payload.message)
                  : item.status === "completed"
                    ? "简历已完成处理"
                    : item.status === "failed"
                      ? "处理过程中出现错误"
                      : "正在处理当前简历"}
              </span>
              <span>{progressLabel}%</span>
            </div>
            <Progress value={progressLabel} />
          </div>
        </div>

        {item.error ? <p className="text-sm text-destructive">{item.error}</p> : null}

        <div className="rounded-lg bg-muted/50 p-4">
          <UploadBasicInfo item={item} />
        </div>
        {item.preview?.thumbnailError ? (
          <p className="text-xs leading-5 text-fg-muted">
            缩略图预览不可用：{item.preview.thumbnailError}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function UploadWorkspace() {
  const instance = useInstance();
  const { queue } = useUploadQueueState();
  const [rejectionMessage, setRejectionMessage] = useState<string | null>(null);

  const orderedQueue = useMemo(() => [...queue].reverse(), [queue]);
  const completedCount = useMemo(
    () => queue.filter((item) => item.status === "completed").length,
    [queue]
  );
  const failedCount = useMemo(
    () => queue.filter((item) => item.status === "failed").length,
    [queue]
  );
  const processingCount = useMemo(
    () => queue.filter((item) => item.status !== "completed" && item.status !== "failed").length,
    [queue]
  );

  const dropzone = useDropzone({
    accept: {
      "application/pdf": [".pdf"]
    },
    maxFiles: 10,
    maxSize: 10 * 1024 * 1024,
    multiple: true,
    onDropAccepted(files) {
      setRejectionMessage(null);
      void instance.upload
        .createUploads(files)
        .then((uploads) => {
          for (const upload of uploads) {
            instance.upload.subscribeUploadEvents(upload.uploadId);
          }
        })
        .catch((error: unknown) => {
          setRejectionMessage(
            error instanceof Error ? error.message : "上传请求失败，请稍后重试。"
          );
        });
    },
    onDropRejected(rejections) {
      const firstError = rejections[0]?.errors[0];

      if (!firstError) {
        setRejectionMessage("文件暂时无法上传，请重试。");
        return;
      }

      if (firstError.code === "file-invalid-type") {
        setRejectionMessage("仅支持上传 PDF 文件。");
        return;
      }

      if (firstError.code === "too-many-files") {
        setRejectionMessage("单次上传文件过多，请分批上传。");
        return;
      }

      if (firstError.code === "file-too-large") {
        setRejectionMessage("单份文件不能超过 10MB。");
        return;
      }

      setRejectionMessage(firstError.message);
    }
  });

  return (
    <PageShell
      title="上传中心"
      description="批量上传 PDF 简历，实时查看首页缩略图、处理进度和基础信息。"
      actions={
        <>
          <Button variant="outline" onClick={dropzone.open}>
            选择 PDF
          </Button>
          <Button onClick={dropzone.open}>开始上传</Button>
        </>
      }
      aside={
        <section className="grid gap-4 md:grid-cols-4">
          <div className="app-kpi">
            <p className="text-xs uppercase tracking-[0.14em] text-fg-muted">总数</p>
            <p className="mt-2 text-2xl font-semibold">{queue.length}</p>
          </div>
          <div className="app-kpi">
            <p className="text-xs uppercase tracking-[0.14em] text-fg-muted">处理中</p>
            <p className="mt-2 text-2xl font-semibold">{processingCount}</p>
          </div>
          <div className="app-kpi">
            <p className="text-xs uppercase tracking-[0.14em] text-fg-muted">已完成</p>
            <p className="mt-2 text-2xl font-semibold">{completedCount}</p>
          </div>
          <div className="app-kpi">
            <p className="text-xs uppercase tracking-[0.14em] text-fg-muted">失败</p>
            <p className="mt-2 text-2xl font-semibold">{failedCount}</p>
          </div>
        </section>
      }
    >
      <section>
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <CardTitle>上传文件</CardTitle>
                <CardDescription>拖拽或选择本地 PDF，进入队列后会立即生成首页缩略图。</CardDescription>
              </div>
              <Badge variant="outline">支持批量上传</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              {...dropzone.getRootProps()}
              className={cn(
                "flex min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-xl bg-muted/60 px-8 text-center transition",
                dropzone.isDragActive ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "hover:bg-muted"
              )}
            >
              <input {...dropzone.getInputProps()} />
              <div className="rounded-full bg-background p-4">
                {dropzone.isDragActive ? (
                  <LoaderCircle className="h-7 w-7 animate-spin" />
                ) : (
                  <Upload className="h-7 w-7" />
                )}
              </div>
              <div className="mt-5 space-y-2">
                <p className="text-lg font-medium text-foreground">
                  {dropzone.isDragActive ? "松开即可开始上传" : "拖拽 PDF 到此处，或点击选择文件"}
                </p>
                <p className="text-sm leading-6 text-fg-muted">
                  建议单次上传 5-10 份，每份不超过 10MB。系统会在上传过程中同步生成首页缩略图。
                </p>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-fg-muted">
                <span className="rounded-full bg-background px-3 py-1">PDF</span>
                <span className="rounded-full bg-background px-3 py-1">首页缩略图</span>
                <span className="rounded-full bg-background px-3 py-1">基础信息提取</span>
              </div>
            </div>

            {rejectionMessage ? (
              <p className="text-sm text-destructive">{rejectionMessage}</p>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <section className="mt-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <CardTitle>上传队列</CardTitle>
                <CardDescription>所有上传任务都在这里统一查看，并按最新任务优先排序。</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {orderedQueue[0] ? (
                  <Badge variant="secondary">
                    最新任务：{getUploadStatusLabel(orderedQueue[0].status)}
                  </Badge>
                ) : null}
                <Badge variant="outline">{queue.length} 条记录</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {orderedQueue.length === 0 ? (
              <EmptyState
                title="队列为空"
                description="开始上传后，这里会出现每份简历的缩略图、进度和提取结果。"
                inset
              />
            ) : (
              <div className="divide-y divide-border">
                {orderedQueue.map((item) => (
                  <UploadQueueRow key={item.clientId} item={item} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </PageShell>
  );
}
