// lib/utils.ts

export function cn(
  ...classes: Array<string | number | false | null | undefined>
): string {
  return classes
    .filter((value) => typeof value === "string" || typeof value === "number")
    .join(" ");
}
