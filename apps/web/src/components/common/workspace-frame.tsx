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
      <div
        className={cn(
          "mx-auto grid min-h-screen w-full max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-10",
          className
        )}
      >
        <AppSidebar />
        <div className="flex min-w-0 flex-col gap-8">{children}</div>
      </div>
    </main>
  );
}
