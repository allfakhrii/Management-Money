import React from "react";
import { Plus, Target, CheckCircle2, Trash2, Calendar, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";

export function SavingsGoalsSection({
  goals = [],
  onOpenAddGoal,
  onOpenDeposit,
  onDeleteGoal,
}) {
  const formatCurrency = (val) =>
    "Rp " + new Intl.NumberFormat("id-ID").format(val || 0);

  const totalTarget = goals.reduce((acc, g) => acc + (g.target_amount || 0), 0);
  const totalCollected = goals.reduce((acc, g) => acc + (g.current_amount || 0), 0);
  const totalPercent = totalTarget > 0 ? Math.min(100, Math.round((totalCollected / totalTarget) * 100)) : 0;

  return (
    <section aria-label="Target Tabungan & Wishlist" className="mb-6 sm:mb-8">
      {/* Header Bagian Tabungan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-3.5 sm:mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800" />
            <h2 className="text-sm sm:text-lg font-bold text-slate-900 tracking-tight">
              Target Tabungan & Wishlist Barang
            </h2>
            <Badge variant="warning" className="text-[10px] sm:text-xs">{goals.length} Sasaran</Badge>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Alokasikan dana spesifik untuk membeli barang impian Anda
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenAddGoal}
          className="border-slate-300 text-slate-800 hover:bg-slate-100 text-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Target Baru</span>
        </Button>
      </div>

      {/* Overview Progress Akumulasi Tabungan jika ada target */}
      {goals.length > 0 && (
        <div className="mb-3.5 sm:mb-4 p-3 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Akumulasi Seluruh Target Tabungan
              </p>
              <p className="text-xs sm:text-base font-bold text-slate-900 font-mono">
                {formatCurrency(totalCollected)} <span className="text-slate-400 font-normal">/ {formatCurrency(totalTarget)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 min-w-[160px] sm:min-w-[200px]">
            <div className="flex-1">
              <div className="w-full h-2 sm:h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${totalPercent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-slate-900 rounded-full"
                />
              </div>
            </div>
            <span className="text-xs font-bold font-mono text-slate-800">
              {totalPercent}%
            </span>
          </div>
        </div>
      )}

      {/* Daftar Kartu Target Tabungan */}
      {goals.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl bg-white">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-3">
            <Target className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-800">Belum ada target tabungan aktif</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Tentukan barang yang ingin dibeli atau sasaran finansial impian Anda untuk mulai menabung secara teratur.
          </p>
          <Button
            variant="default"
            size="sm"
            onClick={onOpenAddGoal}
            className="mt-4"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Target Perdana</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {goals.map((goal) => {
              const current = goal.current_amount || 0;
              const target = goal.target_amount || 0;
              const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
              const remaining = Math.max(0, target - current);
              const isDone = current >= target;

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-3.5 sm:p-5 rounded-2xl border transition-all ${
                    isDone
                      ? "bg-emerald-50/40 border-emerald-200 shadow-xs"
                      : "bg-white border-slate-200 shadow-xs hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge
                          variant={isDone ? "income" : "neutral"}
                          className="text-[9px] sm:text-[11px] px-1.5 py-0"
                        >
                          {goal.category}
                        </Badge>
                        {isDone && (
                          <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-700">
                            <CheckCircle2 className="w-3 h-3" />
                            Target Tercapai!
                          </span>
                        )}
                      </div>
                      <h3 className="text-xs sm:text-base font-bold text-slate-900 mt-1 sm:mt-1.5 leading-snug truncate">
                        {goal.title}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteGoal(goal.id, goal.title)}
                      aria-label={`Hapus target ${goal.title}`}
                      className="p-1 sm:p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>

                  {/* Progres Bar */}
                  <div className="mt-3 sm:mt-4 space-y-1">
                    <div className="flex justify-between text-[11px] sm:text-xs">
                      <span className="font-semibold text-slate-700">
                        {formatCurrency(current)}
                      </span>
                      <span className="text-slate-400 font-mono">
                        Target: {formatCurrency(target)}
                      </span>
                    </div>

                    <div className="w-full h-2 sm:h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full rounded-full ${
                          isDone ? "bg-emerald-600" : "bg-slate-900"
                        }`}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] sm:text-[11px] text-slate-500 font-mono pt-0.5">
                      <span className="font-bold text-slate-700">
                        {percent}% Tercapai
                      </span>
                      <span className="truncate">
                        {isDone
                          ? "Dana siap dibelanjakan"
                          : `Kurang ${formatCurrency(remaining)}`}
                      </span>
                    </div>
                  </div>

                  {/* Footer Tanggal & Tombol Setor */}
                  <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-1 truncate">
                      <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                      <span className="truncate">
                        {goal.target_date
                          ? `Target: ${new Date(goal.target_date).toLocaleDateString("id-ID", { month: "short", year: "numeric" })}`
                          : "Fleksibel"}
                      </span>
                    </div>

                    <Button
                      variant={isDone ? "outline" : "default"}
                      size="sm"
                      onClick={() => onOpenDeposit(goal)}
                      className={`text-xs px-2.5 py-1 ${isDone ? "border-emerald-300 text-emerald-800" : ""}`}
                    >
                      <span>{isDone ? "Tambah Lagi" : "Setor Tabungan"}</span>
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
