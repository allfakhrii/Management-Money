from fastapi import FastAPI, HTTPException, status, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Literal, Optional, Dict
from datetime import datetime, timezone
import uuid
import csv
import io

app = FastAPI(title="Money Management & Savings Goals API", version="1.3.0")

# Setup CORS agar Frontend Vite dapat berkomunikasi lancar
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 1. MODEL TRANSAKSI
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
# 2. MODEL TARGET MENABUNG (SAVINGS GOALS)
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
    created_at: str
    is_completed: bool

# ==========================================
# 3. MODEL REKAPITULASI (HARIAN & BULANAN)
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
# 4. DATABASE IN-MEMORY
# ==========================================
db_transactions: List[Transaction] = [
    Transaction(
        id=str(uuid.uuid4()),
        title="Gaji Bulanan",
        amount=12500000.0,
        type="income",
        category="Gaji",
        created_at="2026-10-25T09:00:00Z"
    ),
    Transaction(
        id=str(uuid.uuid4()),
        title="Hasil Proyek Freelance UI/UX",
        amount=4500000.0,
        type="income",
        category="Investasi",
        created_at="2026-10-26T14:30:00Z"
    ),
    Transaction(
        id=str(uuid.uuid4()),
        title="Belanja Kebutuhan Pokok",
        amount=1850000.0,
        type="expense",
        category="Kebutuhan",
        created_at="2026-10-27T11:15:00Z"
    ),
    Transaction(
        id=str(uuid.uuid4()),
        title="Langganan Internet & Cloud Hosting",
        amount=650000.0,
        type="expense",
        category="Tagihan",
        created_at="2026-10-28T16:00:00Z"
    ),
    Transaction(
        id=str(uuid.uuid4()),
        title="Tiket Nonton & Makan Akhir Pekan",
        amount=350000.0,
        type="expense",
        category="Hiburan",
        created_at="2026-10-29T13:00:00Z"
    ),
    # Data bulan sebelumnya untuk membuktikan rekapitulasi multi-bulan
    Transaction(
        id=str(uuid.uuid4()),
        title="Gaji September",
        amount=12000000.0,
        type="income",
        category="Gaji",
        created_at="2026-09-25T09:00:00Z"
    ),
    Transaction(
        id=str(uuid.uuid4()),
        title="Belanja Bulanan September",
        amount=2100000.0,
        type="expense",
        category="Kebutuhan",
        created_at="2026-09-27T10:00:00Z"
    )
]

db_savings_goals: List[SavingsGoal] = [
    SavingsGoal(
        id=str(uuid.uuid4()),
        title="Laptop Kerja Apple MacBook Pro",
        target_amount=24000000.0,
        current_amount=16800000.0,
        category="Gadget",
        target_date="2026-12-31",
        created_at=datetime.now(timezone.utc).isoformat(),
        is_completed=False
    ),
    SavingsGoal(
        id=str(uuid.uuid4()),
        title="Pos Cadangan Dana Darurat 6 Bulan",
        target_amount=30000000.0,
        current_amount=22500000.0,
        category="Dana Darurat",
        target_date="2027-06-30",
        created_at=datetime.now(timezone.utc).isoformat(),
        is_completed=False
    )
]

# ==========================================
# 5. ENDPOINTS TRANSAKSI
# ==========================================
@app.get("/api/transactions", response_model=List[Transaction])
def get_transactions(
    search: Optional[str] = Query(None, description="Cari judul transaksi"),
    type: Optional[str] = Query(None, description="Filter income atau expense"),
    category: Optional[str] = Query(None, description="Filter kategori transaksi")
):
    results = db_transactions
    if type and type in ["income", "expense"]:
        results = [t for t in results if t.type == type]
    if category and category.lower() != "semua":
        results = [t for t in results if t.category.lower() == category.lower()]
    if search:
        s = search.strip().lower()
        results = [t for t in results if s in t.title.lower() or s in t.category.lower()]

    return sorted(results, key=lambda x: x.created_at, reverse=True)

@app.post("/api/transactions", response_model=Transaction, status_code=status.HTTP_201_CREATED)
def create_transaction(payload: TransactionCreate):
    created_date = payload.date if payload.date else datetime.now(timezone.utc).isoformat()
    new_item = Transaction(
        id=str(uuid.uuid4()),
        title=payload.title,
        amount=payload.amount,
        type=payload.type,
        category=payload.category,
        created_at=created_date
    )
    db_transactions.append(new_item)
    return new_item

@app.delete("/api/transactions/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(transaction_id: str):
    global db_transactions
    item = next((t for t in db_transactions if t.id == transaction_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Transaksi tidak ditemukan")
    db_transactions = [t for t in db_transactions if t.id != transaction_id]
    return None

@app.get("/api/summary", response_model=SummaryResponse)
def get_summary():
    total_income = sum(t.amount for t in db_transactions if t.type == "income")
    total_expense = sum(t.amount for t in db_transactions if t.type == "expense")
    total_balance = total_income - total_expense

    savings_rate = 0.0
    if total_income > 0:
        savings_rate = max(0.0, round(((total_income - total_expense) / total_income) * 100, 1))

    category_map = {}
    for t in db_transactions:
        if t.type == "expense":
            category_map[t.category] = category_map.get(t.category, 0.0) + t.amount

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
        transaction_count=len(db_transactions),
        category_breakdown=breakdown
    )

@app.get("/api/export/csv")
def export_csv():
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Tanggal", "Judul", "Tipe", "Kategori", "Nominal (IDR)"])
    for t in sorted(db_transactions, key=lambda x: x.created_at, reverse=True):
        writer.writerow([t.id, t.created_at, t.title, t.type, t.category, t.amount])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=money_dashboard_export.csv"}
    )

# ==========================================
# 6. ENDPOINTS REKAPITULASI (HARIAN & BULANAN)
# ==========================================
MONTH_NAMES = [
    "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
]

@app.get("/api/recap", response_model=RecapResponse)
def get_recap(
    period: Literal["monthly", "daily"] = Query("monthly", description="Pilihan rekap harian atau bulanan")
):
    grouped: Dict[str, List[Transaction]] = {}

    for tx in db_transactions:
        # Format created_at (ISO standard)
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

        # Format Label yang ramah pengguna
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
# 7. ENDPOINTS TARGET MENABUNG (SAVINGS GOALS)
# ==========================================
@app.get("/api/savings-goals", response_model=List[SavingsGoal])
def get_savings_goals():
    return sorted(db_savings_goals, key=lambda x: x.created_at, reverse=True)

@app.post("/api/savings-goals", response_model=SavingsGoal, status_code=status.HTTP_201_CREATED)
def create_savings_goal(payload: SavingsGoalCreate):
    new_goal = SavingsGoal(
        id=str(uuid.uuid4()),
        title=payload.title,
        target_amount=payload.target_amount,
        current_amount=payload.current_amount,
        category=payload.category,
        target_date=payload.target_date,
        created_at=datetime.now(timezone.utc).isoformat(),
        is_completed=payload.current_amount >= payload.target_amount
    )
    db_savings_goals.append(new_goal)

    if payload.current_amount > 0:
        db_transactions.append(
            Transaction(
                id=str(uuid.uuid4()),
                title=f"Setoran Awal Tabungan: {payload.title}",
                amount=payload.current_amount,
                type="expense",
                category="Investasi",
                created_at=datetime.now(timezone.utc).isoformat()
            )
        )

    return new_goal

@app.post("/api/savings-goals/{goal_id}/deposit", response_model=SavingsGoal)
def deposit_to_savings_goal(goal_id: str, payload: SavingsGoalDeposit):
    global db_savings_goals, db_transactions
    goal = next((g for g in db_savings_goals if g.id == goal_id), None)
    if not goal:
        raise HTTPException(status_code=404, detail="Target tabungan tidak ditemukan")

    goal.current_amount += payload.amount
    if goal.current_amount >= goal.target_amount:
        goal.is_completed = True

    if payload.deduct_from_balance:
        db_transactions.append(
            Transaction(
                id=str(uuid.uuid4()),
                title=f"Nabung Target: {goal.title}",
                amount=payload.amount,
                type="expense",
                category="Investasi",
                created_at=datetime.now(timezone.utc).isoformat()
            )
        )

    return goal

@app.delete("/api/savings-goals/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_savings_goal(goal_id: str):
    global db_savings_goals
    goal = next((g for g in db_savings_goals if g.id == goal_id), None)
    if not goal:
        raise HTTPException(status_code=404, detail="Target tabungan tidak ditemukan")
    db_savings_goals = [g for g in db_savings_goals if g.id != goal_id]
    return None
