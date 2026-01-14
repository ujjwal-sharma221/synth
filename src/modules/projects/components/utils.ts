import { BASE_PADDING, LEVEL_PADDING } from "@/lib/constants";

export function getItemPadding({
  level,
  isFile,
}: {
  level: number;
  isFile: boolean;
}) {
  const fileOffset = isFile ? 16 : 0;

  return BASE_PADDING + LEVEL_PADDING * level + fileOffset;
}
