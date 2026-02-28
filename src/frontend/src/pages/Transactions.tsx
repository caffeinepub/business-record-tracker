import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Transaction } from "../backend.d.ts";
import { ReportsModal } from "../components/ReportsModal";
import { TransactionDetail } from "../components/TransactionDetail";
import { useMyTransactions } from "../hooks/useQueries";
import {
  formatDateShort,
  formatIndianNumber,
  paiseToRupees,
} from "../utils/formatting";

interface Props {
  onAddTransaction: () => void;
}

type FilterType = "All" | "Sales" | "Expenses" | "Pending";

const FILTERS: FilterType[] = ["All", "Sales", "Expenses", "Pending"];

export function Transactions({ onAddTransaction }: Props) {
  const { data: transactions, isLoading } = useMyTransactions();
  const [filter, setFilter] = useState<FilterType>("All");
  const [search, setSearch] = useState("");
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [showReports, setShowReports] = useState(false);

  const filtered = (transactions ?? [])
    .filter((t) => {
      if (filter === "Sales") return t.transactionType === "Sale";
      if (filter === "Expenses") return t.transactionType === "Expense";
      if (filter === "Pending") return t.paymentStatus === "Pending";
      return true;
    })
    .filter((t) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        t.category.toLowerCase().includes(q) ||
        t.notes.toLowerCase().includes(q) ||
        t.date.includes(q) ||
        t.transactionType.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      // Sort by date descending, then by createdAt
      if (a.date > b.date) return -1;
      if (a.date < b.date) return 1;
      return Number(b.createdAt - a.createdAt);
    });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-foreground">Transactions</h2>
          <button
            type="button"
            onClick={() => setShowReports(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-xs font-semibold hover:bg-accent/80 transition-colors"
          >
            <FileText className="h-3.5 w-3.5" />
            Reports
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by category, date, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 text-sm"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 pb-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {f}
              {f === "Pending" && transactions ? (
                <span className="ml-1.5 bg-warning text-warning-foreground text-xs px-1.5 py-0.5 rounded-full">
                  {
                    transactions.filter((t) => t.paymentStatus === "Pending")
                      .length
                  }
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 no-scrollbar">
        {isLoading ? (
          <div className="space-y-3">
            {["s1", "s2", "s3", "s4", "s5"].map((k) => (
              <Skeleton key={k} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState filter={filter} onAdd={onAddTransaction} />
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-2.5">
              {filtered.map((txn, idx) => (
                <TransactionRow
                  key={txn.id.toString()}
                  transaction={txn}
                  idx={idx}
                  onClick={() => setSelectedTxn(txn)}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      <TransactionDetail
        transaction={selectedTxn}
        open={!!selectedTxn}
        onClose={() => setSelectedTxn(null)}
      />

      <ReportsModal
        open={showReports}
        onClose={() => setShowReports(false)}
        transactions={transactions ?? []}
      />
    </div>
  );
}

function TransactionRow({
  transaction: t,
  idx,
  onClick,
}: {
  transaction: Transaction;
  idx: number;
  onClick: () => void;
}) {
  const isSale = t.transactionType === "Sale";
  const isPaid = t.paymentStatus === "Paid";

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.03 }}
      onClick={onClick}
      className="w-full text-left bg-card rounded-xl shadow-card p-3.5 hover:shadow-md active:scale-[0.98] transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-base ${
              isSale ? "bg-accent text-accent-foreground" : "bg-destructive/10"
            }`}
          >
            {isSale ? "💰" : "🧾"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-semibold text-foreground">
                {t.category}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  isSale
                    ? "bg-accent text-accent-foreground"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {t.transactionType}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground">
                {formatDateShort(t.date)}
              </span>
              {t.notes && (
                <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                  · {t.notes}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 text-right">
          <p
            className={`text-base font-bold ${isSale ? "text-positive" : "text-negative"}`}
          >
            {isSale ? "+" : "-"}
            {formatIndianNumber(paiseToRupees(t.amount))}
          </p>
          <span
            className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${
              isPaid
                ? "bg-positive-soft text-positive"
                : "bg-warning/20 text-warning-foreground"
            }`}
          >
            {t.paymentStatus}
          </span>
        </div>
      </div>
    </motion.button>
  );
}

function EmptyState({
  filter,
  onAdd,
}: {
  filter: FilterType;
  onAdd: () => void;
}) {
  const messages: Record<
    FilterType,
    { emoji: string; title: string; desc: string }
  > = {
    All: {
      emoji: "📊",
      title: "No transactions yet",
      desc: "Add your first sale or expense to start tracking!",
    },
    Sales: {
      emoji: "💰",
      title: "No sales recorded",
      desc: "Record a sale to start seeing revenue data.",
    },
    Expenses: {
      emoji: "🧾",
      title: "No expenses recorded",
      desc: "Add expenses to track where your money is going.",
    },
    Pending: {
      emoji: "⏳",
      title: "No pending payments",
      desc: "Great! All payments are settled. No Udhaar outstanding.",
    },
  };

  const { emoji, title, desc } = messages[filter];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <span className="text-5xl mb-4">{emoji}</span>
      <p className="text-base font-semibold text-foreground mb-1.5">{title}</p>
      <p className="text-sm text-muted-foreground mb-5 max-w-[240px]">{desc}</p>
      {filter !== "Pending" && (
        <button
          type="button"
          onClick={onAdd}
          className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          + Add Transaction
        </button>
      )}
    </motion.div>
  );
}
