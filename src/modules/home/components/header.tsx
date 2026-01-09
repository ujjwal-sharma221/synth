import Link from "next/link";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <div className="flex flex-row justify-between w-full">
      <div className="flex flex-row items-center gap-2">
        <Logo height={20} width={20} />
        <span className="text-lg font-semibold ">Synth</span>
      </div>
      <div className="flex flex-row gap-2">
        <Button variant="ghost" asChild>
          <Link href="/sign-up">Sign Up</Link>
        </Button>
        <Button variant="default" asChild>
          <Link href="/sign-in">Sign In</Link>
        </Button>
      </div>
    </div>
  );
};
