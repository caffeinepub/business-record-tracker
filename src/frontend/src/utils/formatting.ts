/**
 * Formats a number in Indian numbering system with ₹ prefix
 * e.g. 100000 → ₹1,00,000
 */
export function formatIndianNumber(amount: number): string {
  const absAmount = Math.abs(amount);
  const str = absAmount.toFixed(2);
  const [intPart, decPart] = str.split(".");
  let result = "";
  const n = intPart.length;
  if (n <= 3) {
    result = intPart;
  } else {
    const firstPart = intPart.slice(0, n - 3);
    const lastThree = intPart.slice(n - 3);
    result = `${firstPart.replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${lastThree}`;
  }
  return `${amount < 0 ? "-" : ""}₹${result}.${decPart}`;
}

/**
 * Converts paise (bigint) to rupees (number)
 */
export function paiseToRupees(paise: bigint): number {
  return Number(paise) / 100;
}

/**
 * Converts rupees (number) to paise (bigint)
 */
export function rupeesToPaise(rupees: number): bigint {
  return BigInt(Math.round(rupees * 100));
}

/**
 * Formats a date string (YYYY-MM-DD) to display format (DD MMM)
 */
export function formatDateShort(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

/**
 * Formats a date string (YYYY-MM-DD) to dd/MM
 */
export function formatDateDDMM(dateStr: string): string {
  const parts = dateStr.split("-");
  return `${parts[2]}/${parts[1]}`;
}

/**
 * Returns today's date as YYYY-MM-DD
 */
export function getTodayString(): string {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Returns current year and month as strings
 */
export function getCurrentYearMonth(): { year: string; month: string } {
  const today = new Date();
  return {
    year: String(today.getFullYear()),
    month: String(today.getMonth() + 1).padStart(2, "0"),
  };
}

/**
 * Exports transactions to CSV and triggers download
 */
export function exportTransactionsToCSV(
  transactions: Array<{
    id: bigint;
    date: string;
    transactionType: string;
    category: string;
    amount: bigint;
    paymentStatus: string;
    notes: string;
  }>,
  filename = "transactions.csv",
): void {
  const headers = [
    "Date",
    "Type",
    "Category",
    "Amount (₹)",
    "Payment Status",
    "Notes",
  ];
  const rows = transactions.map((t) => [
    t.date,
    t.transactionType,
    t.category,
    (Number(t.amount) / 100).toFixed(2),
    t.paymentStatus,
    `"${t.notes.replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join(
    "\n",
  );

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Returns start/end dates for a report period
 */
export function getDateRange(period: "week" | "month" | "lastMonth"): {
  start: string;
  end: string;
  label: string;
} {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();
  const d = today.getDate();

  if (period === "week") {
    const dayOfWeek = today.getDay();
    const monday = new Date(y, m, d - ((dayOfWeek + 6) % 7));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      start: toDateString(monday),
      end: toDateString(sunday),
      label: "This Week",
    };
  }
  if (period === "month") {
    return {
      start: `${y}-${String(m + 1).padStart(2, "0")}-01`,
      end: toDateString(today),
      label: `${today.toLocaleString("en-IN", { month: "long" })} ${y}`,
    };
  }
  const lastMonth = m === 0 ? 11 : m - 1;
  const lastMonthYear = m === 0 ? y - 1 : y;
  const lastDay = new Date(lastMonthYear, lastMonth + 1, 0).getDate();
  return {
    start: `${lastMonthYear}-${String(lastMonth + 1).padStart(2, "0")}-01`,
    end: `${lastMonthYear}-${String(lastMonth + 1).padStart(2, "0")}-${lastDay}`,
    label: `${new Date(lastMonthYear, lastMonth, 1).toLocaleString("en-IN", { month: "long" })} ${lastMonthYear}`,
  };
}

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
