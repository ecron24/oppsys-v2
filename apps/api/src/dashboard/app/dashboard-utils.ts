// Utility functions for dashboard stats, period calculation, and chart generation

export function getDaysInPeriod(period: string): number {
  switch (period) {
    case "day":
      return 1;
    case "week":
      return 7;
    case "month":
      return 30;
    case "year":
      return 365;
    default:
      return 30;
  }
}

export function generateDailyUsageChart(
  usageData: { usedAt: string | null }[],
  period: string
) {
  const days = getDaysInPeriod(period);
  const chart = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const dayUsage = usageData.filter((usage) =>
      usage.usedAt?.startsWith(dateStr)
    ).length;
    chart.push({ date: dateStr, usage: dayUsage });
  }
  return chart;
}

export function generateDailyCreditChart(
  creditData: { usedAt: string; creditsUsed: number }[],
  period: string
) {
  const days = getDaysInPeriod(period);
  const chart = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const dayCredits = creditData
      .filter((usage) => usage.usedAt.startsWith(dateStr))
      .reduce((sum, usage) => sum + usage.creditsUsed, 0);
    chart.push({ date: dateStr, credits: dayCredits });
  }
  return chart;
}
