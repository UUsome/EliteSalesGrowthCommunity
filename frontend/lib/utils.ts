import { clsx, type ClassValue } from "clsx";

/** Merge class names with Tailwind support */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Format price to display string */
export function formatPrice(price: number): string {
  return `¥${price.toFixed(0)}`;
}

/** Format salary range */
export function formatSalary(min?: number | null, max?: number | null): string {
  if (min && max) return `${min / 1000}K-${max / 1000}K`;
  if (min) return `${min / 1000}K起`;
  if (max) return `最高${max / 1000}K`;
  return "薪资面议";
}

/** Format date to relative time */
export function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "刚刚";
  if (diffMin < 60) return `${diffMin}分钟前`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}小时前`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay}天前`;
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth}个月前`;
  return `${Math.floor(diffMonth / 12)}年前`;
}

/** Truncate text with ellipsis */
export function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + "...";
}

/** Rating stars display */
export function renderStars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
}
