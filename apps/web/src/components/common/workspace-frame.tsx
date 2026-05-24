import { cn } from "@/lib/utils";
import { AppSidebar } from "./app-sidebar";

export function WorkspaceFrame({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
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
