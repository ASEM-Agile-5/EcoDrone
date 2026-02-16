import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  bgColor?: string;
}

export function StatCard({ title, value, icon: Icon, trend, bgColor = "bg-white" }: StatCardProps) {
  return (
    <div className={`${bgColor} rounded-xl p-6 shadow-sm border border-gray-100`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl mt-2">{value}</p>
          {trend && (
            <div className="mt-2">
              <span className={`text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.value}
              </span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 bg-[#8A1538]/10 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-[#8A1538]" />
        </div>
      </div>
    </div>
  );
}
