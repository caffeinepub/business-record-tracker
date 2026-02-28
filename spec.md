# Business Record Tracker

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Full authentication system (signup, login, logout, delete account, change password)
- Dashboard with today's sales, expenses, profit/loss (Indian number format), monthly revenue summary
- Transaction management: add/edit/delete transactions with fields: date, type (Sale/Expense), category, amount, payment status (Paid/Pending), notes
- Analytics section: daily revenue bar chart, monthly profit trend line chart, expense category pie chart, Udhaar (pending payments) summary
- Reports section: weekly/monthly summaries, export as CSV and PDF
- Settings page: change password, logout, delete account (with confirmation), manual data backup
- Fixed bottom navigation bar with 4 tabs: Home, Transactions, Analytics, Settings
- Indian Rupee (₹) formatting throughout, Indian numbering format (1,00,000)
- Privacy statement: "Your data belongs to you. No ads. No data sharing. 100% Free."

### Modify
N/A

### Remove
N/A

## Implementation Plan

### Backend (Motoko)
1. User profile management: store display name, email reference
2. Transaction store: per-user CRUD for transactions (id, userId, date, type, category, amount, paymentStatus, notes, createdAt)
3. Analytics queries: daily totals, monthly totals, category breakdowns, pending (Udhaar) totals
4. Report generation: weekly/monthly summary aggregations
5. Data export: return all transactions for CSV export

### Frontend (React + TypeScript)
1. Auth pages: Login, Signup, Forgot Password screens with form validation
2. Dashboard page: 4 summary cards (today sales, expenses, profit/loss with color coding, monthly revenue), auto-refresh on transaction add
3. Transactions page: list view with filter/search, add transaction modal/sheet with all required fields
4. Analytics page: recharts bar chart (daily revenue), line chart (monthly profit), pie chart (expense categories), Udhaar summary card
5. Reports page: weekly/monthly selector, summary table, CSV export button, PDF print button
6. Settings page: change password form, logout button, delete account with confirmation dialog, backup/export all data
7. Bottom navigation bar (fixed, mobile-first): Home, Transactions, Analytics, Settings icons
8. Indian number formatting utility (1,00,000 format)
9. PWA-ready: app manifest metadata, responsive mobile-first layout
