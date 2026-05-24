import { PageShell } from "@/components/common/page-shell";

const mockRows = [
  { name: "张三", status: "Pending", score: 86, skills: "React, TS, Node.js" },
  { name: "李四", status: "Interviewing", score: 79, skills: "Vue, JS, CSS" }
];

export function CandidateListFeature() {
  return (
    <PageShell
      title="候选人面板"
      description="列表页将承载搜索、筛选、排序、卡片/表格视图切换与批量对比。当前骨架保留版式结构。"
    >
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">
            Search / Filter / Sort Toolbar
          </div>
          <div className="rounded-full bg-amber-100 px-4 py-2 text-sm text-amber-700">
            View Toggle
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Skills</th>
              </tr>
            </thead>
            <tbody>
              {mockRows.map((row) => (
                <tr key={row.name} className="border-t border-slate-200">
                  <td className="px-4 py-4 text-slate-900">{row.name}</td>
                  <td className="px-4 py-4 text-slate-600">{row.status}</td>
                  <td className="px-4 py-4 text-slate-600">{row.score}</td>
                  <td className="px-4 py-4 text-slate-600">{row.skills}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </PageShell>
  );
}
