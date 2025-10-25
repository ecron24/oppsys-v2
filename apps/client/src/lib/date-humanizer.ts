export const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return "À l'instant";
  if (diffInMinutes < 60)
    return `il y a ${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""}`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24)
    return `il y a ${diffInHours} heure${diffInHours > 1 ? "s" : ""}`;
  const diffInDays = Math.floor(diffInMinutes / 1440);
  return `il y a ${diffInDays} jour${diffInDays > 1 ? "s" : ""}`;
};
