import { PageShell } from "@/components/common/page-shell";

export function MatchingWorkspaceFeature() {
  return (
    <PageShell
      title="岗位匹配分析"
      description="匹配页会承载 JD 选择、候选人选择、综合评分图表和 AI 评语。当前先铺好工作区结构。"
    >
      <section className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6">
          <h2 className="text-xl font-semibold text-slate-900">Matching Config</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            后续接入 JD 选择器、候选人对比选择和评分触发按钮。
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6">
          <h2 className="text-xl font-semibold text-slate-900">Charts & Summary</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            后续接入雷达图、柱状图、综合分环形图与 AI 评语摘要。
          </p>
        </div>
      </section>
    </PageShell>
  );
}
