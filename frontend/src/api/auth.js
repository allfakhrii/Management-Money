const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const TOKEN_KEY = "finora_auth_token";
const USER_KEY = "finora_auth_user";

async function safeParseJson(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    if (!res.ok) {
      throw new Error(`Server error (${res.status}): pastikan backend FastAPI berjalan di port 8000.`);
    }
    throw new Error("Server mengembalikan respons non-JSON yang tidak valid.");
  }
}

// ==========================================
// LOCAL STORAGE HELPERS
// ==========================================
export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

export function setStoredToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (err) {
    console.error("Gagal menyimpan token:", err);
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  try {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  } catch (err) {
    console.error("Gagal menyimpan user:", err);
  }
}

export function clearAuthStorage() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (err) {
    console.error("Gagal membersihkan sesi:", err);
  }
}

// ==========================================
// AUTH API CALLS
// ==========================================
export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await safeParseJson(res);
  if (!res.ok) {
    throw new Error(data.detail || "Gagal masuk. Periksa kembali email dan kata sandi Anda.");
  }

  setStoredToken(data.access_token);
  setStoredUser(data.user);
  return data;
}

export async function registerUser(email, password, fullName) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      full_name: fullName,
    }),
  });

  const data = await safeParseJson(res);
  if (!res.ok) {
    throw new Error(data.detail || "Gagal mendaftar akun baru.");
  }

  setStoredToken(data.access_token);
  setStoredUser(data.user);
  return data;
}

export async function fetchCurrentUser() {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      clearAuthStorage();
      return null;
    }

    const user = await safeParseJson(res);
    setStoredUser(user);
    return user;
  } catch {
    return null;
  }
}

export async function logoutUser() {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
    });
  } catch {
    // Abaikan kegagalan jaringan saat logout
  } finally {
    clearAuthStorage();
  }
}
