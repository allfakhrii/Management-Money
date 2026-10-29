import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

export function AppLoadingScreen({ onFinished, duration = 800 }) {
  const [statusText, setStatusText] = useState("Menyiapkan dashboard...");

  useEffect(() => {
    const t1 = setTimeout(() => {
      setStatusText("Memuat data saldo & analitik...");
    }, duration * 0.45);

    const t2 = setTimeout(() => {
      setStatusText("Siap.");
    }, duration * 0.85);

    const t3 = setTimeout(() => {
      onFinished();
    }, duration);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [duration, onFinished]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25, ease: "easeOut" } }}
      style={{ willChange: "opacity" }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white select-none px-6"
    >
      <div className="flex flex-col items-center text-center max-w-xs w-full">
        {/* Logo Monogram Ringan Hardware-Accelerated */}
        <div className="w-14 h-14 rounded-2xl bg-white text-slate-950 flex items-center justify-center shadow-lg mb-6 transform-gpu">
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="3" y="3" width="7" height="18" rx="2" fill="currentColor" />
            <path d="M14 3H19C20.1046 3 21 3.89543 21 5V10H14V3Z" fill="currentColor" />
            <path d="M14 14H21V19C21 20.1046 20.1046 21 19 21H14V14Z" fill="currentColor" opacity="0.75" />
          </svg>
        </div>

        {/* Brand Name */}
        <div className="space-y-1 mb-6">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-white">Finora</h1>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              v1.1
            </span>
          </div>
          <p className="text-xs text-slate-400 font-sans">{statusText}</p>
        </div>

        {/* Progress Bar 100% GPU-Accelerated (scaleX transform, 0 reflow) */}
        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: duration / 1000, ease: [0.22, 1, 0.36, 1] }}
            style={{ originX: 0, willChange: "transform" }}
            className="w-full h-full bg-white rounded-full transform-gpu"
          />
        </div>

        {/* Status Indikator Bawah */}
        <div className="mt-8 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Sistem Finansial Siap</span>
        </div>
      </div>
    </motion.div>
  );
}
