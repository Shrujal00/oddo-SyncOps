export interface DashboardMetric {
  label: string;
  value: number;
  trend?: "up" | "down" | "flat";
}
