import React, { useState } from "react";
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  ShieldAlert,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { loginUser, registerUser } from "../api/auth";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";

// ==========================================
// KINETIC VAULT UNLOCK ANIMATION (SLEEK FINTECH)
// ==========================================
function KineticVaultUnlock({ user, mode }) {
  const displayName = user?.full_name || "Pengguna Finora";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="text-center py-6 px-4 flex flex-col items-center justify-center select-none"
    >
      {/* Container Dial Brankas & Laser Biometric Ring */}
      <div className="relative w-36 h-36 flex items-center justify-center mb-5">
        {/* Gelombang Denyut Sonar Luar */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0.8 }}
          animate={{ scale: [0.8, 1.45, 1.6], opacity: [0.8, 0.35, 0] }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="absolute inset-0 rounded-full border-2 border-emerald-500/50 pointer-events-none"
        />

        {/* Ring Kompas / Dial Precision Ring Luar */}
        <motion.svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full text-slate-800 pointer-events-none"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Garis-Garis Indikator Presisi Tick */}
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="2 6"
            className="opacity-40"
          />
          {/* Arc Pengunci Emerald */}
          <motion.circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeDasharray="60 200"
            strokeLinecap="round"
            initial={{ strokeDashoffset: 100 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        </motion.svg>

        {/* Core Brankas Finora (Pusat Mekanisme) */}
        <motion.div
          initial={{ scale: 0.85 }}
          animate={{ scale: [0.85, 1.08, 1] }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="relative z-10 w-20 h-20 rounded-2xl bg-slate-950 border border-slate-700/80 shadow-2xl flex items-center justify-center overflow-hidden"
        >
          {/* Subtle Cyber Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:8px_8px] opacity-20 pointer-events-none" />

          {/* Animasi Kunci Mekanikal Terbuka lalu Berubah ke Checkmark Presisi */}
          <div className="relative flex items-center justify-center">
            {/* Ikon Gembok Terbuka */}
            <motion.div
              initial={{ opacity: 1, scale: 1, y: 0 }}
              animate={{
                opacity: [1, 1, 0],
                scale: [1, 1.1, 0.5],
                y: [0, -4, -8],
              }}
              transition={{ duration: 0.6, times: [0, 0.5, 1], ease: "easeInOut" }}
              className="absolute text-emerald-400"
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Gagang Kunci Terangkat Membuka */}
                <motion.path
                  d="M7 11V7a5 5 0 0 1 10 0v2"
                  initial={{ y: 0 }}
                  animate={{ y: -3 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                />
                <rect x="3" y="11" width="18" height="11" rx="3" ry="3" />
                <circle cx="12" cy="16" r="1.5" />
              </svg>
            </motion.div>

            {/* Checkmark Laser Emerald Muncul Menggantikan Gembok */}
            <motion.div
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.55, ease: "easeOut" }}
              className="relative text-emerald-400 flex items-center justify-center"
            >
              <svg
                width="34"
                height="34"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <motion.path
                  d="M20 6L9 17L4 12"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4, delay: 0.6, ease: "easeOut" }}
                />
              </svg>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Informasi Status Kredensial (Sleek Swiss Typography) */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.3 }}
        className="space-y-1.5"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-400 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-semibold tracking-wider uppercase">
            {mode === "register" ? "Akun Baru Diaktifkan" : "Kredensial Terverifikasi"}
          </span>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          Akses Brankas Disetujui
        </h3>
        <p className="text-xs text-slate-500 font-mono">
          Menginisialisasi sesi aman: {displayName}
        </p>

        {/* Precision Progress Bar */}
        <div className="w-48 h-1 bg-slate-200 rounded-full mx-auto mt-3 overflow-hidden">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="h-full bg-emerald-600 rounded-full"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

export function AuthScreen({ onLoginSuccess }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State untuk animasi sukses login/register
  const [successData, setSuccessData] = useState(null);

  const triggerSuccess = (user, currentMode) => {
    setSuccessData({ user, mode: currentMode });
    // Beri jeda 1.2 detik untuk animasi presisi brankas
    setTimeout(() => {
      onLoginSuccess(user);
    }, 1250);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Silakan isi alamat email dan kata sandi.");
      return;
    }

    if (mode === "register" && !fullName.trim()) {
      setError("Silakan masukkan nama lengkap Anda.");
      return;
    }

    if (password.length < 6) {
      setError("Kata sandi minimal terdiri dari 6 karakter.");
      return;
    }

    try {
      setLoading(true);
      let data;
      if (mode === "login") {
        data = await loginUser(email.trim(), password);
      } else {
        data = await registerUser(email.trim(), password, fullName.trim());
      }
      triggerSuccess(data.user, mode);
    } catch (err) {
      setError(err.message || "Terjadi kendala saat autentikasi.");
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = async () => {
    setEmail("demo@finora.id");
    setPassword("password123");
    setError(null);
    try {
      setLoading(true);
      const data = await loginUser("demo@finora.id", "password123");
      triggerSuccess(data.user, "login");
    } catch (err) {
      setError(err.message || "Gagal masuk ke akun demo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 font-sans flex flex-col justify-center items-center px-4 py-8 sm:py-12">
      {/* Decorative Brand Header */}
      <div className="w-full max-w-md mx-auto mb-6 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 text-white font-bold shadow-md mb-3 select-none">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            <rect x="3" y="3" width="7" height="18" rx="2" fill="currentColor" />
            <path d="M14 3H19C20.1046 3 21 3.89543 21 5V10H14V3Z" fill="currentColor" />
            <path d="M14 14H21V19C21 20.1046 20.1046 21 19 21H14V14Z" fill="currentColor" opacity="0.75" />
          </svg>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Finora
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Smart Money Dashboard & Financial Clarity
        </p>
      </div>

      {/* Main Card Auth Container */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-6 sm:p-8"
      >
        <AnimatePresence mode="wait">
          {successData ? (
            <KineticVaultUnlock
              key="vault-unlock"
              user={successData.user}
              mode={successData.mode}
            />
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {/* Switcher Mode: Masuk vs Daftar */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError(null);
                  }}
                  className={`min-h-[40px] text-xs sm:text-sm font-bold rounded-lg transition-all ${
                    mode === "login"
                      ? "bg-white text-slate-950 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Masuk Akun
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError(null);
                  }}
                  className={`min-h-[40px] text-xs sm:text-sm font-bold rounded-lg transition-all ${
                    mode === "register"
                      ? "bg-white text-slate-950 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Daftar Baru
                </button>
              </div>

              {/* Error Notification Alert */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div className="flex-1 font-medium leading-relaxed">{error}</div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form Auth */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "register" && (
                  <div>
                    <label
                      htmlFor="auth-fullname"
                      className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                    >
                      Nama Lengkap
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="auth-fullname"
                        type="text"
                        placeholder="Contoh: Budi Santoso"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full min-h-[44px] pl-10 pr-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none transition-all"
                        required={mode === "register"}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="auth-email"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Alamat Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="auth-email"
                      type="email"
                      placeholder="nama@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full min-h-[44px] pl-10 pr-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="auth-password"
                      className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                    >
                      Kata Sandi
                    </label>
                    {mode === "login" && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        Min. 6 Karakter
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="auth-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full min-h-[44px] pl-10 pr-10 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none transition-all font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      aria-label={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Tombol Submit Utama */}
                <Button
                  type="submit"
                  variant="default"
                  disabled={loading}
                  className="w-full min-h-[44px] py-2.5 text-sm font-bold shadow-md mt-2 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <span>{mode === "login" ? "Masuk ke Finora" : "Buat Akun Sekarang"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Separator / Divider */}
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <span className="relative px-3 bg-white text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Atau Coba Cepat
                </span>
              </div>

              {/* Tombol Cepat Akun Demo (1-Click) */}
              <button
                type="button"
                onClick={handleFillDemo}
                disabled={loading}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Gunakan Akun Demo (1-Klik)</span>
              </button>

              <p className="mt-2 text-center text-[10px] text-slate-400">
                Akun demo sudah terisi contoh data gaji, belanja, wishlist, dan rekap
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Security Reassurance Footer */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Enkripsi Kata Sandi Standar PBKDF2-SHA256
        </span>
        <span className="inline-flex items-center gap-1.5 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Data Keuangan Pribadi & Terisolasi
        </span>
      </div>
    </div>
  );
}
