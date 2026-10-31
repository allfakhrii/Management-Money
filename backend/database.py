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

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

supabase_client = None
if SUPABASE_URL and SUPABASE_KEY and SUPABASE_URL.startswith("http"):
    try:
        from supabase import create_client
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("[DATABASE] Terhubung ke Supabase PostgreSQL Cloud.")
    except Exception as e:
        print(f"[DATABASE] Gagal terhubung ke Supabase: {e}. Menggunakan in-memory database.")
else:
    print("[DATABASE] SUPABASE_URL belum dikonfigurasi. Menggunakan in-memory database lokal.")

def is_supabase_active() -> bool:
    return supabase_client is not None

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
            return None
        except Exception as e:
            print(f"[DB ERROR] get_user_by_email: {e}")
            return None
    return next((u for u in db_users_memory if u["email"].lower() == clean), None)

def db_get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    if is_supabase_active():
        try:
            res = supabase_client.table("users").select("*").eq("id", user_id).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
            return None
        except Exception as e:
            print(f"[DB ERROR] get_user_by_id: {e}")
            return None
    return next((u for u in db_users_memory if u["id"] == user_id), None)

def db_create_user(user_data: Dict[str, Any]) -> Dict[str, Any]:
    if is_supabase_active():
        try:
            res = supabase_client.table("users").insert(user_data).execute()
            return res.data[0]
        except Exception as e:
            print(f"[DB ERROR] create_user: {e}")
            raise e
    db_users_memory.append(user_data)
    return user_data

# ==========================================
# 2. METODE TRANSAKSI
# ==========================================
def db_get_transactions(user_id: str) -> List[Dict[str, Any]]:
    if is_supabase_active():
        try:
            res = supabase_client.table("transactions").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
            # Pastikan amount bertipe float
            for row in res.data:
                row["amount"] = float(row["amount"])
            return res.data
        except Exception as e:
            print(f"[DB ERROR] get_transactions: {e}")
            return []
    return [t for t in db_transactions_memory if t["user_id"] == user_id]

def db_create_transaction(tx_data: Dict[str, Any]) -> Dict[str, Any]:
    if is_supabase_active():
        try:
            res = supabase_client.table("transactions").insert(tx_data).execute()
            item = res.data[0]
            item["amount"] = float(item["amount"])
            return item
        except Exception as e:
            print(f"[DB ERROR] create_transaction: {e}")
            raise e
    db_transactions_memory.append(tx_data)
    return tx_data

def db_delete_transaction(tx_id: str, user_id: str) -> bool:
    global db_transactions_memory
    if is_supabase_active():
        try:
            supabase_client.table("transactions").delete().eq("id", tx_id).eq("user_id", user_id).execute()
            return True
        except Exception as e:
            print(f"[DB ERROR] delete_transaction: {e}")
            return False
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
            print(f"[DB ERROR] get_savings_goals: {e}")
            return []
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
            print(f"[DB ERROR] create_savings_goal: {e}")
            raise e
    db_savings_goals_memory.append(goal_data)
    return goal_data

def db_deposit_savings_goal(goal_id: str, user_id: str, amount: float) -> Optional[Dict[str, Any]]:
    if is_supabase_active():
        try:
            # Ambil data target saat ini
            res = supabase_client.table("savings_goals").select("*").eq("id", goal_id).eq("user_id", user_id).execute()
            if not res.data or len(res.data) == 0:
                return None
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
            print(f"[DB ERROR] deposit_savings_goal: {e}")
            return None

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
            print(f"[DB ERROR] delete_savings_goal: {e}")
            return False
    before = len(db_savings_goals_memory)
    db_savings_goals_memory = [g for g in db_savings_goals_memory if not (g["id"] == goal_id and g["user_id"] == user_id)]
    return len(db_savings_goals_memory) < before
