// file: components/PerformanceIndicator.tsx

"use client";

interface PerformanceIndicatorProps {
  percentage: number;
  title: string;
  color?: "green" | "orange" | "red" | "blue";
}

const colorClasses = {
  green: {
    stroke: "#10B981",
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-600 dark:text-green-400",
  },
  orange: {
    stroke: "#F59E0B",
    bg: "bg-orange-50 dark:bg-orange-900/20",
    text: "text-orange-600 dark:text-orange-400",
  },
  red: {
    stroke: "#EF4444",
    bg: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-600 dark:text-red-400",
  },
  blue: {
    stroke: "#3B82F6",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-600 dark:text-blue-400",
  },
};

export default function PerformanceIndicator({
  percentage,
  title,
  color = "green",
}: PerformanceIndicatorProps) {
  const size = 120;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-3">
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="none"
            className="dark:stroke-gray-700"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colorClasses[color].stroke}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-2xl font-bold ${colorClasses[color].text}`}>
            {percentage}%
          </span>
        </div>
      </div>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
        {title}
      </p>
    </div>
  );
}
