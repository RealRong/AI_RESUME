import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card className="shadow-none">
      <CardHeader className="pb-3">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-fg-muted">{label}</p>
      </CardHeader>
      <CardContent className="space-y-1">
        <CardTitle className="text-2xl">{value}</CardTitle>
        {detail ? <p className="text-sm text-fg-muted">{detail}</p> : null}
      </CardContent>
    </Card>
  );
}
