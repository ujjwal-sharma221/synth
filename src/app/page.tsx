import { Logo } from "@/components/logo";

const EDITOR_LINES: { indent?: number; tokens: [string, string][] }[] = [
  {
    tokens: [
      ["keyword", "export"],
      ["space", " "],
      ["keyword-alt", "default"],
      ["space", " "],
      ["keyword", "function"],
      ["space", " "],
      ["text", "Dashboard"],
      ["text-muted", "()"],
      ["space", " "],
      ["text-muted", "{"],
    ],
  },
  {
    indent: 16,
    tokens: [
      ["keyword", "return"],
      ["space", " "],
      ["text-muted", "("],
    ],
  },
  {
    indent: 32,
    tokens: [
      ["punct", "<"],
      ["tag", "div"],
      ["space", " "],
      ["prop", "className"],
      ["text-muted", "="],
      ["string", "\"grid\""],
      ["punct", ">"],
    ],
  },
  {
    indent: 48,
    tokens: [
      ["comment", "{/* "],
      ["string", "agent inserted analytics card"],
      ["comment", " */}"],
    ],
  },
  {
    indent: 48,
    tokens: [
      ["punct", "<"],
      ["tag", "Card"],
      ["space", " "],
      ["prop", "title"],
      ["text-muted", "="],
      ["string", "\"Latency\""],
      ["space", " "],
      ["prop", "value"],
      ["text-muted", "="],
      ["string", "\"128ms\""],
      ["space", " "],
      ["punct", "/>"],
    ],
  },
  {
    indent: 48,
    tokens: [
      ["punct", "<"],
      ["tag", "Card"],
      ["space", " "],
      ["prop", "title"],
      ["text-muted", "="],
      ["string", "\"Cost\""],
      ["space", " "],
      ["prop", "value"],
      ["text-muted", "="],
      ["string", "\"$0.04\""],
      ["space", " "],
      ["punct", "/>"],
    ],
  },
  {
    indent: 32,
    tokens: [
      ["punct", "</"],
      ["tag", "div"],
      ["punct", ">"],
    ],
  },
  {
    indent: 32,
    tokens: [
      ["punct", "<"],
      ["tag", "Charts"],
      ["space", " "],
      ["prop", "data"],
      ["text-muted", "="],
      ["string", "{metrics}"],
      ["space", " "],
      ["punct", "/>"],
    ],
  },
  {
    indent: 32,
    tokens: [
      ["punct", "<"],
      ["tag", "Table"],
      ["space", " "],
      ["prop", "rows"],
      ["text-muted", "="],
      ["string", "{deploys}"],
      ["space", " "],
      ["punct", "/>"],
    ],
  },
  {
    indent: 16,
    tokens: [
      ["text-muted", ")"],
    ],
  },
  {
    tokens: [["text-muted", "}"]],
  },
];

const CHANGESET_LINES = [
  "+ src/app/dashboard.tsx",
  "+ src/components/cards.tsx",
  "+ src/lib/metrics.ts",
];

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-[#0b0c10] text-[#f1f1f1]">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0b0c10]/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Logo isDarkMode height={22} width={22} />
            <span className="text-sm font-semibold tracking-wide">Synth</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-sm text-white/70 transition hover:text-white">
              Sign in
            </button>
            <button className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/35">
              Get started
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col px-6 pb-20 pt-14">
        <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col gap-6">
            <p className="text-xs uppercase tracking-[0.25em] text-white/50">
              Web based editor
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
              Synth is the minimal editor for building with AI.
            </h1>
            <p className="max-w-xl text-base text-white/70 sm:text-lg">
              A clean workspace that pairs with your agent, keeps context close,
              and ships real code without the clutter.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:translate-y-[-1px]">
                Open Synth
              </button>
              <button className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white">
                View docs
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-white/10">
            <img
              src="https://images.unsplash.com/photo-1558865869-c93f6f8482af?w=1400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDh8fHRleHR1cmVzfGVufDB8fDB8fHww"
              alt="Workspace preview"
              className="h-full w-full object-cover"
            />
          </div>
        </section>

        <section className="mt-12">
          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0f1118] shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 text-xs text-white/60">
              <div className="flex items-center gap-2">
                <div className="relative flex items-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                </div>
                <div className="relative flex items-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                </div>
                <div className="relative flex items-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                </div>
              </div>
              <span className="ml-3">Synth — demo workspace</span>
            </div>
            <div className="grid gap-0 border-b border-white/10 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="border-b border-white/10 p-6 lg:border-b-0 lg:border-r">
                <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                  Editor
                </p>
                <div className="mt-4 space-y-2 font-mono text-xs text-white/80">
                  <div className="text-white/50">dashboard.tsx</div>
                  {EDITOR_LINES.map((line, lineIndex) => (
                    <div
                      key={`line-${lineIndex}`}
                      className="flex flex-wrap"
                      style={{ paddingLeft: line.indent ?? 0 }}
                    >
                      {line.tokens.map(([type, value], tokenIndex) => {
                        const styles: Record<string, string> = {
                          keyword: "text-[#7dd3fc]",
                          "keyword-alt": "text-[#a7f3d0]",
                          text: "text-white",
                          "text-muted": "text-white/60",
                          comment: "text-white/40",
                          string: "text-[#fca5a5]",
                          tag: "text-[#a7f3d0]",
                          prop: "text-[#7dd3fc]",
                          punct: "text-[#fbbf24]",
                          space: "",
                        };
                        const className =
                          styles[type] ?? "text-white/70";
                        return (
                          <span
                            key={`token-${lineIndex}-${tokenIndex}`}
                            className={className}
                          >
                            {value}
                          </span>
                        );
                      })}
                    </div>
                  ))}
                  <div className="pt-3 text-[10px] uppercase tracking-[0.25em] text-white/40">
                    changes
                  </div>
                  {CHANGESET_LINES.map((line) => (
                    <div key={line} className="text-white/60">
                      {line}
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6">
                <p className="text-xs uppercase tracking-[0.25em] text-white/40">
                  Agent
                </p>
                <div className="mt-4 space-y-3 rounded-2xl border border-white/10 bg-[#11131c] p-4 text-xs text-white/70">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-white/40">
                    <span>Generating</span>
                    <span>GPT-5.2</span>
                  </div>
                  <p>
                    Added experiment tracking, refactored the model loader, and
                    wired a new results table. Ready for review.
                  </p>
                  <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-[10px] text-white/60">
                    Updated 4 queries · 2 new components · 1 migration
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-[10px] text-white/60">
                    +37 -0 · 3 files changed
                  </div>
                </div>
              </div>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-3">
              {[
                "Agent turns ideas into code",
                "Fast, predictable edits",
                "Runs entirely in the browser",
              ].map((label) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-[#0c0f16] p-4 text-xs text-white/70"
                >
                  <div className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                    Feature
                  </div>
                  <div className="mt-2 text-sm text-white">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Deploy-ready changes",
              subtitle:
                "Synth keeps diffs small and reviewable, so every run produces a clean PR.",
              image:
                "https://images.unsplash.com/photo-1612522677470-d66b46e8963b?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            },
            {
              title: "Context that sticks",
              subtitle:
                "Project memory stays close, so agents write code that fits your patterns.",
              image:
                "https://images.unsplash.com/photo-1620812097331-ff636155488f?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dGV4dHVyZXN8ZW58MHx8MHx8fDA%3D",
            },
            {
              title: "Focused collaboration",
              subtitle:
                "Invite teammates into a clean workspace with shared context and traceable edits.",
              image:
                "https://images.unsplash.com/photo-1632260260864-caf7fde5ec36?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHRleHR1cmVzfGVufDB8fDB8fHww",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="overflow-hidden rounded-3xl border border-white/10 bg-[#0f1118]"
            >
              <div className="h-36 w-full overflow-hidden">
                <img
                  src={card.image}
                  alt={card.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-white">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm text-white/70">{card.subtitle}</p>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
