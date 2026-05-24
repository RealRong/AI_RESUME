import { PageShell } from "@/components/common/page-shell";

export function UploadWorkspace() {
  return (
    <PageShell
      title="上传中心"
      description="这里承载 PDF 批量上传、上传进度展示、SSE 提取流与结果预览。当前阶段先完成页面壳和模块落点。"
    >
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white/85 p-10">
          <h2 className="text-xl font-semibold text-slate-900">Resume Upload Dropzone</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            后续接入拖拽上传、批量队列、进度条与文件校验。
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white/85 p-8">
          <h2 className="text-xl font-semibold text-slate-900">Extraction Progress Panel</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            后续接入 SSE 事件流、部分结果卡片与错误恢复。
          </p>
        </div>
      </section>
    </PageShell>
  );
}
