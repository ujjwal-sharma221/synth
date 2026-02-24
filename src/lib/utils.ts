import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator,
} from "unique-names-generator";
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateUniqueName() {
  const name = uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    separator: "-",
    length: 3,
    style: "lowerCase",
  });

  return name;
}

export function parseGithubUrl(url: string) {
  const match = url.match(/^https:\/\/github\.com\/([^\/]+)\/([^\/]+)(\/.*)?$/);
  if (!match) throw new Error("Invalid github url");

  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}
