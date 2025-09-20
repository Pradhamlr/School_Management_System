import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export function MetricCard({ title, value, icon: Icon, color, trend }: MetricCardProps) {
  return (
    <div className="metric-card group">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: color }}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {trend && (
              <p className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-500'}`}>
                {trend.isPositive ? '+' : ''}{trend.value}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}