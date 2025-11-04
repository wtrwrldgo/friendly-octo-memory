// file: components/StatusBadge.tsx

type Status = "ACTIVE" | "SUSPENDED" | "ONLINE" | "OFFLINE" | "DELIVERING" | "PENDING" | "ASSIGNED" | "ON_THE_WAY" | "DELIVERED" | "CANCELLED";

interface StatusBadgeProps {
  status: Status;
}

const statusStyles: Record<Status, { bg: string; text: string; dot: string }> = {
  ACTIVE: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  SUSPENDED: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  ONLINE: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  OFFLINE: { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-400" },
  DELIVERING: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  PENDING: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  ASSIGNED: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  ON_THE_WAY: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
  DELIVERED: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  CANCELLED: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles = statusStyles[status];

  return (
    <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold ${styles.bg} ${styles.text} border border-current/10`}>
      <span className={`w-2 h-2 rounded-full ${styles.dot} animate-pulse`} />
      {status}
    </span>
  );
}
