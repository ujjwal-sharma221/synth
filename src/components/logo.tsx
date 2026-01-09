import Image from "next/image";

export function Logo({
  height = 24,
  width = 24,
}: {
  height?: number;
  width?: number;
}) {
  return <Image src="/logo.svg" alt="Logo" width={width} height={height} />;
}
