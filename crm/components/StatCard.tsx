// file: components/StatCard.tsx

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color?: "blue" | "green" | "purple" | "orange";
}

const colorClasses = {
  blue: "from-blue-500 to-blue-600",
  green: "from-emerald-500 to-green-600",
  purple: "from-purple-500 to-purple-600",
  orange: "from-orange-500 to-orange-600",
};

export default function StatCard({ title, value, icon, trend, color = "blue" }: StatCardProps) {
  return (
    <div className="group bg-white dark:bg-gray-800 rounded-3xl shadow-card hover:shadow-soft transition-all duration-300 p-6 border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-4xl font-bold text-navy-900 dark:text-white tracking-tight">{value}</p>
        </div>
        <div className={`bg-gradient-to-br ${colorClasses[color]} p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <div className="text-white">
            {icon}
          </div>
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 pt-3 border-t border-gray-100 dark:border-gray-700">
          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{trend}</span>
        </div>
      )}
    </div>
  );
}
