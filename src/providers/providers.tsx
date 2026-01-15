import { ConvexClientProvider } from "./convex-client-provider";
import { ThemeProvider } from "./theme-provider";

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <ConvexClientProvider>
        <ThemeProvider attribute="class" defaultTheme="dark">
          {children}
        </ThemeProvider>
      </ConvexClientProvider>
    </main>
  );
}
