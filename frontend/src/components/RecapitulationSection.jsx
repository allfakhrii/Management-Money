import React, { useState, useEffect } from "react";
import {
  CalendarDays,
  CalendarRange,
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Receipt,
  Scale,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchRecap } from "../api/transactions";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";

export function RecapitulationSection({ onRefreshNeeded }) {
  const [period, setPeriod] = useState("monthly");
  const [recapData, setRecapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedKeys, setExpandedKeys] = useState({});

  const loadRecap = async (selectedPeriod) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchRecap(selectedPeriod);
      setRecapData(data);
    } catch (err) {
      setError(err.message || "Gagal memuat data rekapitulasi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecap(period);
  }, [period, onRefreshNeeded]);

  const toggleExpand = (key) => {
    setExpandedKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const formatCurrency = (val) =>
    "Rp " + new Intl.NumberFormat("id-ID").format(val || 0);

  const items = recapData?.items || [];
  const grandIncome = recapData?.grand_income || 0;
  const grandExpense = recapData?.grand_expense || 0;
  const grandNet = recapData?.grand_net || 0;

  return (
    <section aria-label="Rekapitulasi Keuangan" className="mb-8">
      {/* Header & Switcher Mode Harian / Bulanan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800" />
            <h2 className="text-sm sm:text-lg font-bold text-slate-900 tracking-tight">
              Rekapitulasi Arus Kas
            </h2>
            <Badge variant="neutral" className="text-[10px] sm:text-xs">
              {period === "monthly" ? "Per Bulan" : "Per Hari"}
            </Badge>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Laporan agregasi pemasukan, pengeluaran, dan selisih kas per periode
          </p>
        </div>

        {/* Tab Switcher Harian / Bulanan */}
        <div className="inline-flex p-1 bg-slate-200/70 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setPeriod("monthly")}
            className={`min-h-[32px] sm:min-h-[36px] px-3 py-1 rounded-lg text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 transition-all ${
              period === "monthly"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CalendarRange className="w-3.5 h-3.5" />
            <span>Rekap Bulanan</span>
          </button>

          <button
            type="button"
            onClick={() => setPeriod("daily")}
            className={`min-h-[32px] sm:min-h-[36px] px-3 py-1 rounded-lg text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 transition-all ${
              period === "daily"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Rekap Harian</span>
          </button>
        </div>
      </div>

      {/* Kartu Ringkasan Akumulasi Periode Terpilih */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4">
        <div className="p-2.5 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <p className="text-[9px] sm:text-xs font-bold text-emerald-800 uppercase tracking-wider truncate">
            Total Masuk
          </p>
          <p className="mt-0.5 sm:mt-1 text-xs sm:text-lg font-bold font-mono text-emerald-700 truncate">
            +{formatCurrency(grandIncome)}
          </p>
        </div>

        <div className="p-2.5 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <p className="text-[9px] sm:text-xs font-bold text-rose-800 uppercase tracking-wider truncate">
            Total Keluar
          </p>
          <p className="mt-0.5 sm:mt-1 text-xs sm:text-lg font-bold font-mono text-rose-700 truncate">
            -{formatCurrency(grandExpense)}
          </p>
        </div>

        <div className="p-2.5 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <p className="text-[9px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider truncate">
            Selisih Kas
          </p>
          <p
            className={`mt-0.5 sm:mt-1 text-xs sm:text-lg font-bold font-mono truncate ${
              grandNet >= 0 ? "text-emerald-700" : "text-rose-700"
            }`}
          >
            {grandNet >= 0 ? "+" : ""}{formatCurrency(grandNet)}
          </p>
        </div>
      </div>

      {/* Konten Rekapitulasi */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-20 bg-slate-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={() => loadRecap(period)}
            className="font-semibold underline hover:no-underline"
          >
            Coba lagi
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl bg-white">
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
            <Receipt className="w-5 h-5" />
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-800">
            Belum ada data rekapitulasi
          </p>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
            Transaksi yang Anda catat akan otomatis dikelompokkan per {period === "monthly" ? "bulan" : "hari"} di sini.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const isExpanded = Boolean(expandedKeys[item.key]);
            const totalVolume = item.total_income + item.total_expense;
            const incomePercent = totalVolume > 0 ? Math.round((item.total_income / totalVolume) * 100) : 50;
            const isSurplus = item.net_flow >= 0;

            return (
              <div
                key={item.key}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Baris Utama Rekap Periode */}
                <div
                  onClick={() => toggleExpand(item.key)}
                  className="p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-center justify-between sm:justify-start gap-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {period === "monthly" ? <CalendarRange className="w-4 h-4" /> : <CalendarDays className="w-4 h-4" />}
                      </div>
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                          {item.label}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-slate-400 font-mono mt-0.5">
                          {item.transaction_count} transaksi tercatat
                        </p>
                      </div>
                    </div>

                    <div className="sm:hidden">
                      <Badge variant={isSurplus ? "income" : "expense"} className="text-[9px] px-1.5 py-0">
                        {isSurplus ? "Surplus" : "Defisit"}
                      </Badge>
                    </div>
                  </div>

                  {/* Rincian Pemasukan vs Pengeluaran Periode Ini */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Masuk / Keluar
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 font-mono text-[11px] sm:text-xs font-bold">
                        <span className="text-emerald-700 whitespace-nowrap">
                          +{formatCurrency(item.total_income)}
                        </span>
                        <span className="text-slate-300">/</span>
                        <span className="text-rose-700 whitespace-nowrap">
                          -{formatCurrency(item.total_expense)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Selisih Kas
                      </p>
                      <p
                        className={`text-xs sm:text-sm font-extrabold font-mono mt-0.5 whitespace-nowrap ${
                          isSurplus ? "text-emerald-700" : "text-rose-700"
                        }`}
                      >
                        {isSurplus ? "+" : ""}{formatCurrency(item.net_flow)}
                      </p>
                    </div>

                    <div className="hidden sm:block">
                      <Badge variant={isSurplus ? "income" : "expense"}>
                        {isSurplus ? "Surplus" : "Defisit"}
                      </Badge>
                    </div>

                    <div className="text-slate-400 p-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Mini Ratio Bar Masuk vs Keluar */}
                <div className="w-full h-1 bg-slate-100 flex">
                  <div
                    className="bg-emerald-600 h-full"
                    style={{ width: `${incomePercent}%` }}
                  />
                  <div
                    className="bg-rose-600 h-full"
                    style={{ width: `${100 - incomePercent}%` }}
                  />
                </div>

                {/* Sub-Daftar Transaksi (Drill-Down saat diklik) */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-slate-100 bg-slate-50/70 p-3 sm:p-4 divide-y divide-slate-200/60"
                    >
                      <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Daftar Transaksi Periode {item.label}
                      </p>
                      {item.transactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="py-2 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2 truncate pr-2">
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                tx.type === "income" ? "bg-emerald-600" : "bg-rose-600"
                              }`}
                            />
                            <span className="font-semibold text-slate-800 truncate">
                              {tx.title}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200/80 text-slate-600 font-medium shrink-0">
                              {tx.category}
                            </span>
                            {period === "monthly" && (
                              <span className="text-[10px] text-slate-400 font-mono shrink-0 hidden sm:inline">
                                {new Date(tx.created_at).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </span>
                            )}
                          </div>
                          <span
                            className={`font-mono font-bold whitespace-nowrap ${
                              tx.type === "income" ? "text-emerald-700" : "text-slate-900"
                            }`}
                          >
                            {tx.type === "income" ? "+" : "-"} {formatCurrency(tx.amount)}
                          </span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
