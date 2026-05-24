import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  inset = false
}: {
  title: string;
  description: string;
  inset?: boolean;
}) {
  return (
    <Card className={cn(inset && "border-0 bg-transparent shadow-none")}>
      <CardHeader className={cn(inset && "px-0 pt-0")}>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className={cn(inset && "px-0 pb-0")}>
        <p className="text-sm leading-6 text-fg-muted">{description}</p>
      </CardContent>
    </Card>
  );
}
