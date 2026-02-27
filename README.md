# Synth

A minimal, web-based code editor for building with AI. Synth pairs an in-browser coding workspace with an AI agent that can read, create, edit, and manage project files through natural conversation.

## Features

- **AI Coding Agent** — Chat with an AI assistant that has full access to your project files. It can create, update, rename, and delete files based on your instructions.
- **In-Browser Preview** — Projects run live inside a [WebContainer](https://webcontainers.io/), with a built-in terminal and instant preview — no local setup required.
- **Code Editor** — CodeMirror-based editor with syntax highlighting for JavaScript, TypeScript, HTML, CSS, JSON, Python, and Markdown. Includes minimap, AI-powered inline suggestions, and quick edit.
- **GitHub Integration** — Import existing repositories and export projects back to GitHub as new repos.
- **Project Management** — Create, organize, and switch between multiple projects. Each project has its own file tree, conversations, and settings.
- **Authentication** — GitHub OAuth sign-in via better-auth.

## Tech Stack

- **Framework** — [Next.js 16](https://nextjs.org/) (App Router, React Compiler)
- **Language** — TypeScript
- **Database & Backend** — [Convex](https://convex.dev/)
- **Background Jobs & AI Orchestration** — [Inngest](https://inngest.com/) + [Inngest Agent Kit](https://agentkit.inngest.com/)
- **AI Models** — Groq, Google AI, Cerebras (via [Vercel AI SDK](https://sdk.vercel.ai/))
- **In-Browser Runtime** — [WebContainer API](https://webcontainers.io/)
- **Editor** — [CodeMirror 6](https://codemirror.net/)
- **UI** — [Tailwind CSS 4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Radix UI](https://radix-ui.com/), [Motion](https://motion.dev/)
- **Auth** — [better-auth](https://better-auth.com/) with Convex adapter
- **Package Manager** — pnpm

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- A [Convex](https://convex.dev/) account
- API keys for Groq, Google AI, and/or Cerebras
- A [GitHub OAuth App](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app) for authentication
- (Optional) [Firecrawl](https://firecrawl.dev/) API key

### Installation

```bash
git clone <your-repo-url>
cd synth
pnpm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Convex
CONVEX_DEPLOYMENT=<your-convex-deployment>
NEXT_PUBLIC_CONVEX_URL=<your-convex-url>
NEXT_PUBLIC_CONVEX_SITE_URL=<your-convex-site-url>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
CONVEX_INTERNAL_KEY=<your-convex-internal-key>

# AI Providers
GOOGLE_API_KEY=<your-google-api-key>
CEREBRAS_API_KEY=<your-cerebras-api-key>
GROQ_API_KEY=<your-groq-api-key>

# Firecrawl (optional)
FIRECRAWL_API_KEY=<your-firecrawl-api-key>

# GitHub OAuth
GITHUB_CLIENT_ID=<your-github-client-id>
GITHUB_CLIENT_SECRET=<your-github-client-secret>
```

### Running Locally

Start all services (Next.js dev server, Convex, and Inngest) concurrently:

```bash
pnpm dev:all
```

Or run them individually:

```bash
# Next.js
pnpm dev

# Convex (in a separate terminal)
pnpx convex dev

# Inngest (in a separate terminal)
pnpm dlx inngest-cli@latest dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/                # API routes (messages, auth, GitHub, suggestions, quick-edit)
│   ├── (auth)/             # Sign-in / Sign-up pages
│   └── (projects)/         # Project dashboard and individual project views
├── components/             # Shared components (UI primitives, AI elements)
├── inngest/                # Inngest client setup
├── lib/                    # Utilities (auth, Convex client, Firecrawl)
├── modules/
│   ├── auth/               # Authentication screens and forms
│   ├── conversations/      # AI chat — message processing, agent tools, UI
│   ├── editor/             # CodeMirror editor — extensions, themes, suggestions
│   ├── preview/            # WebContainer preview, terminal output
│   └── projects/           # Project CRUD, file explorer, GitHub import/export
└── providers/              # React context providers (theme, Convex)

convex/
├── schema.ts               # Database schema (projects, files, conversations, messages)
├── projects.ts             # Project queries and mutations
├── conversations.ts        # Conversation queries and mutations
├── files.ts                # File queries and mutations
├── auth.ts                 # Auth helpers
└── http.ts                 # HTTP endpoints
```

## Scripts

| Command        | Description                                     |
| -------------- | ----------------------------------------------- |
| `pnpm dev`     | Start Next.js dev server                        |
| `pnpm dev:all` | Start Next.js, Convex, and Inngest concurrently |
| `pnpm build`   | Production build                                |
| `pnpm start`   | Start production server                         |
| `pnpm lint`    | Run ESLint                                      |

## License

Private.
