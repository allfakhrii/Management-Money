import os
import uuid
import hashlib
import secrets
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), bytes.fromhex(salt), 100000)
    return salt + "$" + key.hex()

# Coba memuat file .env lokal jika ada
def load_env_file():
    for path in [".env", "../.env", "backend/.env"]:
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            k = k.strip()
                            v = v.strip().strip("'\"")
                            if k and not os.environ.get(k):
                                os.environ[k] = v
            except Exception:
                pass

load_env_file()

# Kredensial Resmi Supabase Finora (cmydpzqqslcrxjigxbyl)
SUPABASE_URL = "https://cmydpzqqslcrxjigxbyl.supabase.co"
SUPABASE_KEY = "sb_publishable_azfN3McbIL1-LQ_P3_tHdQ_csTa3czI"

import socket
import urllib.parse
import time

_supabase_reachable = None
_last_dns_check = 0.0

def check_supabase_dns() -> bool:
    global _supabase_reachable, _last_dns_check
    now = time.time()
    # Cache pengecekan DNS selama 20 detik agar responsif dan hemat sumber daya
    if _supabase_reachable is not None and (now - _last_dns_check) < 20.0:
        return _supabase_reachable

    if not SUPABASE_URL:
        _supabase_reachable = False
        _last_dns_check = now
        return False

    try:
        parsed = urllib.parse.urlparse(SUPABASE_URL)
        host = parsed.netloc or parsed.path
        if ":" in host:
            host = host.split(":")[0]
        socket.getaddrinfo(host, 443, socket.AF_UNSPEC, socket.SOCK_STREAM)
        _supabase_reachable = True
    except Exception as e:
        print(f"[DATABASE NOTICE] Supabase belum aktif atau sedang di-pause: {e}. Mengaktifkan mode cadangan in-memory.")
        _supabase_reachable = False

    _last_dns_check = now
    return _supabase_reachable

supabase_client = None
if SUPABASE_URL and SUPABASE_KEY and SUPABASE_URL.startswith("http"):
    try:
        from supabase import create_client
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("[DATABASE] Inisialisasi Supabase client siap.")
    except Exception as e:
        print(f"[DATABASE] Gagal inisialisasi Supabase client: {e}. Menggunakan in-memory database.")
else:
    print("[DATABASE] SUPABASE_URL atau SUPABASE_KEY belum terpasang. Menggunakan in-memory database lokal.")

def is_supabase_active() -> bool:
    return supabase_client is not None and check_supabase_dns()

def get_database_status() -> str:
    if supabase_client is None:
        return "in_memory_local"
    if not check_supabase_dns():
        return "supabase_paused"
    return "supabase_postgresql"

# ==========================================
# IN-MEMORY DATABASE FALLBACK
# ==========================================
DEMO_USER_ID = "00000000-0000-0000-0000-000000000001"

db_users_memory: List[Dict[str, Any]] = [
    {
        "id": DEMO_USER_ID,
        "email": "demo@finora.id",
        "password_hash": hash_password("password123"),
        "full_name": "Demo Finora",
        "created_at": "2026-10-01T00:00:00Z"
    }
]

db_transactions_memory: List[Dict[str, Any]] = [
    {
        "id": str(uuid.uuid4()),
        "user_id": DEMO_USER_ID,
        "title": "Gaji Bulanan",
        "amount": 12500000.0,
        "type": "income",
        "category": "Gaji",
        "created_at": "2026-10-25T09:00:00Z"
    },
    {
        "id": str(uuid.uuid4()),
        "user_id": DEMO_USER_ID,
        "title": "Hasil Proyek Freelance UI/UX",
        "amount": 4500000.0,
        "type": "income",
        "category": "Investasi",
        "created_at": "2026-10-26T14:30:00Z"
    },
    {
        "id": str(uuid.uuid4()),
        "user_id": DEMO_USER_ID,
        "title": "Belanja Kebutuhan Pokok",
        "amount": 1850000.0,
        "type": "expense",
        "category": "Kebutuhan",
        "created_at": "2026-10-27T11:15:00Z"
    },
    {
        "id": str(uuid.uuid4()),
        "user_id": DEMO_USER_ID,
        "title": "Langganan Internet & Cloud Hosting",
        "amount": 650000.0,
        "type": "expense",
        "category": "Tagihan",
        "created_at": "2026-10-28T16:00:00Z"
    },
    {
        "id": str(uuid.uuid4()),
        "user_id": DEMO_USER_ID,
        "title": "Tiket Nonton & Makan Akhir Pekan",
        "amount": 350000.0,
        "type": "expense",
        "category": "Hiburan",
        "created_at": "2026-10-29T13:00:00Z"
    },
    {
        "id": str(uuid.uuid4()),
        "user_id": DEMO_USER_ID,
        "title": "Gaji September",
        "amount": 12000000.0,
        "type": "income",
        "category": "Gaji",
        "created_at": "2026-09-25T09:00:00Z"
    },
    {
        "id": str(uuid.uuid4()),
        "user_id": DEMO_USER_ID,
        "title": "Belanja Bulanan September",
        "amount": 2100000.0,
        "type": "expense",
        "category": "Kebutuhan",
        "created_at": "2026-09-27T10:00:00Z"
    }
]

db_savings_goals_memory: List[Dict[str, Any]] = [
    {
        "id": str(uuid.uuid4()),
        "user_id": DEMO_USER_ID,
        "title": "Laptop Kerja Apple MacBook Pro",
        "target_amount": 24000000.0,
        "current_amount": 16800000.0,
        "category": "Gadget",
        "target_date": "2026-12-31",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "is_completed": False
    },
    {
        "id": str(uuid.uuid4()),
        "user_id": DEMO_USER_ID,
        "title": "Pos Cadangan Dana Darurat 6 Bulan",
        "target_amount": 30000000.0,
        "current_amount": 22500000.0,
        "category": "Dana Darurat",
        "target_date": "2027-06-30",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "is_completed": False
    }
]

# ==========================================
# 1. METODE PENGGUNA (AUTH)
# ==========================================
def db_get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    clean = email.strip().lower()
    if is_supabase_active():
        try:
            res = supabase_client.table("users").select("*").eq("email", clean).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
        except Exception as e:
            global _supabase_reachable
            _supabase_reachable = False
            print(f"[DB FALLBACK] Supabase tidak dapat diakses saat get_user_by_email: {e}")
    # Fallback ke memori lokal
    return next((u for u in db_users_memory if u["email"].lower() == clean), None)

def db_get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    if is_supabase_active():
        try:
            res = supabase_client.table("users").select("*").eq("id", user_id).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
        except Exception as e:
            global _supabase_reachable
            _supabase_reachable = False
            print(f"[DB FALLBACK] Supabase tidak dapat diakses saat get_user_by_id: {e}")
    # Fallback ke memori lokal
    return next((u for u in db_users_memory if u["id"] == user_id), None)

def db_create_user(user_data: Dict[str, Any]) -> Dict[str, Any]:
    if is_supabase_active():
        try:
            res = supabase_client.table("users").insert(user_data).execute()
            return res.data[0]
        except Exception as e:
            global _supabase_reachable
            _supabase_reachable = False
            print(f"[DB FALLBACK] Supabase error saat create_user ({e}), menyimpan ke memori lokal.")
    # Simpan ke memori lokal jika Supabase offline / error
    if not any(u["id"] == user_data["id"] for u in db_users_memory):
        db_users_memory.append(user_data)
    return user_data

# ==========================================
# 2. METODE TRANSAKSI
# ==========================================
def db_get_transactions(user_id: str) -> List[Dict[str, Any]]:
    if is_supabase_active():
        try:
            res = supabase_client.table("transactions").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
            for row in res.data:
                row["amount"] = float(row["amount"])
            return res.data
        except Exception as e:
            global _supabase_reachable
            _supabase_reachable = False
            print(f"[DB FALLBACK] get_transactions: {e}")
    return [t for t in db_transactions_memory if t["user_id"] == user_id]

def db_create_transaction(tx_data: Dict[str, Any]) -> Dict[str, Any]:
    if is_supabase_active():
        try:
            res = supabase_client.table("transactions").insert(tx_data).execute()
            item = res.data[0]
            item["amount"] = float(item["amount"])
            return item
        except Exception as e:
            global _supabase_reachable
            _supabase_reachable = False
            print(f"[DB FALLBACK] create_transaction error ({e}), menyimpan ke memori lokal.")
    tx_copy = dict(tx_data)
    tx_copy["amount"] = float(tx_copy["amount"])
    db_transactions_memory.append(tx_copy)
    return tx_copy

def db_delete_transaction(tx_id: str, user_id: str) -> bool:
    global db_transactions_memory
    if is_supabase_active():
        try:
            supabase_client.table("transactions").delete().eq("id", tx_id).eq("user_id", user_id).execute()
            return True
        except Exception as e:
            global _supabase_reachable
            _supabase_reachable = False
            print(f"[DB FALLBACK] delete_transaction: {e}")
    before = len(db_transactions_memory)
    db_transactions_memory = [t for t in db_transactions_memory if not (t["id"] == tx_id and t["user_id"] == user_id)]
    return len(db_transactions_memory) < before

# ==========================================
# 3. METODE TARGET TABUNGAN (SAVINGS GOALS)
# ==========================================
def db_get_savings_goals(user_id: str) -> List[Dict[str, Any]]:
    if is_supabase_active():
        try:
            res = supabase_client.table("savings_goals").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
            for row in res.data:
                row["target_amount"] = float(row["target_amount"])
                row["current_amount"] = float(row.get("current_amount") or 0.0)
            return res.data
        except Exception as e:
            global _supabase_reachable
            _supabase_reachable = False
            print(f"[DB FALLBACK] get_savings_goals: {e}")
    return [g for g in db_savings_goals_memory if g["user_id"] == user_id]

def db_create_savings_goal(goal_data: Dict[str, Any]) -> Dict[str, Any]:
    if is_supabase_active():
        try:
            res = supabase_client.table("savings_goals").insert(goal_data).execute()
            item = res.data[0]
            item["target_amount"] = float(item["target_amount"])
            item["current_amount"] = float(item.get("current_amount") or 0.0)
            return item
        except Exception as e:
            global _supabase_reachable
            _supabase_reachable = False
            print(f"[DB FALLBACK] create_savings_goal error ({e}), menyimpan ke memori lokal.")
    g_copy = dict(goal_data)
    g_copy["target_amount"] = float(g_copy["target_amount"])
    g_copy["current_amount"] = float(g_copy.get("current_amount") or 0.0)
    db_savings_goals_memory.append(g_copy)
    return g_copy

def db_deposit_savings_goal(goal_id: str, user_id: str, amount: float) -> Optional[Dict[str, Any]]:
    if is_supabase_active():
        try:
            res = supabase_client.table("savings_goals").select("*").eq("id", goal_id).eq("user_id", user_id).execute()
            if res.data and len(res.data) > 0:
                current_goal = res.data[0]
                new_amount = float(current_goal["current_amount"]) + amount
                target_amount = float(current_goal["target_amount"])
                is_completed = new_amount >= target_amount

                update_res = supabase_client.table("savings_goals").update({
                    "current_amount": new_amount,
                    "is_completed": is_completed
                }).eq("id", goal_id).eq("user_id", user_id).execute()

                item = update_res.data[0]
                item["target_amount"] = float(item["target_amount"])
                item["current_amount"] = float(item["current_amount"])
                return item
        except Exception as e:
            global _supabase_reachable
            _supabase_reachable = False
            print(f"[DB FALLBACK] deposit_savings_goal: {e}")

    goal = next((g for g in db_savings_goals_memory if g["id"] == goal_id and g["user_id"] == user_id), None)
    if not goal:
        return None
    goal["current_amount"] += amount
    if goal["current_amount"] >= goal["target_amount"]:
        goal["is_completed"] = True
    return goal

def db_delete_savings_goal(goal_id: str, user_id: str) -> bool:
    global db_savings_goals_memory
    if is_supabase_active():
        try:
            supabase_client.table("savings_goals").delete().eq("id", goal_id).eq("user_id", user_id).execute()
            return True
        except Exception as e:
            global _supabase_reachable
            _supabase_reachable = False
            print(f"[DB FALLBACK] delete_savings_goal: {e}")
    before = len(db_savings_goals_memory)
    db_savings_goals_memory = [g for g in db_savings_goals_memory if not (g["id"] == goal_id and g["user_id"] == user_id)]
    return len(db_savings_goals_memory) < before
