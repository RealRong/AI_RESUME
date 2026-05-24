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
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="min-w-0 flex-1">
          <div className={cn("app-page", className)}>{children}</div>
        </div>
      </div>
    </main>
  );
}
