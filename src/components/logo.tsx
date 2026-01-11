import Image from "next/image";

export function Logo({
  height = 24,
  width = 24,
  isDarkMode,
}: {
  height?: number;
  width?: number;
  isDarkMode?: boolean;
}) {
  return (
    <Image
      src={isDarkMode ? "/logo-white.svg" : "/logo.svg"}
      alt="Logo"
      width={width}
      height={height}
    />
  );
}
