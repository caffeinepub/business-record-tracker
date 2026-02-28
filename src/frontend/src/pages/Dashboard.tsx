import { Skeleton } from "@/components/ui/skeleton";
import {
  IndianRupee,
  Receipt,
  RefreshCw,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import {
  useDailySummary,
  useMonthlySummary,
  useUserProfile,
} from "../hooks/useQueries";
import {
  formatIndianNumber,
  getCurrentYearMonth,
  getTodayString,
  paiseToRupees,
} from "../utils/formatting";

interface Props {
  onAddTransaction: () => void;
}

export function Dashboard({ onAddTransaction }: Props) {
  const today = getTodayString();
  const { year, month } = getCurrentYearMonth();

  const dailySummary = useDailySummary(today);
  const monthlySummary = useMonthlySummary(year, month);
  const profile = useUserProfile();

  const dailySales = dailySummary.data
    ? paiseToRupees(dailySummary.data[0])
    : 0;
  const dailyExpenses = dailySummary.data
    ? paiseToRupees(dailySummary.data[1])
    : 0;
  const dailyProfit = dailySummary.data
    ? paiseToRupees(dailySummary.data[2])
    : 0;
  const monthlyRevenue = monthlySummary.data
    ? paiseToRupees(monthlySummary.data[0])
    : 0;

  const isLoading = dailySummary.isLoading || monthlySummary.isLoading;
  const profitPositive = dailyProfit >= 0;

  const userName = profile.data?.name ?? "";

  function handleRefresh() {
    void dailySummary.refetch();
    void monthlySummary.refetch();
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="px-4 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
            <h1 className="text-xl font-bold text-foreground mt-0.5">
              {userName
                ? `Hello, ${userName.split(" ")[0]}! 👋`
                : "Welcome back! 👋"}
            </h1>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            className="p-2 rounded-xl bg-muted text-muted-foreground hover:bg-accent transition-colors"
            aria-label="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Today's Summary heading */}
      <div className="px-4 mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Today's Summary
        </p>
      </div>

      {/* Stat Cards Grid */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {/* Sales Card */}
        <StatCard
          title="Today's Sales"
          value={dailySales}
          icon={<ShoppingCart className="h-4 w-4" />}
          gradientClass="card-gradient-teal"
          isLoading={isLoading}
          delay={0}
        />

        {/* Expenses Card */}
        <StatCard
          title="Today's Expenses"
          value={dailyExpenses}
          icon={<Receipt className="h-4 w-4" />}
          gradientClass="card-gradient-red"
          isLoading={isLoading}
          delay={0.05}
        />

        {/* Profit Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl shadow-card p-4 col-span-1"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground">
              Today's Profit/Loss
            </p>
            <div
              className={`p-1.5 rounded-lg ${profitPositive ? "bg-positive-soft" : "bg-negative-soft"}`}
            >
              {profitPositive ? (
                <TrendingUp className="h-3.5 w-3.5 text-positive" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-negative" />
              )}
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-7 w-3/4 mt-1" />
          ) : (
            <p
              className={`text-lg font-bold ${profitPositive ? "text-positive" : "text-negative"}`}
            >
              {formatIndianNumber(dailyProfit)}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-0.5">
            {profitPositive ? "Profit" : "Loss"}
          </p>
        </motion.div>

        {/* Monthly Revenue Card */}
        <StatCard
          title="Monthly Revenue"
          value={monthlyRevenue}
          icon={<IndianRupee className="h-4 w-4" />}
          gradientClass="card-gradient-green"
          isLoading={isLoading}
          delay={0.15}
        />
      </div>

      {/* Quick Tips */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mx-4 mt-5 bg-accent rounded-xl p-4"
      >
        <p className="text-xs font-semibold text-accent-foreground mb-1">
          💡 Quick Tip
        </p>
        <p className="text-sm text-accent-foreground/80">
          Record every transaction to get accurate profit reports. Tap the{" "}
          <strong>+</strong> button to add a sale or expense.
        </p>
      </motion.div>

      {/* CTA to add transaction */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mx-4 mt-3"
      >
        <button
          type="button"
          onClick={onAddTransaction}
          className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all"
        >
          + Add Transaction
        </button>
      </motion.div>

      {/* Footer spacer */}
      <div className="h-4" />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  gradientClass: string;
  isLoading: boolean;
  delay: number;
}

function StatCard({
  title,
  value,
  icon,
  gradientClass,
  isLoading,
  delay,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card rounded-xl shadow-card p-4 overflow-hidden relative"
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-muted-foreground leading-tight">
          {title}
        </p>
        <div className={`p-1.5 rounded-lg ${gradientClass} text-white`}>
          {icon}
        </div>
      </div>
      {isLoading ? (
        <Skeleton className="h-7 w-3/4 mt-1" />
      ) : (
        <p className="text-lg font-bold text-card-foreground truncate">
          {formatIndianNumber(value)}
        </p>
      )}
      <p className="text-xs text-muted-foreground mt-0.5">Total</p>
    </motion.div>
  );
}
