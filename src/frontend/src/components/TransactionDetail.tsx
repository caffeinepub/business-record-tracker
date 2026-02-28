import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Transaction } from "../backend.d.ts";
import {
  useDeleteTransaction,
  useUpdateTransaction,
} from "../hooks/useQueries";
import { formatIndianNumber, paiseToRupees } from "../utils/formatting";

interface Props {
  transaction: Transaction | null;
  open: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  "Raw Materials",
  "Marketing",
  "Transport",
  "Utilities",
  "Misc",
];

export function TransactionDetail({ transaction, open, onClose }: Props) {
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [date, setDate] = useState(transaction?.date ?? "");
  const [type, setType] = useState(transaction?.transactionType ?? "Sale");
  const [category, setCategory] = useState(transaction?.category ?? "Misc");
  const [amount, setAmount] = useState(
    transaction ? String(paiseToRupees(transaction.amount)) : "",
  );
  const [paymentStatus, setPaymentStatus] = useState(
    transaction?.paymentStatus ?? "Paid",
  );
  const [notes, setNotes] = useState(transaction?.notes ?? "");

  // Sync state when transaction changes
  function syncFromTransaction(t: Transaction) {
    setDate(t.date);
    setType(t.transactionType);
    setCategory(t.category);
    setAmount(String(paiseToRupees(t.amount)));
    setPaymentStatus(t.paymentStatus);
    setNotes(t.notes);
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      setEditing(false);
      onClose();
    }
  }

  function startEditing() {
    if (transaction) {
      syncFromTransaction(transaction);
      setEditing(true);
    }
  }

  async function handleUpdate() {
    if (!transaction) return;
    const parsedAmount = Number.parseFloat(amount);
    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    try {
      await updateTransaction.mutateAsync({
        ...transaction,
        date,
        transactionType: type,
        category,
        amount: BigInt(Math.round(parsedAmount * 100)),
        paymentStatus,
        notes,
      });
      toast.success("Transaction updated");
      setEditing(false);
      onClose();
    } catch {
      toast.error("Failed to update transaction");
    }
  }

  async function handleDelete() {
    if (!transaction) return;
    try {
      await deleteTransaction.mutateAsync(transaction.id);
      toast.success("Transaction deleted");
      setConfirmDelete(false);
      onClose();
    } catch {
      toast.error("Failed to delete transaction");
    }
  }

  if (!transaction) return null;

  const amountDisplay = formatIndianNumber(paiseToRupees(transaction.amount));
  const isSale = transaction.transactionType === "Sale";

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="w-full max-w-md mx-auto rounded-2xl p-0 overflow-hidden gap-0">
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold">
                Transaction Details
              </DialogTitle>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                aria-label="Delete transaction"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </DialogHeader>

          {!editing ? (
            <div className="px-5 py-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{amountDisplay}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {transaction.date}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      isSale
                        ? "bg-accent text-accent-foreground"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {transaction.transactionType}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      transaction.paymentStatus === "Paid"
                        ? "bg-success/15 text-positive"
                        : "bg-warning/20 text-warning-foreground"
                    }`}
                  >
                    {transaction.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="bg-muted rounded-xl p-3 space-y-2.5">
                <Row label="Category" value={transaction.category} />
                {transaction.notes && (
                  <Row label="Notes" value={transaction.notes} />
                )}
              </div>

              <Button
                className="w-full"
                variant="outline"
                onClick={startEditing}
              >
                Edit Transaction
              </Button>
            </div>
          ) : (
            <div className="px-5 py-4 space-y-4 max-h-[65vh] overflow-y-auto no-scrollbar">
              {/* Type Toggle */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-muted-foreground">
                  Type
                </Label>
                <div className="flex rounded-lg border border-border overflow-hidden">
                  {["Sale", "Expense"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`flex-1 py-2.5 text-sm font-medium transition-colors ${t !== "Sale" ? "border-l border-border" : ""} ${
                        type === t
                          ? t === "Sale"
                            ? "bg-primary text-primary-foreground"
                            : "bg-destructive text-destructive-foreground"
                          : "bg-transparent text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {t === "Sale" ? "💰 Sale" : "🧾 Expense"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-muted-foreground">
                  Date
                </Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-muted-foreground">
                  Category
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-muted-foreground">
                  Amount (₹)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    ₹
                  </span>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-10 pl-7"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-muted-foreground">
                  Payment Status
                </Label>
                <div className="flex rounded-lg border border-border overflow-hidden">
                  {["Paid", "Pending"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setPaymentStatus(s)}
                      className={`flex-1 py-2.5 text-sm font-medium transition-colors ${s !== "Paid" ? "border-l border-border" : ""} ${
                        paymentStatus === s
                          ? s === "Paid"
                            ? "bg-success text-success-foreground"
                            : "bg-warning text-warning-foreground"
                          : "bg-transparent text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {s === "Paid" ? "✓ Paid" : "⏳ Pending"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-muted-foreground">
                  Notes
                </Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="resize-none h-20 text-sm"
                  placeholder="Optional notes..."
                />
              </div>

              <div className="flex gap-3 pt-1 pb-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEditing(false)}
                  disabled={updateTransaction.isPending}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleUpdate}
                  disabled={updateTransaction.isPending}
                >
                  {updateTransaction.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this transaction. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteTransaction.isPending}
            >
              {deleteTransaction.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right max-w-[60%] break-words">
        {value}
      </span>
    </div>
  );
}
