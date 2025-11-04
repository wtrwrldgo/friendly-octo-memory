// file: app/firm-finances/page.tsx

"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import { Transaction } from "@/types";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  Wallet,
  Plus,
  Edit,
  Trash2,
  Save
} from "lucide-react";

type TimePeriod = "day" | "week" | "month" | "year";

export default function FirmFinancesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [filterType, setFilterType] = useState<"ALL" | "REVENUE" | "EXPENSE">("ALL");
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("month");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState({
    type: "REVENUE" as "REVENUE" | "EXPENSE",
    category: "",
    amount: "",
    description: "",
  });

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "txn-001",
      firmId: "1",
      type: "REVENUE",
      category: "Delivery Orders",
      amount: 15000,
      description: "150 water deliveries - Tashkent region",
      date: new Date().toISOString(),
      orderId: "ord-001",
    },
    {
      id: "txn-002",
      firmId: "1",
      type: "REVENUE",
      category: "B2B Contract",
      amount: 20000,
      description: "Tech Solutions LLC - Monthly contract",
      date: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "txn-003",
      firmId: "1",
      type: "EXPENSE",
      category: "Fuel & Maintenance",
      amount: 3500,
      description: "Vehicle fuel and maintenance - All drivers",
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: "txn-004",
      firmId: "1",
      type: "EXPENSE",
      category: "Salaries",
      amount: 12000,
      description: "Staff salaries - October 2024",
      date: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: "txn-005",
      firmId: "1",
      type: "REVENUE",
      category: "B2G Contract",
      amount: 10000,
      description: "Tashkent City Hall - Government contract",
      date: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
      id: "txn-006",
      firmId: "1",
      type: "EXPENSE",
      category: "Water Supply",
      amount: 8000,
      description: "Wholesale water purchase - 5000 bottles",
      date: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: "txn-007",
      firmId: "1",
      type: "EXPENSE",
      category: "Rent & Utilities",
      amount: 4500,
      description: "Office and warehouse rent - Monthly",
      date: new Date(Date.now() - 86400000 * 6).toISOString(),
    },
    {
      id: "txn-008",
      firmId: "1",
      type: "REVENUE",
      category: "Delivery Orders",
      amount: 12500,
      description: "125 water deliveries - Samarkand region",
      date: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
    {
      id: "txn-009",
      firmId: "1",
      type: "EXPENSE",
      category: "Marketing",
      amount: 2800,
      description: "Social media advertising campaign",
      date: new Date(Date.now() - 86400000 * 8).toISOString(),
    },
    {
      id: "txn-010",
      firmId: "1",
      type: "REVENUE",
      category: "Delivery Orders",
      amount: 10000,
      description: "100 water deliveries - Bukhara region",
      date: new Date(Date.now() - 86400000 * 9).toISOString(),
    },
    {
      id: "txn-011",
      firmId: "1",
      type: "EXPENSE",
      category: "Equipment",
      amount: 2000,
      description: "New delivery equipment and bottles",
      date: new Date(Date.now() - 86400000 * 10).toISOString(),
    },
  ]);

  useEffect(() => {
    if (user?.type === "admin") {
      router.push("/");
    }
  }, [user, router]);

  if (user?.type !== "firm") {
    return null;
  }

  // Calculate time-based metrics
  const getTimeFilteredTransactions = (period: TimePeriod) => {
    const now = new Date();
    const startOfPeriod = new Date();

    switch (period) {
      case "day":
        startOfPeriod.setHours(0, 0, 0, 0);
        break;
      case "week":
        startOfPeriod.setDate(now.getDate() - 7);
        break;
      case "month":
        startOfPeriod.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startOfPeriod.setFullYear(now.getFullYear() - 1);
        break;
    }

    return transactions.filter((t) => new Date(t.date) >= startOfPeriod);
  };

  const calculateMetrics = (period: TimePeriod) => {
    const filtered = getTimeFilteredTransactions(period);
    const revenue = filtered
      .filter((t) => t.type === "REVENUE")
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = filtered
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);
    const profit = revenue - expenses;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return { revenue, expenses, profit, margin };
  };

  const dayMetrics = calculateMetrics("day");
  const weekMetrics = calculateMetrics("week");
  const monthMetrics = calculateMetrics("month");
  const yearMetrics = calculateMetrics("year");

  const currentMetrics = calculateMetrics(timePeriod);

  const openCreateModal = () => {
    setEditingTransaction(null);
    setFormData({
      type: "REVENUE",
      category: "",
      amount: "",
      description: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount.toString(),
      description: transaction.description,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingTransaction) {
      // Update
      setTransactions(
        transactions.map((t) =>
          t.id === editingTransaction.id
            ? {
                ...t,
                type: formData.type,
                category: formData.category,
                amount: parseFloat(formData.amount),
                description: formData.description,
              }
            : t
        )
      );
    } else {
      // Create
      const newTransaction: Transaction = {
        id: `txn-${Date.now()}`,
        firmId: "1",
        type: formData.type,
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: new Date().toISOString(),
      };
      setTransactions([newTransaction, ...transactions]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      setTransactions(transactions.filter((t) => t.id !== id));
    }
  };

  const filteredTransactions =
    filterType === "ALL"
      ? transactions
      : transactions.filter((t) => t.type === filterType);

  const revenueTransactions = transactions.filter((t) => t.type === "REVENUE");
  const expenseTransactions = transactions.filter((t) => t.type === "EXPENSE");

  const getPeriodLabel = (period: TimePeriod) => {
    switch (period) {
      case "day":
        return "Today";
      case "week":
        return "This Week";
      case "month":
        return "This Month";
      case "year":
        return "This Year";
    }
  };

  return (
    <div className="p-8 min-h-screen dark:bg-gray-900">
      <div className="flex items-center justify-between mb-8">
        <PageHeader
          title="Financial Management"
          description="Track revenue, expenses, and profitability"
        />
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Transaction
        </button>
      </div>

      {/* Time Period Selector */}
      <div className="flex gap-3 mb-8">
        {(["day", "week", "month", "year"] as TimePeriod[]).map((period) => (
          <button
            key={period}
            onClick={() => setTimePeriod(period)}
            className={`px-6 py-3 rounded-2xl font-semibold transition-all ${
              timePeriod === period
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:shadow-md"
            }`}
          >
            {getPeriodLabel(period)}
          </button>
        ))}
      </div>

      {/* Profit Summary Cards by Time Period */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {/* Today */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Today</h3>
            <Calendar className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">Revenue</span>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                ${dayMetrics.revenue.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">Expenses</span>
              <span className="text-sm font-bold text-red-600 dark:text-red-400">
                ${dayMetrics.expenses.toLocaleString()}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Profit</span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  ${dayMetrics.profit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* This Week */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">This Week</h3>
            <Calendar className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">Revenue</span>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                ${weekMetrics.revenue.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">Expenses</span>
              <span className="text-sm font-bold text-red-600 dark:text-red-400">
                ${weekMetrics.expenses.toLocaleString()}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Profit</span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  ${weekMetrics.profit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* This Month */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">This Month</h3>
            <Calendar className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">Revenue</span>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                ${monthMetrics.revenue.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">Expenses</span>
              <span className="text-sm font-bold text-red-600 dark:text-red-400">
                ${monthMetrics.expenses.toLocaleString()}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Profit</span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  ${monthMetrics.profit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* This Year */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">This Year</h3>
            <Calendar className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">Revenue</span>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                ${yearMetrics.revenue.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">Expenses</span>
              <span className="text-sm font-bold text-red-600 dark:text-red-400">
                ${yearMetrics.expenses.toLocaleString()}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Profit</span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  ${yearMetrics.profit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Period Performance */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-navy-900 dark:text-white mb-6">
          {getPeriodLabel(timePeriod)} Performance
        </h2>
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <ArrowUpCircle className="w-6 h-6" />
              </div>
              <TrendingUp className="w-5 h-5 opacity-80" />
            </div>
            <p className="text-sm opacity-90 mb-1">Revenue</p>
            <p className="text-3xl font-bold">${currentMetrics.revenue.toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-3xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <ArrowDownCircle className="w-6 h-6" />
              </div>
              <TrendingDown className="w-5 h-5 opacity-80" />
            </div>
            <p className="text-sm opacity-90 mb-1">Expenses</p>
            <p className="text-3xl font-bold">${currentMetrics.expenses.toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
              <DollarSign className="w-5 h-5 opacity-80" />
            </div>
            <p className="text-sm opacity-90 mb-1">Net Profit</p>
            <p className="text-3xl font-bold">${currentMetrics.profit.toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-3xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">
                {currentMetrics.margin > 35 ? "Excellent" : currentMetrics.margin > 20 ? "Good" : "Fair"}
              </span>
            </div>
            <p className="text-sm opacity-90 mb-1">Profit Margin</p>
            <p className="text-3xl font-bold">{currentMetrics.margin.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-navy-900 dark:text-white">All Transactions</h2>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType("ALL")}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                filterType === "ALL"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
              }`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => setFilterType("REVENUE")}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                filterType === "REVENUE"
                  ? "bg-green-600 text-white shadow-lg"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
              }`}
            >
              Revenue ({revenueTransactions.length})
            </button>
            <button
              onClick={() => setFilterType("EXPENSE")}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                filterType === "EXPENSE"
                  ? "bg-red-600 text-white shadow-lg"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
              }`}
            >
              Expenses ({expenseTransactions.length})
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-card overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-700 dark:to-gray-800/50 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        {new Date(transaction.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {transaction.type === "REVENUE" ? (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                            <ArrowUpCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            Revenue
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                            <ArrowDownCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </div>
                          <span className="font-semibold text-red-600 dark:text-red-400">
                            Expense
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {transaction.category}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {transaction.description}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span
                        className={`text-xl font-bold ${
                          transaction.type === "REVENUE"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {transaction.type === "REVENUE" ? "+" : "-"}$
                        {transaction.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(transaction)}
                          className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTransaction ? "Edit Transaction" : "Add New Transaction"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Transaction Type
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as "REVENUE" | "EXPENSE" })
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="REVENUE">Revenue</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., Delivery Orders, Salaries, Marketing"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add details about this transaction..."
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              required
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              <Save className="w-5 h-5" />
              {editingTransaction ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
