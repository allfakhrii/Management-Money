import React from "react";
import { Sparkles, ArrowRight, ShieldCheck, TrendingUp } from "lucide-react";
import { Button } from "./ui/Button";

export function FinancialInsightBanner({ summary, onAddClick, onOpenReport }) {
  const savingsRate = summary?.savings_rate || 0;
  const isHealthy = savingsRate >= 20;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 text-white p-4 sm:p-7 mb-5 sm:mb-8 shadow-md">
      {/* Subtle Background Accent */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-slate-800/40 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-[10px] sm:text-xs font-medium text-slate-300 mb-2 sm:mb-3">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
            <span>Wawasan Finansial Cerdas</span>
          </div>

          <h2 className="text-sm sm:text-xl lg:text-2xl font-bold tracking-tight text-white leading-snug">
            {isHealthy
              ? `Rasio tabungan Anda mencapai ${savingsRate}%. Arus kas terjaga optimal.`
              : "Optimalkan alokasi belanja untuk meningkatkan porsi tabungan bulan ini."}
          </h2>

          <p className="mt-1.5 sm:mt-2 text-[11px] sm:text-sm text-slate-400 leading-relaxed">
            Finora menganalisis {summary?.transaction_count || 0} pos transaksi Anda. Disiplin pencatatan harian menjaga stabilitas pengeluaran jangka panjang.
          </p>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2 sm:mt-3 text-[10px] sm:text-xs text-slate-300 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Data 100% Terenkripsi Lokal
            </span>
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Update Real-Time
            </span>
          </div>
        </div>

        <div className="flex flex-row sm:flex-col gap-2 sm:gap-2.5 shrink-0 pt-1 sm:pt-0">
          <Button
            variant="white"
            size="sm"
            onClick={onOpenReport}
            className="flex-1 sm:flex-none text-[10px] sm:text-xs py-1.5 sm:py-2 px-2.5 sm:px-3 shadow-md font-semibold whitespace-nowrap"
          >
            <span className="text-slate-950 font-semibold whitespace-nowrap">Buka Executive Report</span>
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-950 stroke-[2] shrink-0" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onAddClick}
            className="flex-1 sm:flex-none text-[10px] sm:text-xs py-1.5 sm:py-2 px-2.5 sm:px-3 border-slate-700 bg-slate-800/60 text-slate-200 hover:bg-slate-800 hover:text-white whitespace-nowrap"
          >
            <span className="whitespace-nowrap">Catat Transaksi Cepat</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
