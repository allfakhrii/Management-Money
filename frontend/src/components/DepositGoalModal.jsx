import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, PlusCircle, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/Button";

const QUICK_AMOUNTS = [100000, 250000, 500000, 1000000, 2500000, 5000000];

export function DepositGoalModal({ isOpen, onClose, goal, onSuccess }) {
  const [amount, setAmount] = useState("");
  const [deductFromBalance, setDeductFromBalance] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!goal) return null;

  const currentAmt = goal.current_amount || 0;
  const targetAmt = goal.target_amount || 0;
  const parsedDeposit = parseFloat(amount) || 0;
  const projectedTotal = currentAmt + parsedDeposit;
  const projectedPercent = Math.min(100, Math.round((projectedTotal / targetAmt) * 100));

  const formatCurrency = (val) =>
    "Rp " + new Intl.NumberFormat("id-ID").format(val);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (parsedDeposit <= 0) {
      setErrorMsg("Mohon masukkan nominal setoran yang valid (lebih dari 0).");
      return;
    }

    try {
      setLoading(true);
      await onSuccess(goal.id, parsedDeposit, deductFromBalance);
      setAmount("");
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Gagal menyetor ke tabungan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="deposit-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.1 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 id="deposit-modal-title" className="text-base font-bold text-slate-900 leading-tight">
                    Setor ke Tabungan
                  </h2>
                  <p className="text-xs text-slate-500 truncate max-w-[240px]">
                    {goal.title}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup form setor modal"
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Preview Pencapaian */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Saat ini: <strong>{formatCurrency(currentAmt)}</strong></span>
                  <span>Target: <strong>{formatCurrency(targetAmt)}</strong></span>
                </div>

                {/* Progress bar preview */}
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 transition-all duration-300"
                    style={{ width: `${projectedPercent}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>Proyeksi setelah setor:</span>
                  <span className="font-bold text-emerald-700">
                    {formatCurrency(projectedTotal)} ({projectedPercent}%)
                  </span>
                </div>
              </div>

              {/* Input Nominal Setoran */}
              <div>
                <label htmlFor="deposit-amount" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nominal Setoran (IDR)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-semibold text-slate-400 text-sm">
                    Rp
                  </span>
                  <input
                    id="deposit-amount"
                    type="number"
                    min="1"
                    step="any"
                    required
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full min-h-[44px] pl-11 pr-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 font-mono font-bold text-base placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Quick Chip Buttons */}
              <div>
                <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-1.5">
                  Pilihan Cepat
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {QUICK_AMOUNTS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val.toString())}
                      className="py-1.5 px-2 rounded-lg text-xs font-semibold border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors font-mono"
                    >
                      +{val >= 1000000 ? `${val / 1000000} Jt` : `${val / 1000} Rb`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Checkbox Potong dari Kas Utama */}
              <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={deductFromBalance}
                  onChange={(e) => setDeductFromBalance(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300"
                />
                <span className="text-xs text-slate-600 leading-snug">
                  Sinkronkan & catat sebagai pengeluaran alokasi tabungan pada kas utama Finora.
                </span>
              </label>

              {/* Tombol Aksi */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="md"
                  onClick={onClose}
                  disabled={loading}
                >
                  Batal
                </Button>
                <Button
                  variant="success"
                  size="md"
                  type="submit"
                  disabled={loading}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  {loading ? "Menyetor..." : "Konfirmasi Setoran"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
