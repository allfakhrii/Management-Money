import React from "react";
import { Search, X, Download, SlidersHorizontal } from "lucide-react";
import { getExportCsvUrl } from "../api/transactions";

export function TransactionFilters({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  categories = [],
  totalResults = 0,
}) {
  return (
    <div className="space-y-2.5 sm:space-y-3 bg-white p-3 sm:p-4 rounded-xl border border-slate-200 mb-4 sm:mb-6 shadow-xs">
      {/* Baris Atas: Pencarian & Export CSV */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <label htmlFor="search-tx" className="sr-only">
            Cari transaksi
          </label>
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="search-tx"
            type="text"
            placeholder="Cari transaksi berdasarkan judul atau kategori..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full min-h-[38px] sm:min-h-[44px] pl-9 sm:pl-10 pr-8 sm:pr-9 py-1.5 sm:py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Hapus kata kunci pencarian"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <a
          href={getExportCsvUrl()}
          download="money_dashboard_export.csv"
          className="min-h-[38px] sm:min-h-[44px] px-3 sm:px-3.5 py-1.5 sm:py-2 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors focus:ring-2 focus:ring-slate-400 focus:outline-none shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </a>
      </div>

      {/* Baris Bawah: Filter Tipe & Dropdown Kategori */}
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 pt-2 border-t border-slate-100">
        {/* Filter Tipe Transaksi (Pills) */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => onTypeFilterChange("all")}
            className={`min-h-[32px] sm:min-h-[36px] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all ${
              typeFilter === "all"
                ? "bg-slate-900 text-white shadow-xs font-semibold"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => onTypeFilterChange("income")}
            className={`min-h-[32px] sm:min-h-[36px] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all ${
              typeFilter === "income"
                ? "bg-emerald-600 text-white shadow-xs font-semibold"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            Pemasukan
          </button>
          <button
            type="button"
            onClick={() => onTypeFilterChange("expense")}
            className={`min-h-[32px] sm:min-h-[36px] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all ${
              typeFilter === "expense"
                ? "bg-rose-600 text-white shadow-xs font-semibold"
                : "bg-rose-50 text-rose-700 hover:bg-rose-100"
            }`}
          >
            Pengeluaran
          </button>
        </div>

        {/* Dropdown Kategori & Total Counter */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
          <label htmlFor="filter-cat" className="text-slate-500 font-medium">
            Kategori:
          </label>
          <select
            id="filter-cat"
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
            className="min-h-[32px] sm:min-h-[36px] px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="Semua">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <span className="text-[10px] sm:text-xs text-slate-400 font-mono">
            ({totalResults})
          </span>
        </div>
      </div>
    </div>
  );
}
