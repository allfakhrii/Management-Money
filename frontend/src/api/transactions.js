const API_BASE_URL = "http://localhost:8000/api";

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

  const res = await fetch(url);
  if (!res.ok) throw new Error("Gagal mengambil data transaksi");
  return res.json();
}

export async function fetchSummary() {
  const res = await fetch(`${API_BASE_URL}/summary`);
  if (!res.ok) throw new Error("Gagal mengambil ringkasan keuangan");
  return res.json();
}

export async function createTransaction(payload) {
  const res = await fetch(`${API_BASE_URL}/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Gagal membuat transaksi baru");
  return res.json();
}

export async function deleteTransaction(id) {
  const res = await fetch(`${API_BASE_URL}/transactions/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Gagal menghapus transaksi");
  return true;
}

export function getExportCsvUrl() {
  return `${API_BASE_URL}/export/csv`;
}

// ==========================================
// REKAPITULASI (HARIAN & BULANAN)
// ==========================================
export async function fetchRecap(period = "monthly") {
  const res = await fetch(`${API_BASE_URL}/recap?period=${period}`);
  if (!res.ok) throw new Error("Gagal mengambil data rekapitulasi");
  return res.json();
}

// ==========================================
// TARGET MENABUNG (SAVINGS GOALS)
// ==========================================
export async function fetchSavingsGoals() {
  const res = await fetch(`${API_BASE_URL}/savings-goals`);
  if (!res.ok) throw new Error("Gagal mengambil daftar target tabungan");
  return res.json();
}

export async function createSavingsGoal(payload) {
  const res = await fetch(`${API_BASE_URL}/savings-goals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Gagal membuat target tabungan baru");
  return res.json();
}

export async function depositToSavingsGoal(goalId, amount, deductFromBalance = true) {
  const res = await fetch(`${API_BASE_URL}/savings-goals/${goalId}/deposit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, deduct_from_balance: deductFromBalance }),
  });
  if (!res.ok) throw new Error("Gagal menyetor dana ke target tabungan");
  return res.json();
}

export async function deleteSavingsGoal(goalId) {
  const res = await fetch(`${API_BASE_URL}/savings-goals/${goalId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Gagal menghapus target tabungan");
  return true;
}
