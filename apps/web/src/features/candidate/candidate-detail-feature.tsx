import { PageShell } from "@/components/common/page-shell";

export function CandidateDetailFeature({ candidateId }: { candidateId: string }) {
  return (
    <PageShell
      title={`候选人详情 · ${candidateId}`}
      description="详情页会聚合基础信息、教育经历、工作经历、项目经历、评分结果和 PDF 预览。"
    >
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6">
          <h2 className="text-xl font-semibold text-slate-900">Profile Summary</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            后续接入基础信息、技能标签和状态变更动作。
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6">
          <h2 className="text-xl font-semibold text-slate-900">PDF Preview / Matching</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            后续接入签名 URL 预览与评分详情展示。
          </p>
        </div>
      </section>
    </PageShell>
  );
}
