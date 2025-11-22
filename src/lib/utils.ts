// src/lib/utils.ts

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Объединяет tailwind-классы без конфликтов.
 * Используется всеми компонентами из папки ui (tabs, button, input и т.д.)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
