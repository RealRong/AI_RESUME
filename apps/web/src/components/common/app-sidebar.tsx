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
    label: "上传简历",
    description: "批量上传与处理进度",
    icon: Upload
  },
  {
    href: "/dashboard/candidates",
    label: "候选人",
    description: "列表、详情与画像",
    icon: LayoutGrid
  },
  {
    href: "/dashboard/jobs",
    label: "岗位管理",
    description: "岗位信息与要求维护",
    icon: BriefcaseBusiness
  },
  {
    href: "/dashboard/matching",
    label: "匹配分析",
    description: "候选人与岗位评估",
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
    <aside className="app-sidebar-shell">
      <div className="flex items-center border-b border-sidebar-border px-6 py-6">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-fg-muted">
            智能简历平台
          </p>
          <div>
            <p className="text-lg font-semibold text-foreground">工作台</p>
            <p className="mt-1 text-sm text-fg-muted">候选人、岗位与匹配分析</p>
          </div>
        </div>
      </div>
      <nav className="app-sidebar-nav">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "app-sidebar-item",
                active
                  ? "border-sidebar-border bg-muted text-foreground"
                  : "text-fg-muted hover:bg-muted hover:text-foreground"
              )}
            >
              <div
                className={cn(
                  "mt-0.5 rounded-md border p-2",
                  active ? "border-sidebar-border bg-background" : "border-border bg-background"
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
    </aside>
  );
}
