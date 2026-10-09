import { useState, useEffect } from 'react';
import type {
  User,
  Room,
  MonthlyCycle,
  Contribution,
  Expense,
  Transaction,
  Notification,
  AuditLog,
  FinancialSummary,
  ReimbursementPayment,
  CategoryItem,
} from '../types';
import {
  INITIAL_MEMBERS,
  INITIAL_ROOM,
  INITIAL_CYCLE,
  INITIAL_CATEGORIES,
  INITIAL_CONTRIBUTIONS,
  INITIAL_EXPENSES,
} from './mockData';

const STORAGE_KEY = 'roomsplit_real_app_state_v4';
const AUTH_KEY = 'roomsplit_logged_in_user_id';

export interface AppState {
  currentUser: User;
  room: Room;
  members: User[];
  currentCycle: MonthlyCycle;
  cycles: MonthlyCycle[];
  contributions: Contribution[];
  categories: CategoryItem[];
  expenses: Expense[];
  reimbursementPayments: ReimbursementPayment[];
  transactions: Transaction[];
  notifications: Notification[];
  auditLogs: AuditLog[];
}

const getInitialState = (): AppState => {
  const savedState = localStorage.getItem(STORAGE_KEY);
  const savedUserId = localStorage.getItem(AUTH_KEY);

  let initialUser = INITIAL_MEMBERS[0]; // Sourav Admin
  if (savedUserId) {
    const matched = INITIAL_MEMBERS.find((m) => m.id === savedUserId);
    if (matched) initialUser = matched;
  }

  if (savedState) {
    try {
      const parsed = JSON.parse(savedState);
      return {
        currentUser: initialUser,
        room: parsed.room || INITIAL_ROOM,
        members: parsed.members || INITIAL_MEMBERS,
        currentCycle: parsed.currentCycle || INITIAL_CYCLE,
        cycles: parsed.cycles || [INITIAL_CYCLE],
        contributions: parsed.contributions || INITIAL_CONTRIBUTIONS,
        categories: parsed.categories || INITIAL_CATEGORIES,
        expenses: parsed.expenses || INITIAL_EXPENSES,
        reimbursementPayments: parsed.reimbursementPayments || [],
        transactions: parsed.transactions || [],
        notifications: parsed.notifications || [],
        auditLogs: parsed.auditLogs || [],
      };
    } catch (e) {
      console.warn('Failed to parse state from localStorage, using clean defaults:', e);
    }
  }

  return {
    currentUser: initialUser,
    room: INITIAL_ROOM,
    members: INITIAL_MEMBERS,
    currentCycle: INITIAL_CYCLE,
    cycles: [INITIAL_CYCLE],
    contributions: INITIAL_CONTRIBUTIONS,
    categories: INITIAL_CATEGORIES,
    expenses: INITIAL_EXPENSES,
    reimbursementPayments: [],
    transactions: [],
    notifications: [
      {
        id: 'notif-welcome',
        user_id: initialUser.id,
        title: 'Welcome to RoomSplit',
        message: 'Room Split initialized for October 2026. Sourav is Super Admin.',
        type: 'SYSTEM',
        read: false,
        created_at: new Date().toISOString(),
      },
    ],
    auditLogs: [],
  };
};

export const calculateFinancialSummary = (
  room: Room,
  contributions: Contribution[],
  expenses: Expense[],
  reimbursementPayments: ReimbursementPayment[],
  membersCount: number = 6
): FinancialSummary => {
  const expected_contributions = membersCount * room.monthly_contribution;

  // Sum of all approved payments across contributions
  const total_collected = contributions.reduce((sum, c) => sum + c.amount, 0);

  const approvedExpenses = expenses.filter((e) => e.approval_status === 'APPROVED');

  const total_expenses_approved = approvedExpenses.reduce((sum, e) => sum + e.amount, 0);

  const total_expenses_direct_treasurer = approvedExpenses
    .filter((e) => e.paid_by === room.treasurer_id)
    .reduce((sum, e) => sum + e.amount, 0);

  const total_expenses_member_paid = approvedExpenses
    .filter((e) => e.paid_by !== room.treasurer_id)
    .reduce((sum, e) => sum + e.amount, 0);

  const total_reimbursements_paid = reimbursementPayments.reduce((sum, p) => sum + p.amount, 0);

  const current_room_fund = total_collected - total_expenses_direct_treasurer - total_reimbursements_paid;

  const pending_reimbursements = approvedExpenses
    .filter((e) => e.paid_by !== room.treasurer_id)
    .reduce((sum, e) => sum + Math.max(0, e.reimbursement_owed - e.reimbursement_paid), 0);

  const available_after_obligations = current_room_fund - pending_reimbursements;

  const paid_members_count = contributions.filter((c) => c.status === 'PAID').length;

  return {
    expected_contributions,
    total_collected,
    total_expenses_direct_treasurer,
    total_expenses_member_paid,
    total_expenses_approved,
    total_reimbursements_paid,
    current_room_fund,
    pending_reimbursements,
    available_after_obligations,
    paid_members_count,
    total_members_count: membersCount,
  };
};

export const useAppState = () => {
  const [state, setState] = useState<AppState>(getInitialState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem(AUTH_KEY, state.currentUser.id);
  }, [state]);

  const summary = calculateFinancialSummary(
    state.room,
    state.contributions,
    state.expenses,
    state.reimbursementPayments,
    state.members.length
  );

  const loginUser = (user: User) => {
    localStorage.setItem(AUTH_KEY, user.id);
    setState((prev) => ({ ...prev, currentUser: user }));
  };

  const logoutUser = () => {
    localStorage.removeItem(AUTH_KEY);
  };

  const switchUser = (userId: string) => {
    const user = state.members.find((m) => m.id === userId);
    if (user) {
      loginUser(user);
    }
  };

  const addAuditLog = (
    action: string,
    targetType: string,
    targetId?: string,
    oldVal?: string,
    newVal?: string
  ) => {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      user_id: state.currentUser.id,
      user_name: `${state.currentUser.name} (${state.currentUser.role === 'admin' ? 'Super Admin Sourav' : 'Member'})`,
      action,
      target_type: targetType,
      target_id: targetId,
      old_value: oldVal,
      new_value: newVal,
      timestamp: new Date().toISOString(),
    };
    return newLog;
  };

  const addNotification = (
    userId: string,
    title: string,
    message: string,
    type: Notification['type'],
    actionUrl?: string
  ) => {
    const newNotif: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      user_id: userId,
      title,
      message,
      type,
      read: false,
      created_at: new Date().toISOString(),
      action_url: actionUrl,
    };
    return newNotif;
  };

  // Member submits ₹8,000 or custom partial contribution payment proof
  const submitContributionPayment = (
    memberId: string,
    payingAmount: number,
    paymentMethod: any,
    transactionId?: string,
    paymentScreenshotUrl?: string,
    notes?: string
  ) => {
    const member = state.members.find((m) => m.id === memberId);
    if (!member) return;

    const timestamp = new Date().toISOString();
    const existingIndex = state.contributions.findIndex(
      (c) => c.member_id === memberId && c.cycle_id === state.currentCycle.id
    );

    let updatedContributions = [...state.contributions];
    if (existingIndex >= 0) {
      const current = updatedContributions[existingIndex];
      updatedContributions[existingIndex] = {
        ...current,
        status: 'PENDING_APPROVAL',
        payment_method: paymentMethod,
        transaction_id: transactionId || (paymentMethod === 'Cash' ? 'CASH/HAND' : undefined),
        payment_screenshot_url: paymentScreenshotUrl,
        submitted_at: timestamp,
        notes: notes || (payingAmount < 8000 ? `Paying ₹${payingAmount} partial deposit` : undefined),
      };
      (updatedContributions[existingIndex] as any).temp_submitting_amount = payingAmount;
    } else {
      updatedContributions.push({
        id: `contrib-${memberId}-${Date.now()}`,
        cycle_id: state.currentCycle.id,
        member_id: memberId,
        amount: 0,
        target_amount: 8000,
        remaining_amount: 8000,
        status: 'PENDING_APPROVAL',
        payment_method: paymentMethod,
        transaction_id: transactionId || (paymentMethod === 'Cash' ? 'CASH/HAND' : undefined),
        payment_screenshot_url: paymentScreenshotUrl,
        submitted_at: timestamp,
        notes: notes || (payingAmount < 8000 ? `Paying ₹${payingAmount} partial deposit` : undefined),
      });
      (updatedContributions[updatedContributions.length - 1] as any).temp_submitting_amount = payingAmount;
    }

    // Create Notification for Super Admin (Sourav)
    const adminNotif = addNotification(
      state.room.treasurer_id,
      'New Contribution Payment Submitted',
      `${member.name} submitted ₹${payingAmount.toLocaleString('en-IN')} contribution payment (${paymentMethod}). Tap to verify and approve.`,
      'CONTRIBUTION_SUBMITTED',
      '/home'
    );

    const audit = addAuditLog(
      `${member.name} submitted ₹${payingAmount.toLocaleString('en-IN')} contribution payment proof (${paymentMethod})`,
      'CONTRIBUTION',
      memberId
    );

    setState((prev) => ({
      ...prev,
      contributions: updatedContributions,
      notifications: [adminNotif, ...prev.notifications],
      auditLogs: [audit, ...prev.auditLogs],
    }));
  };

  // Super Admin Sourav approves a member's payment
  const approveContributionPayment = (contributionId: string) => {
    const contrib = state.contributions.find((c) => c.id === contributionId);
    if (!contrib) return;

    const member = state.members.find((m) => m.id === contrib.member_id);
    const timestamp = new Date().toISOString();

    const payingAmount = (contrib as any).temp_submitting_amount || (contrib.amount > 0 ? contrib.amount : 8000);
    const newTotalPaid = (contrib.amount || 0) + payingAmount;
    const targetAmount = contrib.target_amount || 8000;
    const newRemaining = Math.max(0, targetAmount - newTotalPaid);

    const isFullyPaid = newRemaining === 0;
    const newStatus = isFullyPaid ? ('PAID' as const) : ('PARTIALLY_PAID' as const);

    const updatedContributions = state.contributions.map((c) => {
      if (c.id === contributionId) {
        return {
          ...c,
          amount: newTotalPaid,
          remaining_amount: newRemaining,
          status: newStatus,
          paid_at: timestamp,
        };
      }
      return c;
    });

    // Record Inflow Transaction
    const newTx: Transaction = {
      id: `tx-contrib-${Date.now()}`,
      type: 'CONTRIBUTION',
      title: `Contribution — ${member?.name}`,
      amount: payingAmount,
      date: new Date().toISOString().split('T')[0],
      member_id: contrib.member_id,
      flow: 'IN',
      notes: `Approved by Sourav (${isFullyPaid ? 'Full Payment' : `Partial Payment: ₹${newRemaining} remaining`})`,
      created_at: timestamp,
    };

    const audit = addAuditLog(
      `Sourav approved ${member?.name}'s ₹${payingAmount.toLocaleString('en-IN')} deposit (${newStatus})`,
      'CONTRIBUTION',
      contrib.member_id
    );

    let newNotifications = [...state.notifications];

    if (isFullyPaid) {
      newNotifications.unshift(
        addNotification(
          contrib.member_id,
          'Contribution Approved!',
          `Your ₹${payingAmount.toLocaleString('en-IN')} payment has been verified & approved by Sourav! Total ₹8,000 fully paid ✓`,
          'CONTRIBUTION_APPROVED'
        )
      );
    } else {
      // Partial Payment Notifications & 15-Day Reminders Setup
      const memberMsg = `Your partial payment of ₹${payingAmount.toLocaleString('en-IN')} is approved by Sourav. Remaining balance of ₹${newRemaining.toLocaleString('en-IN')} is due in the next 15 days.`;
      const adminMsg = `${member?.name} paid partial deposit ₹${payingAmount.toLocaleString('en-IN')}. Remaining ₹${newRemaining.toLocaleString('en-IN')} due in 15 days.`;

      newNotifications.unshift(
        addNotification(contrib.member_id, 'Partial Payment Approved', memberMsg, 'CONTRIBUTION_PARTIAL'),
        addNotification(state.room.treasurer_id, 'Partial Payment Recorded', adminMsg, 'CONTRIBUTION_PARTIAL'),
        
        // 3 Active 15-day reminders for the member (Day 5, Day 10, Day 15)
        addNotification(
          contrib.member_id,
          'Contribution Reminder (1/3)',
          `Reminder 1/3: Your remaining room contribution balance of ₹${newRemaining.toLocaleString('en-IN')} is due in 10 days.`,
          'CONTRIBUTION_REMINDER'
        ),
        addNotification(
          contrib.member_id,
          'Contribution Reminder (2/3)',
          `Reminder 2/3: Your remaining room contribution balance of ₹${newRemaining.toLocaleString('en-IN')} is due in 5 days.`,
          'CONTRIBUTION_REMINDER'
        ),
        addNotification(
          contrib.member_id,
          'Contribution Final Reminder (3/3)',
          `Final Reminder 3/3: Your remaining room contribution balance of ₹${newRemaining.toLocaleString('en-IN')} is due today! Please deposit to Sourav.`,
          'CONTRIBUTION_REMINDER'
        )
      );
    }

    setState((prev) => ({
      ...prev,
      contributions: updatedContributions,
      transactions: [newTx, ...prev.transactions],
      notifications: newNotifications,
      auditLogs: [audit, ...prev.auditLogs],
    }));
  };

  const rejectContributionPayment = (contributionId: string, reason: string) => {
    const contrib = state.contributions.find((c) => c.id === contributionId);
    if (!contrib) return;

    const member = state.members.find((m) => m.id === contrib.member_id);

    const updatedContributions = state.contributions.map((c) => {
      if (c.id === contributionId) {
        return {
          ...c,
          status: 'REJECTED' as const,
          rejection_reason: reason,
        };
      }
      return c;
    });

    const audit = addAuditLog(
      `Sourav rejected ${member?.name}'s contribution payment (${reason})`,
      'CONTRIBUTION',
      contrib.member_id
    );

    const newNotif = addNotification(
      contrib.member_id,
      'Contribution Payment Rejected',
      `Your contribution payment proof was rejected by Sourav: ${reason}`,
      'CONTRIBUTION_REJECTED'
    );

    setState((prev) => ({
      ...prev,
      contributions: updatedContributions,
      notifications: [newNotif, ...prev.notifications],
      auditLogs: [audit, ...prev.auditLogs],
    }));
  };

  const recordContribution = (
    memberId: string,
    amount: number,
    paymentMethod: any,
    transactionId?: string,
    paymentScreenshotUrl?: string,
    notes?: string
  ) => {
    submitContributionPayment(memberId, amount, paymentMethod, transactionId, paymentScreenshotUrl, notes);
    const contrib = state.contributions.find((c) => c.member_id === memberId);
    if (contrib) {
      approveContributionPayment(contrib.id);
    }
  };

  const submitExpense = (expenseData: {
    title: string;
    amount: number;
    category: string;
    description?: string;
    paid_by: string;
    date: string;
    payment_method: any;
    payment_screenshot_url?: string;
    receipt_url?: string;
    items?: { name: string; amount: number }[];
  }) => {
    const isPaidByTreasurer = expenseData.paid_by === state.room.treasurer_id;
    const paidMember = state.members.find((m) => m.id === expenseData.paid_by);
    const timestamp = new Date().toISOString();

    const approval_status: Expense['approval_status'] = isPaidByTreasurer ? 'APPROVED' : 'PENDING';
    const reimbursement_owed = isPaidByTreasurer ? 0 : expenseData.amount;

    const newExpense: Expense = {
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      room_id: state.room.id,
      cycle_id: state.currentCycle.id,
      title: expenseData.title,
      amount: expenseData.amount,
      category: expenseData.category,
      description: expenseData.description,
      paid_by: expenseData.paid_by,
      date: expenseData.date,
      payment_method: expenseData.payment_method,
      payment_screenshot_url: expenseData.payment_screenshot_url,
      receipt_url: expenseData.receipt_url,
      items: (expenseData.items || []).map((it, idx) => ({ ...it, id: `item-${Date.now()}-${idx}` })),
      approval_status,
      reimbursement_status: isPaidByTreasurer ? undefined : 'PENDING',
      reimbursement_owed,
      reimbursement_paid: 0,
      created_at: timestamp,
      updated_at: timestamp,
    };

    let newTransactions = [...state.transactions];
    if (isPaidByTreasurer) {
      newTransactions.unshift({
        id: `tx-exp-${Date.now()}`,
        type: 'EXPENSE',
        title: `Expense — ${expenseData.category} — Sourav`,
        amount: expenseData.amount,
        date: expenseData.date,
        member_id: expenseData.paid_by,
        reference_id: newExpense.id,
        flow: 'OUT',
        notes: expenseData.title,
        created_at: timestamp,
      });
    }

    const audit = addAuditLog(
      isPaidByTreasurer
        ? `Sourav added ₹${expenseData.amount.toLocaleString('en-IN')} ${expenseData.category} room expense (Direct spend)`
        : `Submitted ₹${expenseData.amount.toLocaleString('en-IN')} ${expenseData.category} expense paid by ${paidMember?.name}`,
      'EXPENSE',
      newExpense.id
    );

    let newNotifs = [...state.notifications];
    if (!isPaidByTreasurer) {
      newNotifs.unshift(
        addNotification(
          state.room.treasurer_id,
          'New Room Expense Submitted',
          `New room expense submitted by ${paidMember?.name}: ${expenseData.category} ₹${expenseData.amount.toLocaleString('en-IN')}.`,
          'EXPENSE_SUBMITTED',
          '/expenses'
        )
      );
    }

    setState((prev) => ({
      ...prev,
      expenses: [newExpense, ...prev.expenses],
      transactions: newTransactions,
      notifications: newNotifs,
      auditLogs: [audit, ...prev.auditLogs],
    }));

    return newExpense;
  };

  const approveExpense = (expenseId: string) => {
    const exp = state.expenses.find((e) => e.id === expenseId);
    if (!exp) return;

    const paidMember = state.members.find((m) => m.id === exp.paid_by);
    const timestamp = new Date().toISOString();

    const updatedExpenses = state.expenses.map((e) => {
      if (e.id === expenseId) {
        return {
          ...e,
          approval_status: 'APPROVED' as const,
          reimbursement_status: 'PENDING' as const,
          updated_at: timestamp,
        };
      }
      return e;
    });

    const newTx: Transaction = {
      id: `tx-exp-${Date.now()}`,
      type: 'EXPENSE',
      title: `Expense — ${exp.category} — ${paidMember?.name}`,
      amount: exp.amount,
      date: exp.date,
      member_id: exp.paid_by,
      reference_id: exp.id,
      flow: 'OUT',
      notes: `Approved by Sourav for ${paidMember?.name}`,
      created_at: timestamp,
    };

    const audit = addAuditLog(
      `Sourav approved ${paidMember?.name}'s ₹${exp.amount.toLocaleString('en-IN')} ${exp.category} expense`,
      'EXPENSE',
      expenseId
    );

    const newNotif = addNotification(
      exp.paid_by,
      'Expense Approved',
      `Your ₹${exp.amount.toLocaleString('en-IN')} room expense has been approved by Sourav. Reimbursement pending.`,
      'EXPENSE_APPROVED',
      '/reimbursements'
    );

    setState((prev) => ({
      ...prev,
      expenses: updatedExpenses,
      transactions: [newTx, ...prev.transactions],
      notifications: [newNotif, ...prev.notifications],
      auditLogs: [audit, ...prev.auditLogs],
    }));
  };

  const rejectExpense = (expenseId: string, reason: string) => {
    const exp = state.expenses.find((e) => e.id === expenseId);
    if (!exp) return;

    const paidMember = state.members.find((m) => m.id === exp.paid_by);
    const timestamp = new Date().toISOString();

    const updatedExpenses = state.expenses.map((e) => {
      if (e.id === expenseId) {
        return {
          ...e,
          approval_status: 'REJECTED' as const,
          rejection_reason: reason,
          updated_at: timestamp,
        };
      }
      return e;
    });

    const audit = addAuditLog(
      `Sourav rejected ${paidMember?.name}'s ₹${exp.amount.toLocaleString('en-IN')} expense (${reason})`,
      'EXPENSE',
      expenseId
    );

    const newNotif = addNotification(
      exp.paid_by,
      'Expense Rejected',
      `Your ₹${exp.amount.toLocaleString('en-IN')} expense was rejected by Sourav: ${reason}`,
      'EXPENSE_REJECTED'
    );

    setState((prev) => ({
      ...prev,
      expenses: updatedExpenses,
      notifications: [newNotif, ...prev.notifications],
      auditLogs: [audit, ...prev.auditLogs],
    }));
  };

  const recordReimbursement = (
    expenseId: string,
    paidAmount: number,
    paymentMethod: any,
    transactionId?: string,
    paymentScreenshotUrl?: string,
    notes?: string
  ) => {
    const exp = state.expenses.find((e) => e.id === expenseId);
    if (!exp) return;

    const paidMember = state.members.find((m) => m.id === exp.paid_by);
    const timestamp = new Date().toISOString();

    const newPayment: ReimbursementPayment = {
      id: `reimb-pay-${Date.now()}`,
      reimbursement_id: expenseId,
      amount: paidAmount,
      paid_at: timestamp,
      payment_method: paymentMethod,
      transaction_id: transactionId,
      payment_screenshot_url: paymentScreenshotUrl,
      notes,
    };

    const newTotalPaid = (exp.reimbursement_paid || 0) + paidAmount;
    const newStatus =
      newTotalPaid >= exp.reimbursement_owed
        ? ('FULLY_REIMBURSED' as const)
        : ('PARTIALLY_REIMBURSED' as const);

    const updatedExpenses = state.expenses.map((e) => {
      if (e.id === expenseId) {
        return {
          ...e,
          reimbursement_paid: newTotalPaid,
          reimbursement_status: newStatus,
          updated_at: timestamp,
        };
      }
      return e;
    });

    const newTx: Transaction = {
      id: `tx-reimb-${Date.now()}`,
      type: 'REIMBURSEMENT',
      title: `Reimbursement — ${paidMember?.name}`,
      amount: paidAmount,
      date: new Date().toISOString().split('T')[0],
      member_id: exp.paid_by,
      reference_id: expenseId,
      flow: 'OUT',
      notes: notes || `Reimbursed ₹${paidAmount.toLocaleString('en-IN')} for ${exp.title}`,
      created_at: timestamp,
    };

    const audit = addAuditLog(
      `Sourav reimbursed ₹${paidAmount.toLocaleString('en-IN')} to ${paidMember?.name} (${newStatus})`,
      'REIMBURSEMENT',
      expenseId
    );

    const newNotif = addNotification(
      exp.paid_by,
      'Reimbursement Received',
      `₹${paidAmount.toLocaleString('en-IN')} reimbursement received from Sourav (${newStatus === 'FULLY_REIMBURSED' ? 'PAID' : 'PARTIAL'}).`,
      'REIMBURSEMENT_PAID'
    );

    setState((prev) => ({
      ...prev,
      expenses: updatedExpenses,
      reimbursementPayments: [newPayment, ...prev.reimbursementPayments],
      transactions: [newTx, ...prev.transactions],
      notifications: [newNotif, ...prev.notifications],
      auditLogs: [audit, ...prev.auditLogs],
    }));
  };

  const markNotificationAsRead = (id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  };

  const markAllNotificationsAsRead = () => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  };

  const addCategory = (name: string, icon: string, color: string) => {
    const newCat: CategoryItem = {
      id: `cat-custom-${Date.now()}`,
      name,
      icon,
      color,
    };
    setState((prev) => ({ ...prev, categories: [...prev.categories, newCat] }));
  };

  const resetToInitialSeed = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(AUTH_KEY);
    setState(getInitialState());
  };

  return {
    state,
    summary,
    loginUser,
    logoutUser,
    switchUser,
    submitContributionPayment,
    approveContributionPayment,
    rejectContributionPayment,
    recordContribution,
    submitExpense,
    approveExpense,
    rejectExpense,
    recordReimbursement,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    addCategory,
    resetToInitialSeed,
  };
};
