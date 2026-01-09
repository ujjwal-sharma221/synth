"use client";

import { useState } from "react";
import { PlusIcon } from "lucide-react";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { SignUpForm } from "../components/sign-up-form";
import { SignInForm } from "../components/sign-in-form";

type AuthView = "menu" | "signup" | "signin";

export function AuthScreen() {
  const [expandedItem, setExpandedItem] = useState<AuthView>("menu");

  const toggleItem = (item: AuthView) => {
    setExpandedItem(expandedItem === item ? "menu" : item);
  };

  const [isItemExpanded, setIsItemExpanded] = useState(false);

  return (
    <div className="h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <ItemGroup className="gap-4">
          <a
            href="/"
            className="flex items-center gap-2 self-center font-medium"
          >
            <div className="flex size-6 items-center justify-center rounded-md">
              <Logo height={20} width={20} />
            </div>
            Synth
          </a>

          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              expandedItem === "signin"
                ? "max-h-0 opacity-0"
                : "max-h-[500px] opacity-100"
            }`}
          >
            <div className="overflow-hidden">
              <Item
                variant="muted"
                className="cursor-pointer hover:bg-accent/50 transition-colors"
              >
                <ItemContent className="gap-1">
                  <ItemTitle className="font-semibold">Register</ItemTitle>
                  <ItemDescription>Create an account</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => {
                      toggleItem("signup");
                    }}
                  >
                    <PlusIcon
                      className={`transition-transform duration-300 ${
                        expandedItem === "signup" ? "rotate-45" : "rotate-0"
                      }`}
                    />
                  </Button>
                </ItemActions>
              </Item>

              <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${
                  expandedItem === "signup"
                    ? "max-h-[2000px] opacity-100 mt-4"
                    : "max-h-0 opacity-0"
                }`}
              >
                <SignUpForm inAuthScreen />
              </div>
            </div>
          </div>

          <div className="overflow-hidden">
            <Item
              variant="muted"
              className="cursor-pointer hover:bg-accent/50 transition-colors"
            >
              <ItemContent className="gap-1">
                <ItemTitle className="font-semibold">Login</ItemTitle>
                <ItemDescription>Sign in to your account</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => toggleItem("signin")}
                >
                  <PlusIcon
                    className={`transition-transform duration-300 ${
                      expandedItem === "signin" ? "rotate-45" : "rotate-0"
                    }`}
                  />
                </Button>
              </ItemActions>
            </Item>

            {/* Expandable Sign In Form */}
            <div
              className={`transition-all duration-500 ease-in-out overflow-hidden ${
                expandedItem === "signin"
                  ? "max-h-[2000px] opacity-100 mt-4"
                  : "max-h-0 opacity-0"
              }`}
            >
              <SignInForm inAuthScreen />
            </div>
          </div>
        </ItemGroup>
      </div>
    </div>
  );
}
