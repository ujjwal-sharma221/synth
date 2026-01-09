"use client";

import { Button } from "@/components/ui/button";

// import { ensureAuthenticated } from "@/modules/auth/functions";

const Page = () => {
  async function handleBlock() {
    await fetch("/api/demo/blocking", { method: "POST" });
  }

  return (
    <div className="h-screen flex items-center justify-center">
      <Button onClick={handleBlock}>Generate Text</Button>
    </div>
  );
};

export default Page;
