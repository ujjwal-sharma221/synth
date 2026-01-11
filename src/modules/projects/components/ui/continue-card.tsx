import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { Button } from "@/components/ui/button";
import { Doc } from "../../../../../convex/_generated/dataModel";

export function ContinueCard({ data }: { data: Doc<"projects"> }) {
  return (
    <div>
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>Last Updated</ItemTitle>
          <ItemDescription>{data.name}</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/projects/${data._id}`}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <ArrowRightIcon />
                </div>
              </div>
            </Link>
          </Button>
        </ItemActions>
      </Item>
    </div>
  );
}
