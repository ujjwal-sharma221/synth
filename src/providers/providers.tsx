import { ConvexClientProvider } from "./convex-client-provider";

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <ConvexClientProvider>{children}</ConvexClientProvider>
    </main>
  );
}
