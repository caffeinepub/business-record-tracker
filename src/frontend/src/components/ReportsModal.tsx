import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Printer } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Transaction } from "../backend.d.ts";
import {
  exportTransactionsToCSV,
  formatIndianNumber,
  getDateRange,
  paiseToRupees,
} from "../utils/formatting";

interface Props {
  open: boolean;
  onClose: () => void;
  transactions: Transaction[];
}

type Period = "week" | "month" | "lastMonth";

const PERIODS: { value: Period; label: string }[] = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "lastMonth", label: "Last Month" },
];

export function ReportsModal({ open, onClose, transactions }: Props) {
  const [period, setPeriod] = useState<Period>("month");

  const { start, end, label } = getDateRange(period);

  const filtered = useMemo(() => {
    return transactions.filter((t) => t.date >= start && t.date <= end);
  }, [transactions, start, end]);

  const summary = useMemo(() => {
    let totalSales = 0;
    let totalExpenses = 0;
    for (const t of filtered) {
      const amount = paiseToRupees(t.amount);
      if (t.transactionType === "Sale") {
        totalSales += amount;
      } else {
        totalExpenses += amount;
      }
    }
    return {
      totalSales,
      totalExpenses,
      netProfit: totalSales - totalExpenses,
      count: filtered.length,
    };
  }, [filtered]);

  function handleExportCSV() {
    if (filtered.length === 0) {
      toast.error("No transactions in this period");
      return;
    }
    exportTransactionsToCSV(
      filtered,
      `brt-report-${period}-${new Date().toISOString().split("T")[0]}.csv`,
    );
    toast.success(`Exported ${filtered.length} transactions`);
  }

  function handleExportPDF() {
    if (filtered.length === 0) {
      toast.error("No transactions in this period");
      return;
    }
    window.print();
    toast.success("Print dialog opened — save as PDF");
  }

  return (
    <>
      {/* Print-only content */}
      <div className="print-only" style={{ display: "none" }}>
        <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
          <h1 style={{ fontSize: "24px", marginBottom: "4px" }}>
            Business Record Tracker
          </h1>
          <h2 style={{ fontSize: "16px", color: "#555", marginBottom: "20px" }}>
            Report: {label} ({start} to {end})
          </h2>
          <table
            style={{
              borderCollapse: "collapse",
              width: "100%",
              marginBottom: "20px",
            }}
          >
            <tbody>
              <tr>
                <td style={{ padding: "6px 12px 6px 0", fontWeight: "bold" }}>
                  Total Sales:
                </td>
                <td style={{ padding: "6px 0", color: "green" }}>
                  {formatIndianNumber(summary.totalSales)}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "6px 12px 6px 0", fontWeight: "bold" }}>
                  Total Expenses:
                </td>
                <td style={{ padding: "6px 0", color: "red" }}>
                  {formatIndianNumber(summary.totalExpenses)}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "6px 12px 6px 0", fontWeight: "bold" }}>
                  Net Profit:
                </td>
                <td
                  style={{
                    padding: "6px 0",
                    fontWeight: "bold",
                    color: summary.netProfit >= 0 ? "green" : "red",
                  }}
                >
                  {formatIndianNumber(summary.netProfit)}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "6px 12px 6px 0", fontWeight: "bold" }}>
                  Transactions:
                </td>
                <td style={{ padding: "6px 0" }}>{summary.count}</td>
              </tr>
            </tbody>
          </table>
          <table
            style={{
              borderCollapse: "collapse",
              width: "100%",
              fontSize: "12px",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "2px solid #333" }}>
                {["Date", "Type", "Category", "Amount", "Status", "Notes"].map(
                  (h) => (
                    <th key={h} style={{ padding: "6px", textAlign: "left" }}>
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr
                  key={t.id.toString()}
                  style={{ borderBottom: "1px solid #eee" }}
                >
                  <td style={{ padding: "5px" }}>{t.date}</td>
                  <td style={{ padding: "5px" }}>{t.transactionType}</td>
                  <td style={{ padding: "5px" }}>{t.category}</td>
                  <td style={{ padding: "5px" }}>
                    {formatIndianNumber(paiseToRupees(t.amount))}
                  </td>
                  <td style={{ padding: "5px" }}>{t.paymentStatus}</td>
                  <td style={{ padding: "5px" }}>{t.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="w-full max-w-md mx-auto rounded-2xl p-0 overflow-hidden gap-0">
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-border">
            <DialogTitle className="text-lg font-semibold">Reports</DialogTitle>
          </DialogHeader>

          <div className="px-5 py-4 space-y-4 max-h-[75vh] overflow-y-auto no-scrollbar">
            {/* Period Selector */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Select Period
              </p>
              <div className="flex gap-2">
                {PERIODS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPeriod(p.value)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      period === p.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {start} — {end}
              </p>
            </div>

            {/* Summary */}
            <div className="bg-muted rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">{label}</p>
              <SummaryRow
                label="Total Sales"
                value={formatIndianNumber(summary.totalSales)}
                valueClass="text-positive"
              />
              <SummaryRow
                label="Total Expenses"
                value={formatIndianNumber(summary.totalExpenses)}
                valueClass="text-negative"
              />
              <div className="border-t border-border pt-3">
                <SummaryRow
                  label="Net Profit/Loss"
                  value={formatIndianNumber(summary.netProfit)}
                  valueClass={
                    summary.netProfit >= 0
                      ? "text-positive font-bold"
                      : "text-negative font-bold"
                  }
                />
              </div>
              <SummaryRow
                label="Total Transactions"
                value={String(summary.count)}
                valueClass="text-foreground"
              />
            </div>

            {/* Transaction Preview */}
            {filtered.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Transactions ({filtered.length})
                </p>
                <div className="space-y-1.5 max-h-[180px] overflow-y-auto no-scrollbar">
                  {filtered
                    .sort((a, b) => (a.date > b.date ? -1 : 1))
                    .map((t) => (
                      <div
                        key={t.id.toString()}
                        className="flex items-center justify-between bg-card rounded-lg px-3 py-2 shadow-xs"
                      >
                        <div>
                          <p className="text-xs font-medium">
                            {t.category}
                            <span
                              className={`ml-1.5 text-xs ${t.transactionType === "Sale" ? "text-primary" : "text-destructive"}`}
                            >
                              {t.transactionType}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t.date}
                          </p>
                        </div>
                        <p
                          className={`text-sm font-semibold ${t.transactionType === "Sale" ? "text-positive" : "text-negative"}`}
                        >
                          {formatIndianNumber(paiseToRupees(t.amount))}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {filtered.length === 0 && (
              <div className="text-center py-8">
                <span className="text-3xl">📋</span>
                <p className="text-sm text-muted-foreground mt-2">
                  No transactions found for this period
                </p>
              </div>
            )}
          </div>

          {/* Export Buttons */}
          <div className="px-5 pb-5 pt-3 border-t border-border flex gap-3">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleExportCSV}
            >
              <Download className="h-4 w-4" />
              CSV
            </Button>
            <Button
              className="flex-1 gap-2 bg-primary hover:bg-primary/90"
              onClick={handleExportPDF}
            >
              <Printer className="h-4 w-4" />
              PDF (Print)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SummaryRow({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}
