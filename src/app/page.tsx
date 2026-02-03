import { HeroSection } from "@/components/hero";
import { Header } from "@/modules/home/components/header";

export default function Home() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      <Header />
      <HeroSection
        className="bg-[#262626] text-[#EBEBEB]"
        title="Your AI coding agent, accessible everywhere!"
        feature1={{
          title: "Zero-Setup Environments",
          description:
            "Spin up isolated sandboxes in seconds with built-in runtimes for Node, Python, Go, and more. No Docker, no config files—just pure coding.",
          image:
            "https://images.unsplash.com/photo-1612522677470-d66b46e8963b?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        }}
        feature2={{
          title: "Context-Aware AI Architect",
          description:
            "Your AI doesn't just autocomplete—it plans. Get multi-file refactoring, intelligent imports, and codebase-wide suggestions that actually make sense.",
          image:
            "https://images.unsplash.com/photo-1620812097331-ff636155488f?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dGV4dHVyZXN8ZW58MHx8MHx8fDA%3D",
        }}
        feature3={{
          title: "Live Preview + Terminal",
          description:
            "See your app run in real-time with side-by-side preview and full terminal access. Test APIs, install packages, and debug logs without leaving the tab.",
          image:
            "https://images.unsplash.com/photo-1632260260864-caf7fde5ec36?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHRleHR1cmVzfGVufDB8fDB8fHww",
        }}
        feature4={{
          title: "Instant Git Import",
          description:
            "Clone any GitHub repo and start coding immediately—or export your work with one click. Your code stays portable and yours forever.",
          image:
            "https://images.unsplash.com/photo-1558865869-c93f6f8482af?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDh8fHRleHR1cmVzfGVufDB8fDB8fHww",
        }}
      />
    </div>
  );
}
