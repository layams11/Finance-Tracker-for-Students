import type { Transaction } from '../types';

export const exportTransactionsToCSV = (transactions: Transaction[]) => {
  if (transactions.length === 0) {
    alert("No transactions to export.");
    return;
  }

  const headers = ['ID', 'Date', 'Type', 'Amount (₹)', 'Goal Name', 'Reason'];
  
  const rows = transactions.map(t => [
    t.id,
    new Date(t.date).toLocaleString(),
    t.type,
    t.amount,
    t.goalName || 'N/A',
    t.reason || 'N/A'
  ]);

  let csvContent = "data:text/csv;charset=utf-8," 
    + [headers, ...rows].map(e => e.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `smartsave_transactions_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);

  link.click();
  document.body.removeChild(link);
};