import Link from "next/link";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <Logo isDarkMode height={24} width={24} />
            <span className="text-xl font-semibold tracking-tight">Synth</span>
          </Link>

          {/* Navigation Buttons */}
          <nav className="flex items-center gap-3">
            <Button
              variant="ghost"
              asChild
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Link href="/sign-up">Sign Up</Link>
            </Button>
            <Button
              variant="default"
              asChild
              className="text-sm font-medium shadow-sm"
            >
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};
