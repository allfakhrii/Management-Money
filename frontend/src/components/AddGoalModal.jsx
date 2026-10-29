import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Target, Sparkles } from "lucide-react";
import { Button } from "./ui/Button";

const GOAL_CATEGORIES = [
  "Gadget & Elektronik",
  "Kendaraan",
  "Liburan & Wisata",
  "Dana Darurat",
  "Pendidikan",
  "Rumah & Properti",
  "Investasi",
  "Lainnya",
];

export function AddGoalModal({ isOpen, onClose, onSuccess }) {
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [initialAmount, setInitialAmount] = useState("");
  const [category, setCategory] = useState("Gadget & Elektronik");
  const [targetDate, setTargetDate] = useState("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const parsedTarget = parseFloat(targetAmount);
    const parsedInitial = initialAmount ? parseFloat(initialAmount) : 0;

    if (!title.trim() || isNaN(parsedTarget) || parsedTarget <= 0) {
      setErrorMsg("Mohon masukkan nama barang/tujuan dan nominal target yang valid.");
      return;
    }

    try {
      setLoading(true);
      await onSuccess({
        title: title.trim(),
        target_amount: parsedTarget,
        current_amount: parsedInitial > 0 ? parsedInitial : 0,
        category,
        target_date: targetDate || undefined,
      });

      // Reset
      setTitle("");
      setTargetAmount("");
      setInitialAmount("");
      setCategory("Gadget & Elektronik");
      setTargetDate("");
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Gagal membuat target tabungan.");
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
          aria-labelledby="goal-modal-title"
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
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10 my-8"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h2 id="goal-modal-title" className="text-lg font-bold text-slate-900">
                    Buat Target Tabungan Baru
                  </h2>
                  <p className="text-xs text-slate-500">
                    Tentukan barang impian dan nominal dana yang ingin dicapai
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup form modal target"
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors focus:ring-2 focus:ring-slate-400 focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label htmlFor="goal-title" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Barang / Tujuan Tabungan
                </label>
                <input
                  id="goal-title"
                  type="text"
                  required
                  placeholder="Contoh: MacBook Pro M3 atau DP Rumah"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label htmlFor="goal-target" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Target Nominal Pembelian (IDR)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-semibold text-slate-400 text-sm">
                    Rp
                  </span>
                  <input
                    id="goal-target"
                    type="number"
                    min="1"
                    step="any"
                    required
                    placeholder="0"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full min-h-[44px] pl-11 pr-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 font-mono font-bold text-base placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="goal-initial" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Setoran Awal (Opsional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-semibold text-slate-400 text-xs">
                      Rp
                    </span>
                    <input
                      id="goal-initial"
                      type="number"
                      min="0"
                      step="any"
                      placeholder="0"
                      value={initialAmount}
                      onChange={(e) => setInitialAmount(e.target.value)}
                      className="w-full min-h-[44px] pl-10 pr-3 py-2 rounded-xl border border-slate-300 text-slate-900 font-mono text-sm placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="goal-date" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Estimasi Tanggal Tercapai
                  </label>
                  <input
                    id="goal-date"
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Kategori Sasaran
                </label>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {GOAL_CATEGORIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                        category === c
                          ? "bg-slate-900 border-slate-900 text-white font-semibold"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="md"
                  onClick={onClose}
                  disabled={loading}
                >
                  Batal
                </Button>
                <Button
                  variant="default"
                  size="md"
                  type="submit"
                  disabled={loading}
                  className="bg-slate-900 text-white hover:bg-slate-800"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 mr-1.5" />
                  {loading ? "Menyimpan..." : "Aktifkan Target Tabungan"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
