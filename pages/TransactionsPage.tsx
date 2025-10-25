import React from 'react';
import type { Transaction, Goal } from '../types';
import TransactionHistory from '../components/TransactionHistory';
import { exportTransactionsToCSV } from '../utils/csvExporter';
import { DownloadIcon } from '../components/Icons';


interface TransactionsPageProps {
  transactions: Transaction[];
  goals: Goal[];
}

const TransactionsPage: React.FC<TransactionsPageProps> = ({ transactions, goals }) => {
  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">Transactions</h1>
            <button 
                onClick={() => exportTransactionsToCSV(transactions)}
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
            >
                <DownloadIcon className="h-5 w-5" />
                <span>Export to CSV</span>
            </button>
        </div>
        <TransactionHistory transactions={transactions} goals={goals} />
    </div>
  );
};

export default TransactionsPage;