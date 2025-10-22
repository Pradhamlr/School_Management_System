export function timeAgo(iso: string | number | Date | undefined) {
  if (!iso) return '';
  const date = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  // within 7 days
  if (diff < 7 * 86400) return date.toLocaleDateString(undefined, { weekday: 'short' });
  // else show short date
  return date.toLocaleDateString();
}
