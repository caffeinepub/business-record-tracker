import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
}
export interface Transaction {
    id: bigint;
    paymentStatus: string;
    transactionType: string;
    date: string;
    createdAt: bigint;
    notes: string;
    category: string;
    amount: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addTransaction(date: string, transactionType: string, category: string, amount: bigint, paymentStatus: string, notes: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteTransaction(id: bigint): Promise<void>;
    getAllTransactions(): Promise<Array<Transaction>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDailySummary(date: string): Promise<[bigint, bigint, bigint]>;
    getExpenseCategories(): Promise<Array<[string, bigint]>>;
    getMonthlySummary(year: string, month: string): Promise<[bigint, bigint, bigint]>;
    getMyTransactions(): Promise<Array<Transaction>>;
    getPendingTransactions(): Promise<Array<Transaction>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateTransaction(transaction: Transaction): Promise<void>;
}
