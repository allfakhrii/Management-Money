import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";

const PRESET_CATEGORIES = [
  "Kebutuhan",
  "Tagihan",
  "Gaji",
  "Investasi",
  "Hiburan",
  "Pendidikan",
  "Kesehatan",
  "Lainnya",
];

export function AddTransactionModal({ isOpen, onClose, onSuccess }) {
  const today = new Date().toISOString().split("T")[0];
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("Kebutuhan");
  const [date, setDate] = useState(today);
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

    const parsedAmount = parseFloat(amount);
    if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg("Mohon masukkan nama transaksi dan nominal yang valid (lebih dari 0).");
      return;
    }

    try {
      setLoading(true);
      await onSuccess({
        title: title.trim(),
        amount: parsedAmount,
        type,
        category: category.trim(),
        date: new Date(date).toISOString(),
      });
      // Reset form
      setTitle("");
      setAmount("");
      setType("expense");
      setCategory("Kebutuhan");
      setDate(today);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Gagal menyimpan data transaksi.");
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
          aria-labelledby="modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          {/* Backdrop Animasi */}
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
              <div>
                <h2 id="modal-title" className="text-lg font-bold text-slate-900">
                  Tambah Transaksi Baru
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Catat arus kas masuk atau pengeluaran harian Anda
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup form modal"
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
              {/* Jenis Transaksi */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Jenis Arus Kas
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType("expense")}
                    className={`min-h-[44px] py-2.5 px-3 text-sm font-semibold rounded-xl border flex items-center justify-center gap-2 transition-all ${
                      type === "expense"
                        ? "bg-rose-50 border-rose-500 text-rose-700 ring-1 ring-rose-500"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>Pengeluaran (-)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("income")}
                    className={`min-h-[44px] py-2.5 px-3 text-sm font-semibold rounded-xl border flex items-center justify-center gap-2 transition-all ${
                      type === "income"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>Pemasukan (+)</span>
                  </button>
                </div>
              </div>

              {/* Judul & Tanggal */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label htmlFor="tx-title" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Keterangan
                  </label>
                  <input
                    id="tx-title"
                    type="text"
                    required
                    placeholder="Contoh: Belanja Mingguan"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="tx-date" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Tanggal
                  </label>
                  <input
                    id="tx-date"
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none text-sm font-mono"
                  />
                </div>
              </div>

              {/* Nominal */}
              <div>
                <label htmlFor="tx-amount" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nominal (IDR)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-semibold text-slate-400 text-sm">
                    Rp
                  </span>
                  <input
                    id="tx-amount"
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

              {/* Pilihan Kategori */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="tx-category" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Kategori Terpilih: <span className="text-slate-900 font-bold">{category}</span>
                  </label>
                </div>
                {/* Chip Pilihan Cepat */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {PRESET_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                        category === cat
                          ? "bg-slate-900 border-slate-900 text-white font-semibold"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="min-h-[44px] px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="min-h-[44px] px-6 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 rounded-xl transition-colors shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
                >
                  {loading ? "Menyimpan..." : "Simpan Transaksi"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
