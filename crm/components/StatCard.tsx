// file: components/StatCard.tsx

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color?: "blue" | "green" | "purple" | "orange" | "cyan" | "pink";
}

const colorConfig = {
  blue: {
    gradient: "from-blue-500 to-blue-600",
    glow: "shadow-blue-500/30",
    border: "border-blue-500/20",
    iconBg: "bg-blue-500/10",
    text: "text-blue-400",
    ring: "ring-blue-500/20",
  },
  green: {
    gradient: "from-emerald-500 to-emerald-600",
    glow: "shadow-emerald-500/30",
    border: "border-emerald-500/20",
    iconBg: "bg-emerald-500/10",
    text: "text-emerald-400",
    ring: "ring-emerald-500/20",
  },
  purple: {
    gradient: "from-violet-500 to-purple-600",
    glow: "shadow-violet-500/30",
    border: "border-violet-500/20",
    iconBg: "bg-violet-500/10",
    text: "text-violet-400",
    ring: "ring-violet-500/20",
  },
  orange: {
    gradient: "from-orange-500 to-amber-500",
    glow: "shadow-orange-500/30",
    border: "border-orange-500/20",
    iconBg: "bg-orange-500/10",
    text: "text-orange-400",
    ring: "ring-orange-500/20",
  },
  cyan: {
    gradient: "from-cyan-400 to-teal-500",
    glow: "shadow-cyan-500/30",
    border: "border-cyan-500/20",
    iconBg: "bg-cyan-500/10",
    text: "text-cyan-400",
    ring: "ring-cyan-500/20",
  },
  pink: {
    gradient: "from-pink-500 to-rose-500",
    glow: "shadow-pink-500/30",
    border: "border-pink-500/20",
    iconBg: "bg-pink-500/10",
    text: "text-pink-400",
    ring: "ring-pink-500/20",
  },
};

export default function StatCard({ title, value, icon, trend, color = "blue" }: StatCardProps) {
  const config = colorConfig[color];

  return (
    <div className="group relative">
      {/* Glow effect on hover */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${config.gradient} rounded-2xl blur opacity-0 group-hover:opacity-30 transition-all duration-500`} />

      {/* Card */}
      <div className={`relative bg-[#0d1117] border ${config.border} rounded-2xl p-6 hover:border-opacity-50 transition-all duration-300 ring-1 ${config.ring}`}>
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent rounded-2xl" />

        <div className="relative flex items-start justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
            <p className="text-4xl font-bold text-white tracking-tight">{value}</p>
            {trend && (
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${config.text}`}>{trend}</span>
                <span className="text-xs text-gray-600">vs last month</span>
              </div>
            )}
          </div>

          {/* Icon container with glow */}
          <div className={`relative ${config.iconBg} p-4 rounded-xl group-hover:shadow-lg ${config.glow} transition-all duration-300`}>
            <div className={`${config.text}`}>
              {icon}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
