import { PageShell } from "@/components/common/page-shell";

export function JobListFeature() {
  return (
    <PageShell
      title="岗位 JD 管理"
      description="JD 页面会包含岗位列表、编辑器和必备/加分技能标签输入。当前先保留功能容器。"
    >
      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6">
          <h2 className="text-xl font-semibold text-slate-900">Job List</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            后续接入 JD 列表、选中态与删除操作。
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6">
          <h2 className="text-xl font-semibold text-slate-900">Job Editor</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            后续接入 JD 表单、技能标签编辑与保存逻辑。
          </p>
        </div>
      </section>
    </PageShell>
  );
}
