import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Plus,
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  Trash2,
  TrendingUp,
  Receipt,
  Calendar,
  Layers,
  PieChart as ChartIcon,
  Target,
  LayoutDashboard,
  Scale,
  CalendarRange,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchTransactions,
  fetchSummary,
  createTransaction,
  deleteTransaction,
  fetchSavingsGoals,
  createSavingsGoal,
  depositToSavingsGoal,
  deleteSavingsGoal,
} from "./api/transactions";
import { fetchCurrentUser, logoutUser } from "./api/auth";
import { AuthScreen } from "./components/AuthScreen";
import { AnimatedCounter } from "./components/AnimatedCounter";
import { CategoryChart } from "./components/CategoryChart";
import { AddTransactionModal } from "./components/AddTransactionModal";
import { TransactionFilters } from "./components/TransactionFilters";
import { FinancialInsightBanner } from "./components/FinancialInsightBanner";
import { ExecutiveReportModal } from "./components/ExecutiveReportModal";
import { AppLoadingScreen } from "./components/AppLoadingScreen";
import { SavingsGoalsSection } from "./components/SavingsGoalsSection";
import { AddGoalModal } from "./components/AddGoalModal";
import { DepositGoalModal } from "./components/DepositGoalModal";
import { RecapitulationSection } from "./components/RecapitulationSection";
import { Button } from "./components/ui/Button";
import { Badge } from "./components/ui/Badge";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [summary, setSummary] = useState({
    total_balance: 0,
    total_income: 0,
    total_expense: 0,
    savings_rate: 0,
    transaction_count: 0,
    category_breakdown: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [depositGoalTarget, setDepositGoalTarget] = useState(null);

  // Filter States
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("Semua");

  // Navigation Tab State: "dashboard" | "recap"
  const [activeTab, setActiveTab] = useState("dashboard");

  // Inisialisasi Sesi Pengguna saat Aplikasi Dimuat
  useEffect(() => {
    async function initAuth() {
      try {
        const user = await fetchCurrentUser();
        setCurrentUser(user);
      } catch {
        setCurrentUser(null);
      } finally {
        setIsAuthChecking(false);
      }
    }
    initAuth();
  }, []);

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      setError(null);
      const [txData, sumData, goalsData] = await Promise.all([
        fetchTransactions({
          search: search.trim() || undefined,
          type: typeFilter !== "all" ? typeFilter : undefined,
          category: categoryFilter !== "Semua" ? categoryFilter : undefined,
        }),
        fetchSummary(),
        fetchSavingsGoals(),
      ]);
      setTransactions(txData);
      setSummary(sumData);
      setSavingsGoals(goalsData);
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes("autentikasi")) {
        setCurrentUser(null);
      } else {
        setError(err.message || "Koneksi ke backend server gagal.");
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser, search, typeFilter, categoryFilter]);

  useEffect(() => {
    if (!currentUser) return;
    const timer = setTimeout(() => {
      loadData();
    }, 200);
    return () => clearTimeout(timer);
  }, [currentUser, loadData]);

  // Handler Autentikasi Keluar
  const handleLogout = async () => {
    if (window.confirm("Apakah Anda yakin ingin keluar dari akun Finora?")) {
      await logoutUser();
      setCurrentUser(null);
      setTransactions([]);
      setSavingsGoals([]);
    }
  };

  // Handler Transaksi
  const handleCreateTransaction = async (payload) => {
    await createTransaction(payload);
    await loadData();
  };

  const handleDeleteTransaction = async (id, title) => {
    if (!window.confirm(`Hapus catatan transaksi "${title}"?`)) return;
    try {
      await deleteTransaction(id);
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Handler Target Tabungan
  const handleCreateGoal = async (payload) => {
    await createSavingsGoal(payload);
    await loadData();
  };

  const handleDepositGoal = async (goalId, amount, deductFromBalance) => {
    await depositToSavingsGoal(goalId, amount, deductFromBalance);
    await loadData();
  };

  const handleDeleteGoal = async (id, title) => {
    if (!window.confirm(`Hapus target tabungan "${title}"?`)) return;
    try {
      await deleteSavingsGoal(id);
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Kategori unik untuk dropdown filter
  const uniqueCategories = useMemo(() => {
    const list = summary.category_breakdown.map((c) => c.category);
    if (!list.includes("Gaji")) list.push("Gaji");
    if (!list.includes("Kebutuhan")) list.push("Kebutuhan");
    if (!list.includes("Tagihan")) list.push("Tagihan");
    if (!list.includes("Investasi")) list.push("Investasi");
    return Array.from(new Set(list));
  }, [summary.category_breakdown]);

  if (!isAuthChecking && !currentUser) {
    return <AuthScreen onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <>
      {/* 1. Ultra-Smooth Hardware-Accelerated Pre-loader */}
      <AnimatePresence>
        {isInitialLoading && (
          <AppLoadingScreen
            onFinished={() => setIsInitialLoading(false)}
            duration={750}
          />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-slate-900 selection:text-white pb-16">
        {/* 2. Header Swiss-Minimalism dengan Brand Finora */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
          <div className="max-w-6xl mx-auto px-3.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Geometric Brand Logo Mark (grid 24x24) */}
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs sm:text-sm tracking-wider shadow-xs select-none shrink-0">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-white sm:w-[22px] sm:h-[22px]"
                >
                  <rect x="3" y="3" width="7" height="18" rx="2" fill="currentColor" />
                  <path d="M14 3H19C20.1046 3 21 3.89543 21 5V10H14V3Z" fill="currentColor" />
                  <path d="M14 14H21V19C21 20.1046 20.1046 21 19 21H14V14Z" fill="currentColor" opacity="0.75" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h1 className="font-bold text-sm sm:text-base text-slate-900 leading-none">
                    Finora
                  </h1>
                  <Badge variant="neutral" className="text-[10px] px-1.5 py-0 sm:px-2.5 sm:py-0.5">
                    Money Dashboard
                  </Badge>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 flex items-center gap-1 font-medium truncate">
                  <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">
                    {new Date().toLocaleDateString("id-ID", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3">
              <Button
                variant={activeTab === "recap" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab(activeTab === "recap" ? "dashboard" : "recap")}
                className="hidden sm:inline-flex text-xs font-semibold"
              >
                {activeTab === "recap" ? (
                  <>
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Ke Dashboard</span>
                  </>
                ) : (
                  <>
                    <Scale className="w-3.5 h-3.5 text-slate-700" />
                    <span>Rekap Kas</span>
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsReportOpen(true)}
                className="hidden sm:inline-flex text-xs"
              >
                <ChartIcon className="w-3.5 h-3.5 text-slate-600" />
                <span>Executive Deck</span>
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Tambah Transaksi</span>
                <span className="sm:hidden">Tambah</span>
              </Button>

              {/* User Profile & Logout */}
              <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-3 border-l border-slate-200">
                <div className="flex items-center gap-1.5">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs shrink-0 select-none">
                    {currentUser?.full_name ? currentUser.full_name.charAt(0) : "U"}
                  </div>
                  <div className="hidden lg:block text-left min-w-0 max-w-[130px]">
                    <p className="text-xs font-bold text-slate-900 truncate leading-tight">
                      {currentUser?.full_name || "Pengguna"}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate leading-tight">
                      {currentUser?.email || ""}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Keluar dari akun"
                  aria-label="Keluar dari akun"
                  className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* 3. Main Workspace */}
        <main className="max-w-6xl mx-auto px-3.5 sm:px-6 py-4 sm:py-8">
          {/* Navigation Tab Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6">
            <div className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex p-1 bg-slate-200/80 rounded-xl gap-1">
              <button
                type="button"
                onClick={() => setActiveTab("dashboard")}
                className={`min-h-[38px] px-3.5 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${
                  activeTab === "dashboard"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span>Dashboard & Wishlist</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("recap")}
                className={`min-h-[38px] px-3.5 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 sm:gap-2 transition-all ${
                  activeTab === "recap"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Scale className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">Rekapitulasi Arus Kas</span>
                <span className="hidden md:inline-block text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 font-bold shrink-0">
                  Harian & Bulanan
                </span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sinkronisasi Otomatis Real-time</span>
            </div>
          </div>

          {/* Error Banner State */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between">
              <div className="text-sm text-rose-800">
                <span className="font-semibold">Terjadi kendala jaringan:</span> {error}
              </div>
              <button
                onClick={loadData}
                className="min-h-[36px] px-3 py-1 bg-white text-xs font-semibold text-rose-900 border border-rose-300 rounded-lg shadow-xs hover:bg-rose-100"
              >
                Coba lagi
              </button>
            </div>
          )}

          {/* Kartu Ringkasan Finansial Grid 1-2 (Saldo di Atas, Pemasukan & Pengeluaran Bersebelahan) */}
          <section aria-label="Ringkasan Finansial" className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-5 mb-5 sm:mb-8">
            {/* Card Saldo Bersih (Full width 2 kolom di HP, 1 kolom di Desktop) */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="col-span-2 md:col-span-1 p-3.5 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Total Saldo Bersih
                </span>
                <div className="p-1.5 sm:p-2 bg-slate-100 rounded-lg text-slate-800">
                  <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>
              <div className="mt-2 sm:mt-3 text-lg sm:text-2xl lg:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                <AnimatedCounter
                  value={summary.total_balance}
                  startAnimation={!isInitialLoading}
                  delay={0.15}
                />
              </div>
              <div className="mt-1 sm:mt-2 flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-500">
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-xs">
                  <TrendingUp className="w-3 h-3" />
                  {summary.savings_rate}% Rasio Tabungan
                </span>
              </div>
            </motion.div>

            {/* Card Pemasukan (Kolom 1 di HP, Bersebelahan) */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="col-span-1 p-3 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] sm:text-xs font-bold text-emerald-800 uppercase tracking-wider truncate">
                  Pemasukan
                </span>
                <div className="p-1.5 sm:p-2 bg-emerald-50 text-emerald-700 rounded-lg shrink-0">
                  <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
              </div>
              <div className="mt-2 sm:mt-3 text-sm sm:text-xl lg:text-2xl font-extrabold text-emerald-700 font-mono tracking-tight truncate">
                <AnimatedCounter
                  value={summary.total_income}
                  startAnimation={!isInitialLoading}
                  delay={0.25}
                />
              </div>
              <p className="mt-1 text-[9px] sm:text-xs text-slate-500 truncate">
                Dana masuk terverifikasi
              </p>
            </motion.div>

            {/* Card Pengeluaran (Kolom 2 di HP, Bersebelahan) */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="col-span-1 p-3 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] sm:text-xs font-bold text-rose-800 uppercase tracking-wider truncate">
                  Pengeluaran
                </span>
                <div className="p-1.5 sm:p-2 bg-rose-50 text-rose-700 rounded-lg shrink-0">
                  <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
              </div>
              <div className="mt-2 sm:mt-3 text-sm sm:text-xl lg:text-2xl font-extrabold text-rose-700 font-mono tracking-tight truncate">
                <AnimatedCounter
                  value={summary.total_expense}
                  startAnimation={!isInitialLoading}
                  delay={0.35}
                />
              </div>
              <p className="mt-1 text-[9px] sm:text-xs text-slate-500 truncate">
                {summary.transaction_count} transaksi pengeluaran
              </p>
            </motion.div>
          </section>

          {/* Conditional View Rendering based on activeTab */}
          {activeTab === "recap" ? (
            /* VIEW REKAPITULASI (HARIAN & BULANAN) */
            <RecapitulationSection onRefreshNeeded={transactions} />
          ) : (
            /* VIEW DASHBOARD & WISHLIST */
            <>
              {/* Hero Financial Insight Banner */}
              <FinancialInsightBanner
                summary={summary}
                onAddClick={() => setIsModalOpen(true)}
                onOpenReport={() => setIsReportOpen(true)}
              />

              {/* Callout Shortcut ke Rekapitulasi */}
              <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between mb-5 sm:mb-8 hover:border-slate-300 transition-colors">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                    <CalendarRange className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      Laporan Rekapitulasi Arus Kas
                    </p>
                    <p className="text-[10px] sm:text-xs text-slate-500 truncate">
                      Lihat rincian total uang masuk & keluar harian serta bulanan
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("recap")}
                  className="text-[11px] sm:text-xs whitespace-nowrap shrink-0"
                >
                  Buka Rekap →
                </Button>
              </div>

              {/* Fitur Target Tabungan & Wishlist Barang */}
              <SavingsGoalsSection
                goals={savingsGoals}
                onOpenAddGoal={() => setIsAddGoalOpen(true)}
                onOpenDeposit={(goal) => setDepositGoalTarget(goal)}
                onDeleteGoal={handleDeleteGoal}
              />

              {/* Filter & Pencarian Cepat */}
              <TransactionFilters
                search={search}
                onSearchChange={setSearch}
                typeFilter={typeFilter}
                onTypeFilterChange={setTypeFilter}
                categoryFilter={categoryFilter}
                onCategoryFilterChange={setCategoryFilter}
                categories={uniqueCategories}
                totalResults={transactions.length}
              />

              {/* Grid Analitik & Riwayat Transaksi */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Sisi Kiri (2 Kolom): Tabel Riwayat Transaksi */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-slate-900">
                        Riwayat Transaksi
                      </h2>
                      <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                        Daftar transaksi tersinkronisasi dengan server
                      </p>
                    </div>
                    <Badge variant="neutral" className="text-[10px] sm:text-xs">
                      {transactions.length} Data
                    </Badge>
                  </div>

                  {/* Loading Skeleton State */}
                  {loading ? (
                    <div className="space-y-2.5 sm:space-y-3">
                      {[1, 2, 3, 4].map((n) => (
                        <div
                          key={n}
                          className="h-12 sm:h-16 bg-slate-100 animate-pulse rounded-xl"
                        />
                      ))}
                    </div>
                  ) : transactions.length === 0 ? (
                    /* Empty State */
                    <div className="py-12 sm:py-16 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/70 p-4 sm:p-6">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-2.5 sm:mb-3">
                        <Receipt className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-slate-800">
                        Tidak ada transaksi yang cocok
                      </p>
                      <p className="text-[11px] sm:text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        {search || typeFilter !== "all" || categoryFilter !== "Semua"
                          ? "Coba ubah kata kunci atau reset filter untuk menampilkan data transaksi."
                          : "Mulai kelola keuangan Anda dengan menambahkan transaksi perdana."}
                      </p>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setIsModalOpen(true)}
                        className="mt-3 sm:mt-4 text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Transaksi Sekarang</span>
                      </Button>
                    </div>
                  ) : (
                    /* List Data Transaksi Responsif */
                    <div className="divide-y divide-slate-100">
                      <AnimatePresence>
                        {transactions.map((tx) => (
                          <motion.div
                            key={tx.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            className="py-2.5 sm:py-3.5 flex items-center justify-between group hover:bg-slate-50/80 px-1.5 sm:px-2 rounded-xl transition-colors"
                          >
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0 mr-2">
                              <div
                                className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${
                                  tx.type === "income"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-rose-50 text-rose-700"
                                }`}
                              >
                                {tx.type === "income" ? (
                                  <ArrowDownRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                ) : (
                                  <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug truncate">
                                  {tx.title}
                                </p>
                                <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1 flex-wrap">
                                  <Badge
                                    variant={tx.type === "income" ? "income" : "neutral"}
                                    className="text-[9px] sm:text-[11px] px-1.5 py-0"
                                  >
                                    {tx.category}
                                  </Badge>
                                  <span className="text-[10px] sm:text-xs text-slate-400 font-mono whitespace-nowrap">
                                    {new Date(tx.created_at).toLocaleDateString("id-ID", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                              <span
                                className={`text-xs sm:text-sm font-bold font-mono tracking-tight whitespace-nowrap ${
                                  tx.type === "income"
                                    ? "text-emerald-700"
                                    : "text-slate-900"
                                }`}
                              >
                                {tx.type === "income" ? "+" : "-"} Rp{" "}
                                {new Intl.NumberFormat("id-ID").format(tx.amount)}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDeleteTransaction(tx.id, tx.title)}
                                aria-label={`Hapus ${tx.title}`}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {/* Sisi Kanan (1 Kolom): Donut & Bar Chart Distribusi Kategori */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Layers className="w-4 h-4 text-slate-700" />
                      <h2 className="text-sm sm:text-base font-bold text-slate-900">
                        Distribusi Kategori
                      </h2>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-500 mb-3 sm:mb-4">
                      Porsi pengeluaran berdasarkan pos alokasi dana
                    </p>
                    <CategoryChart data={summary.category_breakdown} />
                  </div>

                  <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                    <span className="text-[11px] sm:text-xs">Status Finansial</span>
                    <Badge variant="income" className="text-[10px] sm:text-xs">Arus Kas Sehat</Badge>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>

        {/* Modal Popup Tambah Transaksi */}
        <AddTransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleCreateTransaction}
        />

        {/* Modal Buat Target Tabungan Baru */}
        <AddGoalModal
          isOpen={isAddGoalOpen}
          onClose={() => setIsAddGoalOpen(false)}
          onSuccess={handleCreateGoal}
        />

        {/* Modal Setor Tabungan */}
        <DepositGoalModal
          isOpen={Boolean(depositGoalTarget)}
          onClose={() => setDepositGoalTarget(null)}
          goal={depositGoalTarget}
          onSuccess={handleDepositGoal}
        />

        {/* Executive Report Slides Modal */}
        <ExecutiveReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          summary={summary}
          transactions={transactions}
        />
      </div>
    </>
  );
}
