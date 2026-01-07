// file: app/firm-finances/page.tsx

"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
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
  Save,
  Search,
  Sparkles,
  PieChart,
  BarChart3,
  Receipt,
  CreditCard,
  Banknote,
  CircleDollarSign
} from "lucide-react";

type TimePeriod = "day" | "week" | "month" | "year";

export default function FirmFinancesPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"ALL" | "REVENUE" | "EXPENSE">("ALL");
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("month");
  const [searchQuery, setSearchQuery] = useState("");
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
    if (!user) {
      router.push("/login");
      return;
    }
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [user, router]);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="p-8 min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-200 dark:border-emerald-900"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-600 animate-spin"></div>
            <DollarSign className="absolute inset-0 m-auto w-8 h-8 text-emerald-600" />
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{t.finances.loading}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t.finances.pleaseWait}</p>
        </div>
      </div>
    );
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

  const currentMetrics = calculateMetrics(timePeriod);
  const totalRevenue = transactions.filter(t => t.type === "REVENUE").reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === "EXPENSE").reduce((sum, t) => sum + t.amount, 0);

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
    if (confirm(t.finances.deleteConfirm)) {
      setTransactions(transactions.filter((t) => t.id !== id));
    }
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchesType = filterType === "ALL" || t.type === filterType;
    const matchesSearch = searchQuery === "" ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const revenueTransactions = transactions.filter((t) => t.type === "REVENUE");
  const expenseTransactions = transactions.filter((t) => t.type === "EXPENSE");

  const getPeriodLabel = (period: TimePeriod) => {
    switch (period) {
      case "day": return t.finances.today;
      case "week": return t.finances.thisWeek;
      case "month": return t.finances.thisMonth;
      case "year": return t.finances.thisYear;
    }
  };

  const getPeriodIcon = (period: TimePeriod) => {
    switch (period) {
      case "day": return <Calendar className="w-4 h-4" />;
      case "week": return <BarChart3 className="w-4 h-4" />;
      case "month": return <PieChart className="w-4 h-4" />;
      case "year": return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    if (category.toLowerCase().includes("delivery") || category.toLowerCase().includes("order")) {
      return <Receipt className="w-4 h-4" />;
    }
    if (category.toLowerCase().includes("contract") || category.toLowerCase().includes("b2b") || category.toLowerCase().includes("b2g")) {
      return <CreditCard className="w-4 h-4" />;
    }
    if (category.toLowerCase().includes("salary") || category.toLowerCase().includes("salaries")) {
      return <Banknote className="w-4 h-4" />;
    }
    return <CircleDollarSign className="w-4 h-4" />;
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <PageHeader
          title={t.finances.title}
          description={t.finances.description}
        />
        <button
          onClick={openCreateModal}
          className="group flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-6 py-3.5 rounded-2xl font-semibold shadow-xl shadow-emerald-500/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/40"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          {t.finances.addTransaction}
          <Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {/* Total Revenue */}
        <div className="group relative bg-gradient-to-br from-emerald-500 to-green-600 p-6 rounded-3xl shadow-xl shadow-emerald-500/20 hover:shadow-2xl hover:shadow-emerald-500/30 transition-all duration-300 hover:scale-[1.02] overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                <ArrowUpCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-white/80" />
                <span className="text-xs font-medium text-white/80">+12%</span>
              </div>
            </div>
            <p className="text-4xl font-black text-white mb-1">${totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-white/80 font-medium">{t.finances.totalRevenue}</p>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="group relative bg-gradient-to-br from-red-500 to-rose-600 p-6 rounded-3xl shadow-xl shadow-red-500/20 hover:shadow-2xl hover:shadow-red-500/30 transition-all duration-300 hover:scale-[1.02] overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                <ArrowDownCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-white/80" />
                <span className="text-xs font-medium text-white/80">-5%</span>
              </div>
            </div>
            <p className="text-4xl font-black text-white mb-1">${totalExpenses.toLocaleString()}</p>
            <p className="text-sm text-white/80 font-medium">{t.finances.totalExpenses}</p>
          </div>
        </div>

        {/* Net Profit */}
        <div className="group relative bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-3xl shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02] overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-white/80 bg-white/20 px-3 py-1 rounded-full">{t.finances.profit}</span>
            </div>
            <p className="text-4xl font-black text-white mb-1">${(totalRevenue - totalExpenses).toLocaleString()}</p>
            <p className="text-sm text-white/80 font-medium">{t.finances.netProfit}</p>
          </div>
        </div>

        {/* Profit Margin */}
        <div className="group relative bg-gradient-to-br from-purple-500 to-violet-600 p-6 rounded-3xl shadow-xl shadow-purple-500/20 hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 hover:scale-[1.02] overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                <PieChart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-white/80 bg-white/20 px-3 py-1 rounded-full">
                {((totalRevenue - totalExpenses) / totalRevenue * 100) > 35 ? t.finances.excellent : t.finances.good}
              </span>
            </div>
            <p className="text-4xl font-black text-white mb-1">
              {totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue * 100).toFixed(1) : 0}%
            </p>
            <p className="text-sm text-white/80 font-medium">{t.finances.profitMargin}</p>
          </div>
        </div>
      </div>

      {/* Time Period Selector & Search */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 mb-8">
        <div className="flex items-center justify-between gap-6">
          {/* Time Period Tabs */}
          <div className="flex gap-2">
            {(["day", "week", "month", "year"] as TimePeriod[]).map((period) => (
              <button
                key={period}
                onClick={() => setTimePeriod(period)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                  timePeriod === period
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {getPeriodIcon(period)}
                {getPeriodLabel(period)}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.finances.searchPlaceholder}
              className="w-72 pl-12 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Period Performance Cards */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-600" />
          {getPeriodLabel(timePeriod)} {t.finances.performance}
        </h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-5 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <ArrowUpCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.finances.revenue}</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ${currentMetrics.revenue.toLocaleString()}
            </p>
          </div>

          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-5 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
                <ArrowDownCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.finances.expenses}</span>
            </div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              ${currentMetrics.expenses.toLocaleString()}
            </p>
          </div>

          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-5 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.finances.profit}</span>
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ${currentMetrics.profit.toLocaleString()}
            </p>
          </div>

          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-5 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <PieChart className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t.finances.margin}</span>
            </div>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {currentMetrics.margin.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600" />
            {t.finances.allTransactions}
          </h2>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType("ALL")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                filterType === "ALL"
                  ? "bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 text-white dark:text-gray-900 shadow-lg"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {t.finances.all} ({transactions.length})
            </button>
            <button
              onClick={() => setFilterType("REVENUE")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                filterType === "REVENUE"
                  ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/30"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              <ArrowUpCircle className="w-4 h-4" />
              {t.finances.revenue} ({revenueTransactions.length})
            </button>
            <button
              onClick={() => setFilterType("EXPENSE")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                filterType === "EXPENSE"
                  ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/30"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              <ArrowDownCircle className="w-4 h-4" />
              {t.finances.expenses} ({expenseTransactions.length})
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100/80 dark:from-gray-700/80 dark:to-gray-800/80 border-b border-gray-200/50 dark:border-gray-600/50">
                <tr>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    {t.finances.date}
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    {t.finances.type}
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    {t.finances.category}
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    {t.finances.descriptionLabel}
                  </th>
                  <th className="px-6 py-5 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    {t.finances.amount}
                  </th>
                  <th className="px-6 py-5 text-right text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    {t.finances.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-4">
                          <Receipt className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t.finances.noTransactions}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t.finances.tryAdjustingFilters}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction, index) => (
                    <tr
                      key={transaction.id}
                      className={`group transition-all duration-300 ${
                        transaction.type === "REVENUE"
                          ? "hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-green-50/50 dark:hover:from-emerald-900/10 dark:hover:to-green-900/10"
                          : "hover:bg-gradient-to-r hover:from-red-50/50 hover:to-rose-50/50 dark:hover:from-red-900/10 dark:hover:to-rose-900/10"
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {new Date(transaction.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(transaction.date).getFullYear()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {transaction.type === "REVENUE" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/30">
                            <ArrowUpCircle className="w-3.5 h-3.5" />
                            {t.finances.revenue}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/30">
                            <ArrowDownCircle className="w-3.5 h-3.5" />
                            {t.finances.expense}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            transaction.type === "REVENUE"
                              ? "bg-emerald-100 dark:bg-emerald-900/30"
                              : "bg-red-100 dark:bg-red-900/30"
                          }`}>
                            {getCategoryIcon(transaction.category)}
                          </div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {transaction.category}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                          {transaction.description}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span
                          className={`text-xl font-bold ${
                            transaction.type === "REVENUE"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {transaction.type === "REVENUE" ? "+" : "-"}${transaction.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={() => openEditModal(transaction)}
                            className="p-2.5 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded-xl transition-all hover:scale-110"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </button>
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className="p-2.5 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/50 rounded-xl transition-all hover:scale-110"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {filteredTransactions.length > 0 && (
            <div className="px-6 py-4 bg-gray-50/80 dark:bg-gray-700/30 border-t border-gray-200/50 dark:border-gray-600/50">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t.finances.showing} <span className="font-semibold text-gray-900 dark:text-white">{filteredTransactions.length}</span> {t.finances.of}{" "}
                <span className="font-semibold text-gray-900 dark:text-white">{transactions.length}</span> {t.finances.transactions}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTransaction ? t.finances.editTransaction : t.finances.addNewTransaction}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t.finances.transactionType}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "REVENUE" })}
                className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 font-semibold transition-all ${
                  formData.type === "REVENUE"
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                    : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-emerald-300"
                }`}
              >
                <ArrowUpCircle className="w-5 h-5" />
                {t.finances.revenue}
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "EXPENSE" })}
                className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 font-semibold transition-all ${
                  formData.type === "EXPENSE"
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                    : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-red-300"
                }`}
              >
                <ArrowDownCircle className="w-5 h-5" />
                {t.finances.expense}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t.finances.category}
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder={t.finances.categoryPlaceholder}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t.finances.amountLabel}
            </label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t.finances.descriptionLabel}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t.finances.descriptionPlaceholder}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              rows={3}
              required
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-6 py-3.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              {t.finances.cancel}
            </button>
            <button
              type="submit"
              className={`flex-1 flex items-center justify-center gap-2 text-white px-6 py-3.5 rounded-xl font-semibold shadow-lg transition-all hover:scale-[1.02] ${
                formData.type === "REVENUE"
                  ? "bg-gradient-to-r from-emerald-600 to-green-600 shadow-emerald-500/30"
                  : "bg-gradient-to-r from-red-600 to-rose-600 shadow-red-500/30"
              }`}
            >
              <Save className="w-5 h-5" />
              {editingTransaction ? t.finances.update : t.finances.create}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
