import Link from "next/link";
import type { Route } from "next";

const links: Array<{ href: Route; label: string }> = [
  { href: "/upload", label: "进入上传中心" },
  { href: "/dashboard/candidates", label: "查看候选人面板" },
  { href: "/dashboard/jobs", label: "管理岗位 JD" },
  { href: "/dashboard/matching", label: "查看匹配分析" }
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
      <div className="max-w-3xl rounded-[32px] border border-border/70 bg-white/80 p-10 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
          AI Resume Platform
        </p>
        <h1 className="max-w-2xl text-5xl font-semibold tracking-tight text-slate-900">
          智能简历分析与招聘决策工作台
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
          当前为工程骨架版本，已预留上传、候选人管理、JD 管理与匹配分析的页面入口，
          后续按领域模型和 API 契约继续填充。
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
