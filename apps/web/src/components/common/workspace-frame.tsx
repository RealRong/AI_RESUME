"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUiActions } from "@/domains/ui/hooks";
import { useInstance } from "@/instance";
import { AppSidebar } from "./app-sidebar";

export function WorkspaceFrame({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const instance = useInstance();
  const uiActions = useUiActions();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.altKey) {
        return;
      }

      if (event.key === "1") router.push("/upload");
      if (event.key === "2") router.push("/dashboard/candidates");
      if (event.key === "3") router.push("/dashboard/jobs");
      if (event.key === "4") router.push("/dashboard/matching");
      if (event.key.toLowerCase() === "a") instance.settings.openAiDialog();
      if (event.key.toLowerCase() === "t") uiActions.toggleTheme();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [instance, router, uiActions]);

  return (
    <main className="app-shell">
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className={cn("app-page", className)}>{children}</div>
        </div>
      </div>
    </main>
  );
}
