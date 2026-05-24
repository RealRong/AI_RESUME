import { cn } from "@/lib/utils";

export function PageShell({
  title,
  description,
  eyebrow = "招聘工作台",
  actions,
  aside,
  children,
  className
}: {
  title: string;
  description: string;
  eyebrow?: string;
  actions?: React.ReactNode;
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-6", className)}>
      <header className="grid gap-5 border-b border-border pb-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="space-y-3">
          <p className="app-section-title">{eyebrow}</p>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
            <p className="max-w-3xl text-sm leading-6 text-fg-muted">{description}</p>
          </div>
        </div>
        {actions ? <div className="flex items-center justify-start gap-3 lg:justify-end">{actions}</div> : null}
      </header>
      {aside}
      <section>{children}</section>
    </div>
  );
}
