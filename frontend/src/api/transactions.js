import { getStoredToken } from "./auth";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
    ? "/api"
    : "http://localhost:8000/api");

function getAuthHeaders(contentType = "application/json") {
  const token = getStoredToken();
  const headers = {};
  if (contentType) {
    headers["Content-Type"] = contentType;
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// ==========================================
// TRANSAKSI
// ==========================================
export async function fetchTransactions(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.append("search", params.search);
  if (params.type && params.type !== "all") query.append("type", params.type);
  if (params.category && params.category !== "Semua") query.append("category", params.category);

  const url = query.toString()
    ? `${API_BASE_URL}/transactions?${query.toString()}`
    : `${API_BASE_URL}/transactions`;

  const res = await fetch(url, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Gagal mengambil data transaksi");
  return res.json();
}

export async function fetchSummary() {
  const res = await fetch(`${API_BASE_URL}/summary`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Gagal mengambil ringkasan keuangan");
  return res.json();
}

export async function createTransaction(payload) {
  const res = await fetch(`${API_BASE_URL}/transactions`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Gagal membuat transaksi baru");
  return res.json();
}

export async function deleteTransaction(id) {
  const res = await fetch(`${API_BASE_URL}/transactions/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Gagal menghapus transaksi");
  return true;
}

export async function downloadExportCsv() {
  const res = await fetch(`${API_BASE_URL}/export/csv`, {
    headers: getAuthHeaders(null),
  });
  if (!res.ok) throw new Error("Gagal mengunduh laporan CSV");
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `finora_export_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export function getExportCsvUrl() {
  return `${API_BASE_URL}/export/csv`;
}

// ==========================================
// REKAPITULASI (HARIAN & BULANAN)
// ==========================================
export async function fetchRecap(period = "monthly") {
  const res = await fetch(`${API_BASE_URL}/recap?period=${period}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Gagal mengambil data rekapitulasi");
  return res.json();
}

// ==========================================
// TARGET MENABUNG (SAVINGS GOALS)
// ==========================================
export async function fetchSavingsGoals() {
  const res = await fetch(`${API_BASE_URL}/savings-goals`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Gagal mengambil daftar target tabungan");
  return res.json();
}

export async function createSavingsGoal(payload) {
  const res = await fetch(`${API_BASE_URL}/savings-goals`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Gagal membuat target tabungan baru");
  return res.json();
}

export async function depositToSavingsGoal(goalId, amount, deductFromBalance = true) {
  const res = await fetch(`${API_BASE_URL}/savings-goals/${goalId}/deposit`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ amount, deduct_from_balance: deductFromBalance }),
  });
  if (!res.ok) throw new Error("Gagal menyetor dana ke target tabungan");
  return res.json();
}

export async function deleteSavingsGoal(goalId) {
  const res = await fetch(`${API_BASE_URL}/savings-goals/${goalId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Gagal menghapus target tabungan");
  return true;
}
