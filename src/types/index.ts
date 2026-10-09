export type MemberRole = 'admin' | 'member';

export type ContributionStatus = 'PAID' | 'PENDING' | 'PENDING_APPROVAL' | 'PARTIALLY_PAID' | 'OVERDUE' | 'REJECTED';

export type PaymentMethod = 'UPI' | 'Bank Transfer' | 'Cash' | 'Other';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EDIT_REQUESTED';

export type ReimbursementStatus = 'PENDING' | 'PARTIALLY_REIMBURSED' | 'FULLY_REIMBURSED';

export type TransactionType = 'CONTRIBUTION' | 'EXPENSE' | 'REIMBURSEMENT' | 'ADJUSTMENT';

export interface User {
  id: string;
  name: string;
  role: MemberRole;
  avatar: string;
  phone: string; // Used as Password
  upi_id: string;
  email: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Room {
  id: string;
  name: string;
  monthly_contribution: number;
  contribution_day: number;
  currency: string;
  total_members: number;
  treasurer_id: string; // Sourav
}

export interface MonthlyCycle {
  id: string;
  room_id: string;
  year_month: string; // e.g. "2026-10"
  display_name: string; // e.g. "October 2026"
  deadline: string; // "2026-10-07"
  status: 'ACTIVE' | 'CLOSED';
  created_at: string;
}

export interface Contribution {
  id: string;
  cycle_id: string;
  member_id: string;
  amount: number; // Total amount paid so far
  target_amount: number; // Default 8000
  remaining_amount: number; // target_amount - amount
  status: ContributionStatus;
  payment_method?: PaymentMethod;
  transaction_id?: string;
  payment_screenshot_url?: string;
  paid_at?: string;
  submitted_at?: string;
  rejection_reason?: string;
  notes?: string;
}

export interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
}

export interface Expense {
  id: string;
  room_id: string;
  cycle_id: string;
  title: string;
  amount: number;
  category: string;
  description?: string;
  paid_by: string; // member_id
  date: string;
  payment_method: PaymentMethod;
  payment_screenshot_url?: string;
  receipt_url?: string;
  items: ExpenseItem[];
  approval_status: ApprovalStatus;
  rejection_reason?: string;
  reimbursement_status?: ReimbursementStatus;
  reimbursement_owed: number; // Amount to reimburse (0 if paid by treasurer)
  reimbursement_paid: number; // Amount reimbursed so far
  created_at: string;
  updated_at: string;
}

export interface ReimbursementPayment {
  id: string;
  reimbursement_id: string;
  amount: number;
  paid_at: string;
  payment_method: PaymentMethod;
  transaction_id?: string;
  payment_screenshot_url?: string;
  notes?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  amount: number;
  date: string;
  member_id: string;
  reference_id?: string;
  flow: 'IN' | 'OUT'; // IN to room fund, OUT from room fund
  notes?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'CONTRIBUTION_SUBMITTED' | 'CONTRIBUTION_APPROVED' | 'CONTRIBUTION_PARTIAL' | 'CONTRIBUTION_REMINDER' | 'CONTRIBUTION_REJECTED' | 'EXPENSE_SUBMITTED' | 'EXPENSE_APPROVED' | 'EXPENSE_REJECTED' | 'REIMBURSEMENT_PAID' | 'CONTRIBUTION_DUE' | 'SYSTEM';
  read: boolean;
  created_at: string;
  action_url?: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  target_type: string;
  target_id?: string;
  old_value?: string;
  new_value?: string;
  timestamp: string;
}

export interface FinancialSummary {
  expected_contributions: number;
  total_collected: number;
  total_expenses_direct_treasurer: number;
  total_expenses_member_paid: number;
  total_expenses_approved: number;
  total_reimbursements_paid: number;
  current_room_fund: number;
  pending_reimbursements: number;
  available_after_obligations: number;
  paid_members_count: number;
  total_members_count: number;
}
