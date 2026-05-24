export function StatCard({
  label,
  value,
  detail
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-xl bg-muted/30 px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-fg-muted">{label}</p>
      <div className="mt-3 space-y-1">
        <p className="text-2xl font-semibold text-foreground">{value}</p>
        {detail ? <p className="text-sm text-fg-muted">{detail}</p> : null}
      </div>
    </div>
  );
}
