import {
  BoltIcon,
  BookOpenIcon,
  CircleUserRoundIcon,
  Layers2Icon,
  LogOutIcon,
  PinIcon,
  UserPenIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";

export function UserAvatar({ isDarkMode }: { isDarkMode?: boolean }) {
  const session = authClient.useSession();

  const handleLogout = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/sign-in";
        },
      },
    });
  };

  if (session.isPending) {
    <UserAvatarSkeleton isDarkMode={isDarkMode} />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Open account menu"
          size="icon"
          variant="outline"
          className={cn(isDarkMode && "text-white bg-black border-none")}
        >
          <CircleUserRoundIcon aria-hidden="true" size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-w-64">
        <DropdownMenuLabel className="flex items-start gap-3">
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-medium text-foreground text-sm">
              {session.data?.user.name}
            </span>
            <span className="truncate font-normal text-muted-foreground text-xs">
              {session.data?.user.email}
            </span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOutIcon aria-hidden="true" className="opacity-60" size={16} />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const UserAvatarSkeleton = ({ isDarkMode }: { isDarkMode?: boolean }) => {
  return (
    <div
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-md border",
        isDarkMode && "border-white/20",
      )}
    >
      <Skeleton className="h-5 w-5 rounded-full" />
    </div>
  );
};
