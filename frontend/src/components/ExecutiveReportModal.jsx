import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  PieChart as ChartIcon,
  TrendingUp,
  Shield,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";

export function ExecutiveReportModal({ isOpen, onClose, summary, transactions }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const totalSlides = 3;

  useEffect(() => {
    function handleKeyDown(e) {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setCurrentSlide((prev) => (prev + 1) % totalSlides);
      if (e.key === "ArrowLeft") setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatCurrency = (val) =>
    "Rp " + new Intl.NumberFormat("id-ID").format(val || 0);

  const totalIncome = summary?.total_income || 0;
  const totalExpense = summary?.total_expense || 0;
  const totalBalance = summary?.total_balance || 0;
  const savingsRate = summary?.savings_rate || 0;
  const categories = summary?.category_breakdown || [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-slide-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
      />

      {/* Main Slide Deck Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col min-h-[500px]"
      >
        {/* Header Slide Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            <h2 id="report-slide-title" className="text-sm font-bold text-slate-900">
              Executive Financial Deck
            </h2>
            <Badge variant="neutral">Finora Strategic Slides</Badge>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-slate-500">
              Slide {currentSlide + 1} dari {totalSlides}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup presentasi"
              className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Slide Canvas Body */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {currentSlide === 0 && (
              <motion.div
                key="slide-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div>
                  <Badge variant="brand" className="mb-2">Slide 1: Ringkasan Eksekutif</Badge>
                  <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Kesehatan Arus Kas & Posisi Likuiditas
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Evaluasi komprehensif saldo bersih serta efisiensi tabungan saat ini.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Saldo Bersih</p>
                    <p className="text-xl font-bold font-mono text-slate-900 mt-2">{formatCurrency(totalBalance)}</p>
                    <p className="text-xs text-slate-500 mt-1">Dana likuid tersedia</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                    <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Rasio Tabungan</p>
                    <p className="text-xl font-bold font-mono text-emerald-700 mt-2">{savingsRate}%</p>
                    <p className="text-xs text-emerald-600 mt-1">Target sehat: minimal 20%</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Transaksi</p>
                    <p className="text-xl font-bold font-mono text-slate-900 mt-2">{summary?.transaction_count || 0}</p>
                    <p className="text-xs text-slate-500 mt-1">Aktivitas terverifikasi</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center gap-3">
                  <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-white">Rekomendasi Strategis:</strong> Pertahankan rasio belanja di bawah 60% dari pemasukan untuk memperkuat alokasi dana darurat atau portofolio investasi.
                  </p>
                </div>
              </motion.div>
            )}

            {currentSlide === 1 && (
              <motion.div
                key="slide-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div>
                  <Badge variant="brand" className="mb-2">Slide 2: Dinamika Arus Kas</Badge>
                  <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Komparasi Pemasukan vs Pengeluaran
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Visualisasi perbandingan volume dana masuk dan dana keluar periode ini.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40">
                    <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs">
                      <ArrowDownRight className="w-4 h-4" />
                      <span>Arus Masuk (Income)</span>
                    </div>
                    <p className="text-2xl font-extrabold font-mono text-emerald-700 mt-3">
                      {formatCurrency(totalIncome)}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl border border-rose-200 bg-rose-50/40">
                    <div className="flex items-center gap-2 text-rose-700 font-semibold text-xs">
                      <ArrowUpRight className="w-4 h-4" />
                      <span>Arus Keluar (Expense)</span>
                    </div>
                    <p className="text-2xl font-extrabold font-mono text-rose-700 mt-3">
                      {formatCurrency(totalExpense)}
                    </p>
                  </div>
                </div>

                {/* Progress Ratio Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Proporsi Pengeluaran terhadap Pendapatan</span>
                    <span className="font-mono">
                      {totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-600 h-full"
                      style={{
                        width: `${totalIncome > 0 ? Math.max(10, Math.min(90, 100 - (totalExpense / totalIncome) * 100)) : 50}%`,
                      }}
                    />
                    <div
                      className="bg-rose-600 h-full"
                      style={{
                        width: `${totalIncome > 0 ? Math.min(90, (totalExpense / totalIncome) * 100) : 50}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Hijau: Porsi Surplus Disimpan</span>
                    <span>Merah: Porsi Belanja Digunakan</span>
                  </div>
                </div>
              </motion.div>
            )}

            {currentSlide === 2 && (
              <motion.div
                key="slide-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div>
                  <Badge variant="brand" className="mb-2">Slide 3: Matriks Alokasi Dana</Badge>
                  <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Top Pengeluaran per Kategori
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Prioritas pos dana yang menyerap anggaran tertinggi.
                  </p>
                </div>

                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {categories.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-6">
                      Belum ada pos pengeluaran yang tercatat.
                    </p>
                  ) : (
                    categories.map((c, i) => (
                      <div
                        key={c.category}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-mono text-xs flex items-center justify-center font-bold">
                            #{i + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{c.category}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-bold text-slate-500">
                            {c.percentage}%
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-900">
                            {formatCurrency(c.amount)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  <strong>Evaluasi:</strong> Pos anggaran terbesar sebaiknya dievaluasi berkala setiap akhir bulan untuk mencegah kebocoran dana tak terduga.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Navigation Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/60">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)}
            disabled={currentSlide === 0}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Sebelumnya</span>
          </Button>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Buka slide ${idx + 1}`}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  currentSlide === idx ? "w-6 bg-slate-900" : "bg-slate-300 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={() => setCurrentSlide((prev) => (prev + 1) % totalSlides)}
            disabled={currentSlide === totalSlides - 1}
          >
            <span>Selanjutnya</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
