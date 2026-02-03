import { ConvexClientProvider } from "./convex-client-provider";
import { ThemeProvider } from "./theme-provider";

export function Provider({
  children,
  initialToken,
}: {
  children: React.ReactNode;
  initialToken?: string | null;
}) {
  return (
    <main>
      <ConvexClientProvider initialToken={initialToken}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          {children}
        </ThemeProvider>
      </ConvexClientProvider>
    </main>
  );
}
