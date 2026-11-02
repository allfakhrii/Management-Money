import { getStoredToken } from "./auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

async function safeJson(res, defaultError = "Terjadi kesalahan pada permintaan data.") {
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(defaultError);
  }
  if (!res.ok) {
    throw new Error(data?.detail || defaultError);
  }
  return data;
}

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
  return safeJson(res, "Gagal mengambil data transaksi");
}

export async function fetchSummary() {
  const res = await fetch(`${API_BASE_URL}/summary`, {
    headers: getAuthHeaders(),
  });
  return safeJson(res, "Gagal mengambil ringkasan keuangan");
}

export async function createTransaction(payload) {
  const res = await fetch(`${API_BASE_URL}/transactions`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return safeJson(res, "Gagal membuat transaksi baru");
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
  return safeJson(res, "Gagal mengambil data rekapitulasi");
}

// ==========================================
// TARGET MENABUNG (SAVINGS GOALS)
// ==========================================
export async function fetchSavingsGoals() {
  const res = await fetch(`${API_BASE_URL}/savings-goals`, {
    headers: getAuthHeaders(),
  });
  return safeJson(res, "Gagal mengambil daftar target tabungan");
}

export async function createSavingsGoal(payload) {
  const res = await fetch(`${API_BASE_URL}/savings-goals`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return safeJson(res, "Gagal membuat target tabungan baru");
}

export async function depositToSavingsGoal(goalId, amount, deductFromBalance = true) {
  const res = await fetch(`${API_BASE_URL}/savings-goals/${goalId}/deposit`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ amount, deduct_from_balance: deductFromBalance }),
  });
  return safeJson(res, "Gagal menyetor dana ke target tabungan");
}

export async function deleteSavingsGoal(goalId) {
  const res = await fetch(`${API_BASE_URL}/savings-goals/${goalId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Gagal menghapus target tabungan");
  return true;
}
