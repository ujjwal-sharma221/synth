import { cn } from "@/lib/utils";
import { getItemPadding } from "../utils";
import { Spinner } from "@/components/ui/spinner";

export function LoadingRow({
  className,
  level,
}: {
  className?: string;
  level: number;
}) {
  return (
    <div
      className={cn("h-5.5 items-center flex", className)}
      style={{ paddingLeft: getItemPadding({ level, isFile: true }) }}
    >
      <Spinner className="size-4 text-muted-foreground ml-0.5" />
    </div>
  );
}
