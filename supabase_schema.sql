-- ==============================================================
-- FINORA DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- Salin dan jalankan skrip ini di: Supabase Dashboard > SQL Editor
-- ==============================================================

-- 1. Tabel Pengguna (Users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Transaksi Keuangan (Transactions)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Target Tabungan & Wishlist (Savings Goals)
CREATE TABLE IF NOT EXISTS public.savings_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target_amount NUMERIC(15, 2) NOT NULL,
    current_amount NUMERIC(15, 2) DEFAULT 0,
    category TEXT DEFAULT 'Barang Impian',
    target_date TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Indeks Performa untuk Pencarian Cepat per Pengguna
CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_savings_goals_user ON public.savings_goals(user_id);

-- 5. Nonaktifkan RLS agar backend API leluasa menulis data
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals DISABLE ROW LEVEL SECURITY;

-- 6. Masukkan Akun Demo Awal (Email: demo@finora.id, Sandi: password123)
DO $$
DECLARE
    v_demo_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'demo@finora.id') THEN
        INSERT INTO public.users (id, email, password_hash, full_name, created_at)
        VALUES (
            v_demo_id,
            'demo@finora.id',
            'd62c5b3648ebbe34df4e15647a507851$4a7da4e8c615e47cbece4091a92ce95454b6c33c2a613dca1b83d1c4a0f44e13',
            'Demo Finora',
            NOW()
        );

        -- Contoh Transaksi Akun Demo
        INSERT INTO public.transactions (user_id, title, amount, type, category, created_at)
        VALUES 
            (v_demo_id, 'Gaji Bulanan', 12500000.00, 'income', 'Gaji', NOW() - INTERVAL '4 days'),
            (v_demo_id, 'Hasil Proyek Freelance UI/UX', 4500000.00, 'income', 'Investasi', NOW() - INTERVAL '3 days'),
            (v_demo_id, 'Belanja Kebutuhan Pokok', 1850000.00, 'expense', 'Kebutuhan', NOW() - INTERVAL '2 days'),
            (v_demo_id, 'Langganan Internet & Cloud Hosting', 650000.00, 'expense', 'Tagihan', NOW() - INTERVAL '1 day'),
            (v_demo_id, 'Tiket Nonton & Makan Akhir Pekan', 350000.00, 'expense', 'Hiburan', NOW());

        -- Contoh Target Tabungan Akun Demo
        INSERT INTO public.savings_goals (user_id, title, target_amount, current_amount, category, target_date, is_completed, created_at)
        VALUES 
            (v_demo_id, 'Laptop Kerja Apple MacBook Pro', 24000000.00, 16800000.00, 'Gadget', '2026-12-31', FALSE, NOW()),
            (v_demo_id, 'Pos Cadangan Dana Darurat 6 Bulan', 30000000.00, 22500000.00, 'Dana Darurat', '2027-06-30', FALSE, NOW());
    END IF;
END $$;
