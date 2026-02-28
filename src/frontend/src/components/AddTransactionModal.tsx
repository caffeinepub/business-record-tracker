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
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAddTransaction } from "../hooks/useQueries";
import { getTodayString, rupeesToPaise } from "../utils/formatting";

interface Props {
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

export function AddTransactionModal({ open, onClose }: Props) {
  const addTransaction = useAddTransaction();

  const [date, setDate] = useState(getTodayString());
  const [type, setType] = useState<"Sale" | "Expense">("Sale");
  const [category, setCategory] = useState("Misc");
  const [amount, setAmount] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"Paid" | "Pending">(
    "Paid",
  );
  const [notes, setNotes] = useState("");

  function resetForm() {
    setDate(getTodayString());
    setType("Sale");
    setCategory("Misc");
    setAmount("");
    setPaymentStatus("Paid");
    setNotes("");
  }

  async function handleSave() {
    const parsedAmount = Number.parseFloat(amount);
    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!date) {
      toast.error("Please select a date");
      return;
    }
    try {
      await addTransaction.mutateAsync({
        date,
        transactionType: type,
        category,
        amount: rupeesToPaise(parsedAmount),
        paymentStatus,
        notes,
      });
      toast.success("Transaction added successfully");
      resetForm();
      onClose();
    } catch {
      toast.error("Failed to add transaction. Please try again.");
    }
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="w-full max-w-md mx-auto rounded-2xl p-0 overflow-hidden gap-0">
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-border">
          <DialogTitle className="text-lg font-semibold text-foreground">
            Add Transaction
          </DialogTitle>
        </DialogHeader>

        <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar">
          {/* Type Toggle */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-muted-foreground">
              Type
            </Label>
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => setType("Sale")}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  type === "Sale"
                    ? "bg-primary text-primary-foreground"
                    : "bg-transparent text-muted-foreground hover:bg-muted"
                }`}
              >
                💰 Sale
              </button>
              <button
                type="button"
                onClick={() => setType("Expense")}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors border-l border-border ${
                  type === "Expense"
                    ? "bg-destructive text-destructive-foreground"
                    : "bg-transparent text-muted-foreground hover:bg-muted"
                }`}
              >
                🧾 Expense
              </button>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label
              htmlFor="txn-date"
              className="text-sm font-medium text-muted-foreground"
            >
              Date
            </Label>
            <Input
              id="txn-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-10"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-muted-foreground">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label
              htmlFor="txn-amount"
              className="text-sm font-medium text-muted-foreground"
            >
              Amount (₹)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">
                ₹
              </span>
              <Input
                id="txn-amount"
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-10 pl-7"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Payment Status */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-muted-foreground">
              Payment Status
            </Label>
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => setPaymentStatus("Paid")}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  paymentStatus === "Paid"
                    ? "bg-success text-success-foreground"
                    : "bg-transparent text-muted-foreground hover:bg-muted"
                }`}
              >
                ✓ Paid
              </button>
              <button
                type="button"
                onClick={() => setPaymentStatus("Pending")}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors border-l border-border ${
                  paymentStatus === "Pending"
                    ? "bg-warning text-warning-foreground"
                    : "bg-transparent text-muted-foreground hover:bg-muted"
                }`}
              >
                ⏳ Pending (Udhaar)
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label
              htmlFor="txn-notes"
              className="text-sm font-medium text-muted-foreground"
            >
              Notes (optional)
            </Label>
            <Textarea
              id="txn-notes"
              placeholder="Add any notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none h-20 text-sm"
            />
          </div>
        </div>

        <div className="px-5 pb-5 pt-3 border-t border-border flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleClose}
            disabled={addTransaction.isPending}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-primary hover:bg-primary/90"
            onClick={handleSave}
            disabled={addTransaction.isPending}
          >
            {addTransaction.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Transaction"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
