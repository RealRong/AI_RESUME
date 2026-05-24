"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { Bot, BriefcaseBusiness, LayoutGrid, SearchCheck, Upload } from "lucide-react";
import { AiSettingsDialog } from "@/components/common/ai-settings-dialog";
import { useSettingsState } from "@/domains/settings/hooks";
import { useInstance } from "@/instance";
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
  const instance = useInstance();
  const { ai } = useSettingsState();
  const configured = Boolean(ai.savedConfig?.apiKey);
  const configSummary = configured
    ? `${ai.savedConfig?.model ?? "已配置"} · ${ai.savedConfig?.baseUrl ?? ""}`.replace(/^ · /, "")
    : "未配置";

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
      <div className="border-t border-sidebar-border px-4 py-4">
        <button
          type="button"
          onClick={() => instance.settings.openAiDialog()}
          className="flex w-full items-start gap-3 rounded-lg border border-transparent px-3 py-3 text-left transition-colors hover:bg-muted"
        >
          <div className="mt-0.5 rounded-md border border-border bg-background p-2">
            <Bot className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-foreground">AI 配置</p>
              <span
                className={cn(
                  "text-xs",
                  configured ? "text-foreground" : "text-fg-muted"
                )}
              >
                {configured ? "已配置" : "未配置"}
              </span>
            </div>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-fg-muted">{configSummary}</p>
          </div>
        </button>
      </div>
      <AiSettingsDialog />
    </aside>
  );
}
