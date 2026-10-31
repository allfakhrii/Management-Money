from fastapi import FastAPI, HTTPException, status, Query, Response, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Literal, Optional, Dict, Any
from datetime import datetime, timezone
import uuid
import csv
import io
import hashlib
import secrets
import hmac
import base64
import json

from database import (
    is_supabase_active,
    db_get_user_by_email,
    db_get_user_by_id,
    db_create_user,
    db_get_transactions,
    db_create_transaction,
    db_delete_transaction,
    db_get_savings_goals,
    db_create_savings_goal,
    db_deposit_savings_goal,
    db_delete_savings_goal,
)

app = FastAPI(title="Finora: Money Management, Auth & Savings API", version="2.1.0")

# Setup CORS agar Frontend Vite dapat berkomunikasi lancar
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 1. AUTENTIKASI: SECURITY & JWT HELPERS
# ==========================================
SECRET_KEY = "finora-super-secret-jwt-key-2026"

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), bytes.fromhex(salt), 100000)
    return salt + "$" + key.hex()

def verify_password(stored: str, provided: str) -> bool:
    try:
        salt, key_hex = stored.split("$")
        check_key = hashlib.pbkdf2_hmac("sha256", provided.encode("utf-8"), bytes.fromhex(salt), 100000)
        return hmac.compare_digest(key_hex, check_key.hex())
    except Exception:
        return False

def create_access_token(data: dict) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    payload = data.copy()
    payload["iat"] = int(datetime.now(timezone.utc).timestamp())
    payload["exp"] = payload["iat"] + (30 * 24 * 3600)  # 30 hari aktif
    
    header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    payload_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    signing_input = f"{header_b64}.{payload_b64}"
    signature = hmac.new(SECRET_KEY.encode(), signing_input.encode(), hashlib.sha256).digest()
    sig_b64 = base64.urlsafe_b64encode(signature).decode().rstrip("=")
    return f"{signing_input}.{sig_b64}"

def verify_token(token: str) -> Optional[dict]:
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts
        signing_input = f"{header_b64}.{payload_b64}"
        expected_sig = hmac.new(SECRET_KEY.encode(), signing_input.encode(), hashlib.sha256).digest()
        sig_padded = sig_b64 + "=" * (-len(sig_b64) % 4)
        actual_sig = base64.urlsafe_b64decode(sig_padded)
        if not hmac.compare_digest(expected_sig, actual_sig):
            return None
        payload_padded = payload_b64 + "=" * (-len(payload_b64) % 4)
        payload = json.loads(base64.urlsafe_b64decode(payload_padded).decode())
        exp = payload.get("exp")
        if exp and exp < datetime.now(timezone.utc).timestamp():
            return None
        return payload
    except Exception:
        return None

# ==========================================
# 2. MODEL PENGGUNA (AUTH)
# ==========================================
class UserBase(BaseModel):
    email: str = Field(..., min_length=3, max_length=100)
    full_name: str = Field(..., min_length=2, max_length=100)

class UserCreate(BaseModel):
    email: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=6, max_length=100)
    full_name: str = Field(..., min_length=2, max_length=100)

class UserLogin(BaseModel):
    email: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=6, max_length=100)

class UserResponse(UserBase):
    id: str
    created_at: str

class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# ==========================================
# 3. MODEL TRANSAKSI
# ==========================================
TransactionType = Literal["income", "expense"]

class TransactionBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=100)
    amount: float = Field(..., gt=0)
    type: TransactionType
    category: str = Field(..., min_length=2, max_length=50)

class TransactionCreate(TransactionBase):
    date: Optional[str] = None

class Transaction(TransactionBase):
    id: str
    user_id: str
    created_at: str

class CategoryStat(BaseModel):
    category: str
    amount: float
    percentage: float

class SummaryResponse(BaseModel):
    total_balance: float
    total_income: float
    total_expense: float
    savings_rate: float
    transaction_count: int
    category_breakdown: List[CategoryStat]

# ==========================================
# 4. MODEL TARGET MENABUNG (SAVINGS GOALS)
# ==========================================
class SavingsGoalBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=100)
    target_amount: float = Field(..., gt=0)
    current_amount: float = Field(default=0.0, ge=0)
    category: str = Field(default="Barang Impian", min_length=2, max_length=50)
    target_date: Optional[str] = None

class SavingsGoalCreate(SavingsGoalBase):
    pass

class SavingsGoalDeposit(BaseModel):
    amount: float = Field(..., gt=0)
    deduct_from_balance: bool = True

class SavingsGoal(SavingsGoalBase):
    id: str
    user_id: str
    created_at: str
    is_completed: bool

# ==========================================
# 5. MODEL REKAPITULASI (HARIAN & BULANAN)
# ==========================================
class RecapPeriodItem(BaseModel):
    key: str
    label: str
    period_type: str
    total_income: float
    total_expense: float
    net_flow: float
    transaction_count: int
    transactions: List[Transaction]

class RecapResponse(BaseModel):
    period_type: str
    grand_income: float
    grand_expense: float
    grand_net: float
    items: List[RecapPeriodItem]

# ==========================================
# 6. DEPENDENCY: VERIFIKASI PENGGUNA SAAT INI
# ==========================================
def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Autentikasi diperlukan. Silakan masuk terlebih dahulu."
        )
    token = authorization.split(" ")[1]
    payload = verify_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sesi login Anda telah berakhir. Silakan masuk kembali."
        )
    user = db_get_user_by_id(payload["sub"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Akun pengguna tidak ditemukan."
        )
    return user

# ==========================================
# 7. ENDPOINTS STATUS & DIAGNOSTIK
# ==========================================
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "supabase_postgresql" if is_supabase_active() else "in_memory_local",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# ==========================================
# 8. ENDPOINTS AUTENTIKASI (LOGIN & LOGOUT)
# ==========================================
@app.post("/api/auth/register", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate):
    email_clean = payload.email.strip().lower()
    existing = db_get_user_by_email(email_clean)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email sudah terdaftar. Silakan gunakan email lain atau masuk."
        )
    user_id = str(uuid.uuid4())
    new_user = {
        "id": user_id,
        "email": email_clean,
        "password_hash": hash_password(payload.password),
        "full_name": payload.full_name.strip(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    saved_user = db_create_user(new_user)
    token = create_access_token({"sub": saved_user["id"], "email": saved_user["email"]})
    return AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=str(saved_user["id"]),
            email=saved_user["email"],
            full_name=saved_user["full_name"],
            created_at=str(saved_user["created_at"])
        )
    )

@app.post("/api/auth/login", response_model=AuthTokenResponse)
def login(payload: UserLogin):
    email_clean = payload.email.strip().lower()
    user = db_get_user_by_email(email_clean)
    if not user or not verify_password(user["password_hash"], payload.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau kata sandi tidak sesuai."
        )
    token = create_access_token({"sub": str(user["id"]), "email": user["email"]})
    return AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=str(user["id"]),
            email=user["email"],
            full_name=user["full_name"],
            created_at=str(user["created_at"])
        )
    )

@app.get("/api/auth/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=str(current_user["id"]),
        email=current_user["email"],
        full_name=current_user["full_name"],
        created_at=str(current_user["created_at"])
    )

@app.post("/api/auth/logout")
def logout():
    return {"message": "Berhasil keluar dari sesi."}

# ==========================================
# 9. ENDPOINTS TRANSAKSI (PER PENGGUNA)
# ==========================================
@app.get("/api/transactions", response_model=List[Transaction])
def get_transactions(
    search: Optional[str] = Query(None, description="Cari judul transaksi"),
    type: Optional[str] = Query(None, description="Filter income atau expense"),
    category: Optional[str] = Query(None, description="Filter kategori transaksi"),
    current_user: dict = Depends(get_current_user)
):
    raw_list = db_get_transactions(str(current_user["id"]))
    results = [Transaction(**t) for t in raw_list]

    if type and type in ["income", "expense"]:
        results = [t for t in results if t.type == type]
    if category and category.lower() != "semua":
        results = [t for t in results if t.category.lower() == category.lower()]
    if search:
        s = search.strip().lower()
        results = [t for t in results if s in t.title.lower() or s in t.category.lower()]

    return sorted(results, key=lambda x: x.created_at, reverse=True)

@app.post("/api/transactions", response_model=Transaction, status_code=status.HTTP_201_CREATED)
def create_transaction(
    payload: TransactionCreate,
    current_user: dict = Depends(get_current_user)
):
    created_date = payload.date if payload.date else datetime.now(timezone.utc).isoformat()
    new_data = {
        "id": str(uuid.uuid4()),
        "user_id": str(current_user["id"]),
        "title": payload.title,
        "amount": payload.amount,
        "type": payload.type,
        "category": payload.category,
        "created_at": created_date
    }
    saved = db_create_transaction(new_data)
    return Transaction(**saved)

@app.delete("/api/transactions/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: str,
    current_user: dict = Depends(get_current_user)
):
    success = db_delete_transaction(transaction_id, str(current_user["id"]))
    if not success:
        raise HTTPException(status_code=404, detail="Transaksi tidak ditemukan")
    return None

@app.get("/api/summary", response_model=SummaryResponse)
def get_summary(current_user: dict = Depends(get_current_user)):
    user_tx = db_get_transactions(str(current_user["id"]))
    total_income = sum(t["amount"] for t in user_tx if t["type"] == "income")
    total_expense = sum(t["amount"] for t in user_tx if t["type"] == "expense")
    total_balance = total_income - total_expense

    savings_rate = 0.0
    if total_income > 0:
        savings_rate = max(0.0, round(((total_income - total_expense) / total_income) * 100, 1))

    category_map = {}
    for t in user_tx:
        if t["type"] == "expense":
            cat = t["category"]
            category_map[cat] = category_map.get(cat, 0.0) + t["amount"]

    breakdown = []
    for cat, amt in category_map.items():
        pct = round((amt / total_expense * 100), 1) if total_expense > 0 else 0.0
        breakdown.append(CategoryStat(category=cat, amount=amt, percentage=pct))

    breakdown.sort(key=lambda x: x.amount, reverse=True)

    return SummaryResponse(
        total_balance=total_balance,
        total_income=total_income,
        total_expense=total_expense,
        savings_rate=savings_rate,
        transaction_count=len(user_tx),
        category_breakdown=breakdown
    )

@app.get("/api/export/csv")
def export_csv(current_user: dict = Depends(get_current_user)):
    user_tx = db_get_transactions(str(current_user["id"]))
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Tanggal", "Judul", "Tipe", "Kategori", "Nominal (IDR)"])
    for t in sorted(user_tx, key=lambda x: x["created_at"], reverse=True):
        writer.writerow([t["id"], t["created_at"], t["title"], t["type"], t["category"], t["amount"]])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=finora_export.csv"}
    )

# ==========================================
# 10. ENDPOINTS REKAPITULASI (HARIAN & BULANAN)
# ==========================================
MONTH_NAMES = [
    "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
]

@app.get("/api/recap", response_model=RecapResponse)
def get_recap(
    period: Literal["monthly", "daily"] = Query("monthly", description="Pilihan rekap harian atau bulanan"),
    current_user: dict = Depends(get_current_user)
):
    raw_tx = db_get_transactions(str(current_user["id"]))
    user_tx = [Transaction(**t) for t in raw_tx]
    grouped: Dict[str, List[Transaction]] = {}

    for tx in user_tx:
        try:
            dt = datetime.fromisoformat(tx.created_at.replace("Z", "+00:00"))
        except Exception:
            dt = datetime.now(timezone.utc)

        if period == "monthly":
            key = dt.strftime("%Y-%m")
        else:
            key = dt.strftime("%Y-%m-%d")

        if key not in grouped:
            grouped[key] = []
        grouped[key].append(tx)

    sorted_keys = sorted(grouped.keys(), reverse=True)
    items: List[RecapPeriodItem] = []

    grand_income = 0.0
    grand_expense = 0.0

    for k in sorted_keys:
        tx_list = grouped[k]
        total_inc = sum(t.amount for t in tx_list if t.type == "income")
        total_exp = sum(t.amount for t in tx_list if t.type == "expense")
        net = total_inc - total_exp

        grand_income += total_inc
        grand_expense += total_exp

        if period == "monthly":
            year, month = k.split("-")
            month_idx = int(month)
            label = f"{MONTH_NAMES[month_idx]} {year}"
        else:
            year, month, day = k.split("-")
            month_idx = int(month)
            label = f"{int(day)} {MONTH_NAMES[month_idx]} {year}"

        items.append(
            RecapPeriodItem(
                key=k,
                label=label,
                period_type=period,
                total_income=total_inc,
                total_expense=total_exp,
                net_flow=net,
                transaction_count=len(tx_list),
                transactions=sorted(tx_list, key=lambda x: x.created_at, reverse=True)
            )
        )

    return RecapResponse(
        period_type=period,
        grand_income=grand_income,
        grand_expense=grand_expense,
        grand_net=grand_income - grand_expense,
        items=items
    )

# ==========================================
# 11. ENDPOINTS TARGET MENABUNG (SAVINGS GOALS)
# ==========================================
@app.get("/api/savings-goals", response_model=List[SavingsGoal])
def get_savings_goals(current_user: dict = Depends(get_current_user)):
    user_goals = db_get_savings_goals(str(current_user["id"]))
    results = [SavingsGoal(**g) for g in user_goals]
    return sorted(results, key=lambda x: x.created_at, reverse=True)

@app.post("/api/savings-goals", response_model=SavingsGoal, status_code=status.HTTP_201_CREATED)
def create_savings_goal(
    payload: SavingsGoalCreate,
    current_user: dict = Depends(get_current_user)
):
    new_data = {
        "id": str(uuid.uuid4()),
        "user_id": str(current_user["id"]),
        "title": payload.title,
        "target_amount": payload.target_amount,
        "current_amount": payload.current_amount,
        "category": payload.category,
        "target_date": payload.target_date,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "is_completed": payload.current_amount >= payload.target_amount
    }
    saved_goal = db_create_savings_goal(new_data)

    if payload.current_amount > 0:
        db_create_transaction({
            "id": str(uuid.uuid4()),
            "user_id": str(current_user["id"]),
            "title": f"Setoran Awal Tabungan: {payload.title}",
            "amount": payload.current_amount,
            "type": "expense",
            "category": "Investasi",
            "created_at": datetime.now(timezone.utc).isoformat()
        })

    return SavingsGoal(**saved_goal)

@app.post("/api/savings-goals/{goal_id}/deposit", response_model=SavingsGoal)
def deposit_to_savings_goal(
    goal_id: str,
    payload: SavingsGoalDeposit,
    current_user: dict = Depends(get_current_user)
):
    updated = db_deposit_savings_goal(goal_id, str(current_user["id"]), payload.amount)
    if not updated:
        raise HTTPException(status_code=404, detail="Target tabungan tidak ditemukan")

    if payload.deduct_from_balance:
        db_create_transaction({
            "id": str(uuid.uuid4()),
            "user_id": str(current_user["id"]),
            "title": f"Nabung Target: {updated['title']}",
            "amount": payload.amount,
            "type": "expense",
            "category": "Investasi",
            "created_at": datetime.now(timezone.utc).isoformat()
        })

    return SavingsGoal(**updated)

@app.delete("/api/savings-goals/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_savings_goal(
    goal_id: str,
    current_user: dict = Depends(get_current_user)
):
    success = db_delete_savings_goal(goal_id, str(current_user["id"]))
    if not success:
        raise HTTPException(status_code=404, detail="Target tabungan tidak ditemukan")
    return None
