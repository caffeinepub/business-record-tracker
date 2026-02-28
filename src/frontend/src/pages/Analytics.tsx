import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Clock } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  useExpenseCategories,
  useMyTransactions,
  usePendingTransactions,
} from "../hooks/useQueries";
import {
  formatDateDDMM,
  formatIndianNumber,
  paiseToRupees,
} from "../utils/formatting";

const CHART_COLORS = [
  "oklch(0.52 0.16 210)",
  "oklch(0.55 0.18 155)",
  "oklch(0.58 0.22 28)",
  "oklch(0.72 0.17 60)",
  "oklch(0.60 0.14 280)",
];

export function Analytics() {
  const { data: transactions, isLoading: txnLoading } = useMyTransactions();
  const { data: categories, isLoading: catLoading } = useExpenseCategories();
  const { data: pending, isLoading: pendingLoading } = usePendingTransactions();

  // ─── Daily Revenue (last 30 days) ─────────────────────────────────────────
  const dailyData = useMemo(() => {
    if (!transactions) return [];
    const today = new Date();
    const dayMap = new Map<string, { sales: number; expenses: number }>();

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      dayMap.set(key, { sales: 0, expenses: 0 });
    }

    for (const t of transactions) {
      const entry = dayMap.get(t.date);
      if (!entry) continue;
      const amount = paiseToRupees(t.amount);
      if (t.transactionType === "Sale") {
        entry.sales += amount;
      } else {
        entry.expenses += amount;
      }
    }

    return Array.from(dayMap.entries()).map(([date, val]) => ({
      date: formatDateDDMM(date),
      Sales: Math.round(val.sales),
      Expenses: Math.round(val.expenses),
    }));
  }, [transactions]);

  // ─── Monthly Profit Trend (last 12 months) ────────────────────────────────
  const monthlyData = useMemo(() => {
    if (!transactions) return [];
    const today = new Date();
    const monthMap = new Map<string, { profit: number; label: string }>();

    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString("en-IN", {
        month: "short",
        year: "2-digit",
      });
      monthMap.set(key, { profit: 0, label });
    }

    for (const t of transactions) {
      const key = t.date.substring(0, 7);
      const entry = monthMap.get(key);
      if (!entry) continue;
      const amount = paiseToRupees(t.amount);
      if (t.transactionType === "Sale") {
        entry.profit += amount;
      } else {
        entry.profit -= amount;
      }
    }

    return Array.from(monthMap.values()).map((v) => ({
      month: v.label,
      Profit: Math.round(v.profit),
    }));
  }, [transactions]);

  // ─── Expense Categories for PieChart ──────────────────────────────────────
  const pieData = useMemo(() => {
    if (!categories) return [];
    return categories.map(([name, amount]) => ({
      name,
      value: Math.round(paiseToRupees(amount)),
    }));
  }, [categories]);

  // ─── Pending summary ──────────────────────────────────────────────────────
  const pendingTotal = useMemo(() => {
    if (!pending) return 0;
    return pending.reduce((sum, t) => sum + paiseToRupees(t.amount), 0);
  }, [pending]);

  const isLoading = txnLoading || catLoading || pendingLoading;

  return (
    <div className="flex flex-col pb-4">
      <div className="px-4 pt-5 pb-4">
        <h2 className="text-xl font-bold text-foreground">Analytics</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Your business performance at a glance
        </p>
      </div>

      {/* Daily Revenue Bar Chart */}
      <Section title="Daily Revenue (Last 30 Days)" delay={0}>
        {txnLoading ? (
          <ChartSkeleton />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={dailyData}
              margin={{ top: 5, right: 5, left: -25, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.9 0.01 220)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "oklch(0.55 0.02 230)" }}
                tickLine={false}
                axisLine={false}
                interval={6}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "oklch(0.55 0.02 230)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`
                }
              />
              <Tooltip
                formatter={(val: number) => [formatIndianNumber(val), ""]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid oklch(0.9 0.015 220)",
                  fontSize: "12px",
                }}
              />
              <Legend iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
              <Bar
                dataKey="Sales"
                fill="oklch(0.52 0.16 210)"
                radius={[3, 3, 0, 0]}
                maxBarSize={12}
              />
              <Bar
                dataKey="Expenses"
                fill="oklch(0.58 0.22 28)"
                radius={[3, 3, 0, 0]}
                maxBarSize={12}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Section>

      {/* Monthly Profit Line Chart */}
      <Section title="Monthly Profit Trend" delay={0.05}>
        {txnLoading ? (
          <ChartSkeleton />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={monthlyData}
              margin={{ top: 5, right: 5, left: -25, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.9 0.01 220)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: "oklch(0.55 0.02 230)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "oklch(0.55 0.02 230)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`
                }
              />
              <Tooltip
                formatter={(val: number) => [formatIndianNumber(val), "Profit"]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid oklch(0.9 0.015 220)",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="Profit"
                stroke="oklch(0.52 0.16 210)"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "oklch(0.52 0.16 210)" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Section>

      {/* Expense Categories Pie Chart */}
      <Section title="Expense by Category" delay={0.1}>
        {catLoading ? (
          <ChartSkeleton />
        ) : pieData.length === 0 ? (
          <EmptyChartState message="No expense data yet" />
        ) : (
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [formatIndianNumber(val), ""]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid oklch(0.9 0.015 220)",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {pieData.map((entry, i) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {entry.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatIndianNumber(entry.value)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* Udhaar Summary */}
      <Section title="Udhaar (Pending Payments)" delay={0.15}>
        {pendingLoading ? (
          <ChartSkeleton height={80} />
        ) : (
          <>
            <div className="flex items-center gap-4 mb-3">
              <div className="flex-1 bg-warning/15 rounded-xl p-3.5 text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  Total Pending
                </p>
                <p className="text-xl font-bold text-warning-foreground">
                  {formatIndianNumber(pendingTotal)}
                </p>
              </div>
              <div className="flex-1 bg-accent rounded-xl p-3.5 text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  Transactions
                </p>
                <p className="text-xl font-bold text-accent-foreground">
                  {pending?.length ?? 0}
                </p>
              </div>
            </div>

            {pending && pending.length > 0 ? (
              <div className="space-y-2">
                {pending.slice(0, 5).map((t) => (
                  <div
                    key={t.id.toString()}
                    className="flex items-center justify-between bg-muted rounded-lg p-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-warning-foreground" />
                      <div>
                        <p className="text-xs font-medium">{t.category}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.date}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-warning-foreground">
                      {formatIndianNumber(paiseToRupees(t.amount))}
                    </p>
                  </div>
                ))}
                {pending.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center pt-1">
                    +{pending.length - 5} more pending
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">No pending payments. All settled!</p>
              </div>
            )}
          </>
        )}
      </Section>

      {isLoading && (
        <p className="text-xs text-muted-foreground text-center mt-2 pb-2">
          Loading analytics data...
        </p>
      )}
    </div>
  );
}

function Section({
  title,
  children,
  delay,
}: {
  title: string;
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="mx-4 mb-4 bg-card rounded-xl shadow-card p-4"
    >
      <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>
      {children}
    </motion.div>
  );
}

function ChartSkeleton({ height = 200 }: { height?: number }) {
  return <Skeleton className={"w-full rounded-lg"} style={{ height }} />;
}

function EmptyChartState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
      <span className="text-3xl mb-2">📊</span>
      <p className="text-sm">{message}</p>
    </div>
  );
}
