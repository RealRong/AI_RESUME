"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { BriefcaseBusiness, LayoutGrid, SearchCheck, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems: Array<{
  href: Route;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    href: "/upload",
    label: "Upload",
    description: "批量上传与解析",
    icon: Upload
  },
  {
    href: "/dashboard/candidates",
    label: "Candidates",
    description: "候选人列表与详情",
    icon: LayoutGrid
  },
  {
    href: "/dashboard/jobs",
    label: "Jobs",
    description: "岗位 JD 管理",
    icon: BriefcaseBusiness
  },
  {
    href: "/dashboard/matching",
    label: "Matching",
    description: "匹配分析与评分",
    icon: SearchCheck
  }
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard/candidates") {
    return pathname === href || pathname.startsWith("/dashboard/candidates/");
  }
  return pathname === href;
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-8 rounded-2xl border border-border bg-card p-4 shadow-panel">
        <div className="border-b border-border px-3 pb-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-fg-muted">
            AI Resume Platform
          </p>
          <p className="mt-3 text-lg font-semibold text-foreground">Workspace</p>
          <p className="mt-1 text-sm leading-6 text-fg-muted">
            所有业务页都从同一导航骨架进入。
          </p>
        </div>
        <nav className="mt-4 space-y-2">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-start gap-3 rounded-xl border px-3 py-3 transition",
                  active
                    ? "border-primary bg-muted text-foreground"
                    : "border-transparent text-fg-muted hover:border-border hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 rounded-md border p-2",
                    active ? "border-primary bg-background" : "border-border bg-background"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="mt-1 text-xs leading-5 text-fg-muted">{item.description}</p>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
