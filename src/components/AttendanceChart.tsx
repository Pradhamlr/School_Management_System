import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface AttendanceChartProps {
  title: string;
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  size?: "sm" | "lg";
}

export function AttendanceChart({ title, data, size = "sm" }: AttendanceChartProps) {
  const chartSize = size === "sm" ? 120 : 180;
  
  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      <div className="flex items-center justify-center">
        <div className="relative">
          <ResponsiveContainer width={chartSize} height={chartSize}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={size === "sm" ? 35 : 55}
                outerRadius={size === "sm" ? 50 : 75}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {data.reduce((acc, item) => acc + item.value, 0)}%
              </p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground">{item.name}</span>
            </div>
            <span className="font-medium text-foreground">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}