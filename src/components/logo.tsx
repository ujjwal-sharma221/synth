import Image from "next/image";

export function Logo({
  height = 24,
  width = 24,
  isDarkMode,
  className,
}: {
  height?: number;
  width?: number;
  isDarkMode?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={isDarkMode ? "/logo-white.svg" : "/logo.svg"}
      alt="Logo"
      width={width}
      height={height}
      className={className}
    />
  );
}
