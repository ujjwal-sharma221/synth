import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";

export function Loader({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex w-full max-w-xs flex-col gap-4 [--radius:1rem]",
        className,
      )}
    >
      <Item variant="muted">
        <ItemMedia>
          <Spinner />
        </ItemMedia>
        <ItemContent>
          <ItemTitle className="line-clamp-1">Loading...</ItemTitle>
        </ItemContent>
      </Item>
    </div>
  );
}
