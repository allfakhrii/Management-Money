import React, { useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import { PieChart as PieIcon, BarChart3 as BarIcon } from "lucide-react";

const PALETTE = [
  "#2563eb", // blue-600
  "#059669", // emerald-600
  "#d97706", // amber-600
  "#e11d48", // rose-600
  "#7c3aed", // violet-600
  "#0891b2", // cyan-600
  "#475569", // slate-600
];

export function CategoryChart({ data = [] }) {
  const [chartMode, setChartMode] = useState("donut");

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-72 border border-dashed border-slate-200 rounded-xl bg-slate-50/60 p-6 text-center">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
          <PieIcon className="w-5 h-5" />
        </div>
        <p className="text-sm font-semibold text-slate-700">Belum ada pengeluaran</p>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Tambahkan transaksi dengan jenis pengeluaran untuk melihat visualisasi alokasi dana Anda.
        </p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.category,
    value: item.amount,
    percentage: item.percentage || 0,
  }));

  const formatCurrency = (val) =>
    "Rp " + new Intl.NumberFormat("id-ID").format(val);

  return (
    <div className="space-y-4">
      {/* Switcher Mode Grafik */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Tampilan Diagram
        </span>
        <div className="inline-flex p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setChartMode("donut")}
            aria-label="Tampilan diagram donat"
            className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-all ${
              chartMode === "donut"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>Donat</span>
          </button>
          <button
            type="button"
            onClick={() => setChartMode("bar")}
            aria-label="Tampilan diagram batang"
            className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-all ${
              chartMode === "bar"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <BarIcon className="w-3.5 h-3.5" />
            <span>Batang</span>
          </button>
        </div>
      </div>

      {/* Kontainer Recharts */}
      <div className="w-full h-56">
        <ResponsiveContainer width="100%" height="100%">
          {chartMode === "donut" ? (
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PALETTE[index % PALETTE.length]}
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [formatCurrency(value), "Pengeluaran"]}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#1e293b",
                  borderRadius: "0.5rem",
                  color: "#f8fafc",
                  fontSize: "12px",
                  fontWeight: 500,
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                }}
                itemStyle={{ color: "#f8fafc" }}
              />
            </PieChart>
          ) : (
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: "#475569" }}
                width={70}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(value), "Pengeluaran"]}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#1e293b",
                  borderRadius: "0.5rem",
                  color: "#f8fafc",
                  fontSize: "12px",
                }}
                itemStyle={{ color: "#f8fafc" }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`bar-${index}`}
                    fill={PALETTE[index % PALETTE.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Rincian Kategori Terstruktur dengan Persentase */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        {chartData.map((entry, index) => (
          <div
            key={entry.name}
            className="flex items-center justify-between text-xs py-1 px-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-sm inline-block shrink-0"
                style={{ backgroundColor: PALETTE[index % PALETTE.length] }}
              />
              <span className="font-medium text-slate-700">{entry.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono">
                {entry.percentage ? `${entry.percentage}%` : ""}
              </span>
              <span className="font-semibold text-slate-900 font-mono">
                {formatCurrency(entry.value)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
