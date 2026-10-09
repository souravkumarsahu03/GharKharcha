import { useState } from 'react';
import { useAppState } from './lib/store';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import type { TabType } from './components/BottomNav';
import { HomeDashboard } from './components/HomeDashboard';
import { ExpensesView } from './components/ExpensesView';
import { ReimbursementsView } from './components/ReimbursementsView';
import { LedgerView } from './components/LedgerView';
import { ProfileDashboard } from './components/ProfileDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { LoginPage } from './components/LoginPage';

import { PayModal } from './components/PayModal';
import { AddExpenseModal } from './components/AddExpenseModal';
import { RecordContributionModal } from './components/RecordContributionModal';
import { ReimburseModal } from './components/ReimburseModal';
import { TestScenarioModal } from './components/TestScenarioModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import type { User } from './types';

export function App() {
  const {
    state,
    summary,
    loginUser,
    logoutUser,
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
    fetchCloudState,
  } = useAppState();

  const [activeTab, setActiveTab] = useState<TabType>('HOME');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    Boolean(localStorage.getItem('roomsplit_logged_in_user_id'))
  );

  // Modal Visibility States
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isRecordContribOpen, setIsRecordContribOpen] = useState(false);
  const [defaultContribMemberId, setDefaultContribMemberId] = useState<string | undefined>(undefined);
  const [isReimburseOpen, setIsReimburseOpen] = useState(false);
  const [defaultReimburseExpenseId, setDefaultReimburseExpenseId] = useState<string | undefined>(undefined);
  const [isTestScenarioOpen, setIsTestScenarioOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const unreadCount = state.notifications.filter(
    (n) => n.user_id === state.currentUser.id && !n.read
  ).length;

  const adminIds = state.members.filter((m) => m.role === 'admin').map((m) => m.id);
  const pendingApprovalsCount = state.expenses.filter((e) => e.approval_status === 'PENDING').length;
  const pendingReimbursementsCount = state.expenses.filter(
    (e) =>
      e.approval_status === 'APPROVED' &&
      !adminIds.includes(e.paid_by) &&
      e.reimbursement_owed > e.reimbursement_paid
  ).length;

  const handleLogin = (user: User) => {
    loginUser(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    logoutUser();
    setIsLoggedIn(false);
  };

  const handleOpenRecordContrib = (memberId?: string) => {
    setDefaultContribMemberId(memberId);
    setIsRecordContribOpen(true);
  };

  const handleOpenReimburse = (expenseId?: string) => {
    setDefaultReimburseExpenseId(expenseId);
    setIsReimburseOpen(true);
  };

  if (!isLoggedIn) {
    return <LoginPage members={state.members} onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Sticky Header */}
      <Header
        currentUser={state.currentUser}
        onLogout={handleLogout}
        unreadNotificationCount={unreadCount}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onOpenPayModal={() => setIsPayModalOpen(true)}
        onOpenAddExpense={() => setIsAddExpenseOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 pb-24">
        {activeTab === 'HOME' && (
          <HomeDashboard
            cycle={state.currentCycle}
            summary={summary}
            members={state.members}
            contributions={state.contributions}
            expenses={state.expenses}
            currentUser={state.currentUser}
            onOpenPayModal={() => setIsPayModalOpen(true)}
            onOpenAddExpense={() => setIsAddExpenseOpen(true)}
            onApproveContribution={approveContributionPayment}
            onRejectContribution={rejectContributionPayment}
            onOpenReimburseModal={handleOpenReimburse}
            onNavigateToTab={(t) => setActiveTab(t)}
          />
        )}

        {activeTab === 'EXPENSES' && (
          <ExpensesView
            expenses={state.expenses}
            categories={state.categories}
            members={state.members}
            currentUser={state.currentUser}
            onOpenAddExpense={() => setIsAddExpenseOpen(true)}
            onApproveExpense={approveExpense}
            onRejectExpense={rejectExpense}
          />
        )}

        {activeTab === 'REIMBURSEMENTS' && (
          <ReimbursementsView
            expenses={state.expenses}
            reimbursementPayments={state.reimbursementPayments}
            members={state.members}
            currentUser={state.currentUser}
            onOpenReimburseModal={handleOpenReimburse}
          />
        )}

        {activeTab === 'LEDGER' && (
          <LedgerView
            transactions={state.transactions}
            auditLogs={state.auditLogs}
            members={state.members}
          />
        )}

        {activeTab === 'PROFILE' && (
          <ProfileDashboard
            currentUser={state.currentUser}
            contributions={state.contributions}
            expenses={state.expenses}
            reimbursementPayments={state.reimbursementPayments}
            onLogout={handleLogout}
            onRefreshCloud={fetchCloudState}
          />
        )}

        {activeTab === 'ADMIN' && (
          <AdminDashboard
            cycle={state.currentCycle}
            summary={summary}
            expenses={state.expenses}
            members={state.members}
            contributions={state.contributions}
            transactions={state.transactions}
            onOpenAddExpense={() => setIsAddExpenseOpen(true)}
            onOpenRecordContribution={() => handleOpenRecordContrib()}
            onOpenReimburseModal={() => handleOpenReimburse()}
            onOpenTestScenario={() => setIsTestScenarioOpen(true)}
            onApproveExpense={approveExpense}
            onRejectExpense={rejectExpense}
          />
        )}
      </main>

      {/* Mobile-First Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        userRole={state.currentUser.role}
        pendingApprovalsCount={pendingApprovalsCount}
        pendingReimbursementsCount={pendingReimbursementsCount}
      />

      {/* Modals */}
      <PayModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        currentUser={state.currentUser}
        onSubmitPaymentProof={(amount, method, txId, screenshotUrl, notes) =>
          submitContributionPayment(state.currentUser.id, amount, method, txId, screenshotUrl, notes)
        }
      />

      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        currentUser={state.currentUser}
        members={state.members}
        categories={state.categories}
        onSubmitExpense={submitExpense}
      />

      <RecordContributionModal
        isOpen={isRecordContribOpen}
        onClose={() => setIsRecordContribOpen(false)}
        members={state.members}
        defaultMemberId={defaultContribMemberId}
        onRecordContribution={recordContribution}
      />

      <ReimburseModal
        isOpen={isReimburseOpen}
        onClose={() => setIsReimburseOpen(false)}
        expenses={state.expenses}
        members={state.members}
        defaultExpenseId={defaultReimburseExpenseId}
        onRecordReimbursement={recordReimbursement}
      />

      <TestScenarioModal
        isOpen={isTestScenarioOpen}
        onClose={() => setIsTestScenarioOpen(false)}
        state={state}
        summary={summary}
        onSubmitExpense={submitExpense}
        onApproveExpense={approveExpense}
        onRecordReimbursement={recordReimbursement}
        onRecordContribution={recordContribution}
      />

      <NotificationCenterModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={state.notifications.filter((n) => n.user_id === state.currentUser.id)}
        onMarkRead={markNotificationAsRead}
        onMarkAllRead={markAllNotificationsAsRead}
        onNavigateToTab={(t) => setActiveTab(t)}
      />
    </div>
  );
}

export default App;
