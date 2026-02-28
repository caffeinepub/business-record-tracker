import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Transaction, UserProfile } from "../backend.d.ts";
import { useActor } from "./useActor";

// ─── Queries ────────────────────────────────────────────────────────────────

export function useMyTransactions() {
  const { actor, isFetching } = useActor();
  return useQuery<Transaction[]>({
    queryKey: ["transactions", "mine"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyTransactions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllTransactions() {
  const { actor, isFetching } = useActor();
  return useQuery<Transaction[]>({
    queryKey: ["transactions", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTransactions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePendingTransactions() {
  const { actor, isFetching } = useActor();
  return useQuery<Transaction[]>({
    queryKey: ["transactions", "pending"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingTransactions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDailySummary(date: string) {
  const { actor, isFetching } = useActor();
  return useQuery<[bigint, bigint, bigint]>({
    queryKey: ["summary", "daily", date],
    queryFn: async () => {
      if (!actor) return [0n, 0n, 0n] as [bigint, bigint, bigint];
      return actor.getDailySummary(date);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMonthlySummary(year: string, month: string) {
  const { actor, isFetching } = useActor();
  return useQuery<[bigint, bigint, bigint]>({
    queryKey: ["summary", "monthly", year, month],
    queryFn: async () => {
      if (!actor) return [0n, 0n, 0n] as [bigint, bigint, bigint];
      return actor.getMonthlySummary(year, month);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useExpenseCategories() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[string, bigint]>>({
    queryKey: ["analytics", "expenseCategories"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getExpenseCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Mutations ──────────────────────────────────────────────────────────────

export function useAddTransaction() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      date: string;
      transactionType: string;
      category: string;
      amount: bigint;
      paymentStatus: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addTransaction(
        params.date,
        params.transactionType,
        params.category,
        params.amount,
        params.paymentStatus,
        params.notes,
      );
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["transactions"] });
      void qc.invalidateQueries({ queryKey: ["summary"] });
      void qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useUpdateTransaction() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (transaction: Transaction) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateTransaction(transaction);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["transactions"] });
      void qc.invalidateQueries({ queryKey: ["summary"] });
      void qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useDeleteTransaction() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteTransaction(id);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["transactions"] });
      void qc.invalidateQueries({ queryKey: ["summary"] });
      void qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}
