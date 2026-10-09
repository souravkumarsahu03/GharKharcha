import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { MonthlyCycle, Contribution, Expense, User, FinancialSummary, Transaction } from '../types';

export const generatePDFReport = (
  cycle: MonthlyCycle,
  summary: FinancialSummary,
  members: User[],
  contributions: Contribution[],
  expenses: Expense[],
  _transactions?: Transaction[]
) => {
  const doc = new jsPDF();
  const title = `RoomSplit Report - ${cycle.display_name}`;

  // Title & Header
  doc.setFontSize(20);
  doc.setTextColor(26, 35, 126); // Primary Navy
  doc.text(title, 14, 20);

  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Month Cycle: ${cycle.display_name} | Generated: ${new Date().toLocaleDateString('en-IN')}`, 14, 28);

  // Divider Line
  doc.setDrawColor(220, 224, 230);
  doc.line(14, 32, 196, 32);

  // Financial Summary Cards Overview
  doc.setFontSize(14);
  doc.setTextColor(20);
  doc.text('Financial Overview', 14, 42);

  const summaryData = [
    ['Expected Contributions', `₹${summary.expected_contributions.toLocaleString('en-IN')}`],
    ['Total Collected (Room Fund Inflow)', `₹${summary.total_collected.toLocaleString('en-IN')}`],
    ['Total Approved Room Expenses', `₹${summary.total_expenses_approved.toLocaleString('en-IN')}`],
    ['  • Paid directly by Saurabh (Treasurer)', `₹${summary.total_expenses_direct_treasurer.toLocaleString('en-IN')}`],
    ['  • Paid by Room Members', `₹${summary.total_expenses_member_paid.toLocaleString('en-IN')}`],
    ['Total Reimbursements Paid', `₹${summary.total_reimbursements_paid.toLocaleString('en-IN')}`],
    ['Pending Reimbursements Owed', `₹${summary.pending_reimbursements.toLocaleString('en-IN')}`],
    ['Current Room Fund Balance', `₹${summary.current_room_fund.toLocaleString('en-IN')}`],
    ['Net Available (After Obligations)', `₹${summary.available_after_obligations.toLocaleString('en-IN')}`],
  ];

  autoTable(doc, {
    startY: 46,
    head: [['Financial Metric', 'Amount (INR)']],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: [30, 41, 59] },
    columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right', fontStyle: 'bold' } },
  });

  let currentY = (doc as any).lastAutoTable.finalY + 12;

  // Contributions Table
  doc.setFontSize(14);
  doc.setTextColor(20);
  doc.text('Member Contributions (₹8,000 / month)', 14, currentY);

  const contribRows = members.map((m) => {
    const c = contributions.find((cb) => cb.member_id === m.id);
    return [
      m.name,
      m.role === 'admin' ? 'Treasurer / Admin' : 'Member',
      `₹${c ? c.amount.toLocaleString('en-IN') : '8,000'}`,
      c ? c.status : 'PENDING',
      c?.paid_at ? new Date(c.paid_at).toLocaleDateString('en-IN') : '-',
      c?.payment_method || '-',
      c?.transaction_id || '-',
    ];
  });

  autoTable(doc, {
    startY: currentY + 4,
    head: [['Member Name', 'Role', 'Amount', 'Status', 'Paid Date', 'Method', 'Transaction ID']],
    body: contribRows,
    theme: 'grid',
    headStyles: { fillColor: [15, 118, 110] }, // Teal header
  });

  currentY = (doc as any).lastAutoTable.finalY + 12;

  // Room Expenses Table
  doc.setFontSize(14);
  doc.setTextColor(20);
  doc.text('Approved Room Expenses', 14, currentY);

  const expenseRows = expenses
    .filter((e) => e.approval_status === 'APPROVED')
    .map((e) => {
      const paidMember = members.find((m) => m.id === e.paid_by);
      return [
        e.date,
        e.title,
        e.category,
        paidMember ? paidMember.name : 'Unknown',
        `₹${e.amount.toLocaleString('en-IN')}`,
        e.reimbursement_owed > 0 ? `₹${e.reimbursement_owed.toLocaleString('en-IN')}` : '₹0 (Treasurer)',
        e.reimbursement_status || 'N/A',
      ];
    });

  autoTable(doc, {
    startY: currentY + 4,
    head: [['Date', 'Title', 'Category', 'Paid By', 'Amount', 'Reimbursement Owed', 'Reimb. Status']],
    body: expenseRows.length ? expenseRows : [['-', 'No approved expenses yet', '-', '-', '-', '-', '-']],
    theme: 'striped',
    headStyles: { fillColor: [67, 56, 202] }, // Indigo header
  });

  // Save the PDF
  doc.save(`RoomSplit_Report_${cycle.year_month}.pdf`);
};

export const generateCSVReport = (
  cycle: MonthlyCycle,
  summary: FinancialSummary,
  members: User[],
  contributions: Contribution[],
  expenses: Expense[]
) => {
  let csvContent = `RoomSplit Financial Report - ${cycle.display_name}\n`;
  csvContent += `Generated Date,${new Date().toLocaleDateString('en-IN')}\n\n`;

  csvContent += `FINANCIAL OVERVIEW\n`;
  csvContent += `Metric,Amount (INR)\n`;
  csvContent += `Expected Contributions,${summary.expected_contributions}\n`;
  csvContent += `Total Collected,${summary.total_collected}\n`;
  csvContent += `Total Approved Expenses,${summary.total_expenses_approved}\n`;
  csvContent += `  - Paid by Treasurer (Saurabh),${summary.total_expenses_direct_treasurer}\n`;
  csvContent += `  - Paid by Members,${summary.total_expenses_member_paid}\n`;
  csvContent += `Total Reimbursements Paid,${summary.total_reimbursements_paid}\n`;
  csvContent += `Pending Reimbursements,${summary.pending_reimbursements}\n`;
  csvContent += `Current Room Fund,${summary.current_room_fund}\n`;
  csvContent += `Available Balance,${summary.available_after_obligations}\n\n`;

  csvContent += `MEMBER CONTRIBUTIONS\n`;
  csvContent += `Member Name,Role,Amount,Status,Paid Date,Payment Method,Transaction ID\n`;
  members.forEach((m) => {
    const c = contributions.find((cb) => cb.member_id === m.id);
    csvContent += `"${m.name}","${m.role}",${c ? c.amount : 8000},"${c ? c.status : 'PENDING'}","${
      c?.paid_at ? new Date(c.paid_at).toLocaleDateString('en-IN') : '-'
    }","${c?.payment_method || '-'}","${c?.transaction_id || '-'}"\n`;
  });

  csvContent += `\nROOM EXPENSES\n`;
  csvContent += `Date,Title,Category,Paid By,Amount,Approval Status,Reimbursement Owed,Reimbursement Paid,Reimbursement Status\n`;
  expenses.forEach((e) => {
    const paidMember = members.find((m) => m.id === e.paid_by);
    csvContent += `"${e.date}","${e.title}","${e.category}","${paidMember?.name || e.paid_by}",${e.amount},"${
      e.approval_status
    }",${e.reimbursement_owed},${e.reimbursement_paid},"${e.reimbursement_status || 'N/A'}"\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `RoomSplit_Report_${cycle.year_month}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const generateExcelReport = (
  cycle: MonthlyCycle,
  summary: FinancialSummary,
  members: User[],
  contributions: Contribution[],
  expenses: Expense[],
  _transactions?: Transaction[]
) => {
  const wb = XLSX.utils.book_new();

  // 1. Summary Sheet
  const summarySheetData = [
    ['RoomSplit Financial Report', cycle.display_name],
    ['Generated On', new Date().toLocaleDateString('en-IN')],
    [],
    ['Financial Metric', 'Amount (INR)'],
    ['Expected Contributions', summary.expected_contributions],
    ['Total Collected', summary.total_collected],
    ['Total Approved Expenses', summary.total_expenses_approved],
    ['  Paid Directly by Treasurer (Saurabh)', summary.total_expenses_direct_treasurer],
    ['  Paid by Room Members', summary.total_expenses_member_paid],
    ['Total Reimbursements Paid', summary.total_reimbursements_paid],
    ['Pending Reimbursements Owed', summary.pending_reimbursements],
    ['Current Room Fund Balance', summary.current_room_fund],
    ['Available Balance (Net)', summary.available_after_obligations],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summarySheetData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // 2. Contributions Sheet
  const contribData = members.map((m) => {
    const c = contributions.find((cb) => cb.member_id === m.id);
    return {
      'Member Name': m.name,
      Role: m.role,
      'Amount (₹)': c ? c.amount : 8000,
      Status: c ? c.status : 'PENDING',
      'Paid Date': c?.paid_at ? new Date(c.paid_at).toLocaleDateString('en-IN') : '-',
      Method: c?.payment_method || '-',
      'Transaction ID': c?.transaction_id || '-',
    };
  });
  const wsContrib = XLSX.utils.json_to_sheet(contribData);
  XLSX.utils.book_append_sheet(wb, wsContrib, 'Contributions');

  // 3. Expenses Sheet
  const expenseData = expenses.map((e) => {
    const paidMember = members.find((m) => m.id === e.paid_by);
    return {
      Date: e.date,
      Title: e.title,
      Category: e.category,
      'Paid By': paidMember?.name || e.paid_by,
      'Amount (₹)': e.amount,
      'Approval Status': e.approval_status,
      'Reimbursement Owed (₹)': e.reimbursement_owed,
      'Reimbursement Paid (₹)': e.reimbursement_paid,
      'Reimbursement Status': e.reimbursement_status || 'N/A',
      Description: e.description || '',
    };
  });
  const wsExpenses = XLSX.utils.json_to_sheet(expenseData);
  XLSX.utils.book_append_sheet(wb, wsExpenses, 'Expenses');

  // Write file
  XLSX.writeFile(wb, `RoomSplit_Report_${cycle.year_month}.xlsx`);
};
