import { useQuery } from "convex/react";
import { WebContainer } from "@webcontainer/api";
import { useCallback, useEffect, useRef, useState } from "react";

import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { buildFileTree, getFilePath } from "../utils/file-tree";

let webcontainerInstance: WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;

async function getWebContainer(): Promise<WebContainer> {
  if (webcontainerInstance) return webcontainerInstance;

  if (!bootPromise) {
    bootPromise = WebContainer.boot({ coep: "credentialless" });
  }

  webcontainerInstance = await bootPromise;
  return webcontainerInstance;
}

function tearDownWebContainer() {
  if (webcontainerInstance) {
    webcontainerInstance.teardown();
    webcontainerInstance = null;
  }

  bootPromise = null;
}

interface UseWebcontainerProps {
  projectId: Id<"projects">;
  enabled: boolean;
  settings?: {
    installCommand?: string;
    devCommand?: string;
  };
}

type statusType = "idle" | "booting" | "installing" | "error" | "running";

export const useWebcontainer = ({
  projectId,
  enabled,
  settings,
}: UseWebcontainerProps) => {
  const [status, setStatus] = useState<statusType>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [restartKey, setRestartKey] = useState(0);
  const [terminalOutput, setTerminalOutput] = useState("");

  const containerRef = useRef<WebContainer | null>(null);
  const hasStartedRef = useRef(false);

  const files = useQuery(
    api.files.getFiles,
    projectId
      ? {
          projectId,
        }
      : "skip",
  );

  // intial boot and mount
  useEffect(() => {
    if (!enabled || !files || files.length === 0 || hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;

    const start = async () => {
      try {
        setStatus("booting");
        setError(null);
        setTerminalOutput("");

        const appendOutput = (data: string) => {
          setTerminalOutput((prev) => prev + data);
        };

        const container = await getWebContainer();
        containerRef.current = container;

        const fileTree = buildFileTree(files);
        await container.mount(fileTree);

        container.on("server-ready", (_port, url) => {
          setPreviewUrl(url);
          setStatus("running");
        });

        setStatus("installing");

        // parse install command
        const installCommand = settings?.installCommand || "npm install";
        const [installBin, ...installArgs] = installCommand.split(" ");
        appendOutput(`${installCommand}\n`);

        const installProcess = await container.spawn(installBin, installArgs);
        installProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              appendOutput(data);
            },
          }),
        );

        const installExitCode = await installProcess.exit;
        if (installExitCode !== 0) {
          throw new Error(
            `Install command failed with exit code ${installExitCode}`,
          );
        }

        // parse dev command
        const devCommand = settings?.devCommand || "npm run dev";
        const [devBin, ...devArgs] = devCommand.split(" ");
        appendOutput(`${devCommand}\n`);

        const devProcess = await container.spawn(devBin, devArgs);
        devProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              appendOutput(data);
            },
          }),
        );
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unknown error");
        setStatus("error");
      }
    };

    start();
  }, [enabled, files, settings, restartKey]);

  //sync file changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !files || status !== "running") return;

    const filesMap = new Map(files.map((f) => [f._id, f]));

    for (const file of files) {
      if (file.type !== "file" || !file.content || file.storageId) continue;

      const filePath = getFilePath({ file, filesMap });
      container.fs.writeFile(filePath, file.content);
    }
  }, [files, status]);

  // reset when disabled
  useEffect(() => {
    if (!enabled) {
      hasStartedRef.current = false;
      setStatus("idle");
      setPreviewUrl(null);
      setError(null);
    }
  }, [enabled]);

  const restart = useCallback(() => {
    tearDownWebContainer();
    containerRef.current = null;
    hasStartedRef.current = false;
    setStatus("idle");
    setPreviewUrl(null);

    setRestartKey((k) => k + 1);
  }, []);

  return {
    status,
    previewUrl,
    error,
    terminalOutput,
    restart,
  };
};
