export function timeAgo(isoDate: string): string {
  const now = new Date();
  const then = new Date(isoDate);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  const days = Math.floor(seconds / 86400);
  if (days > 0) return `${days} дн. назад`;

  const hours = Math.floor(seconds / 3600);
  if (hours > 0) return `${hours} ч. назад`;

  const minutes = Math.floor(seconds / 60);
  if (minutes > 0) return `${minutes} мин назад`;

  return 'только что';
}
