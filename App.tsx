import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import GoalsPage from './pages/GoalsPage';
import TransactionsPage from './pages/TransactionsPage';
import InsightsPage from './pages/InsightsPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AddGoalModal from './components/AddGoalModal';
import EditGoalModal from './components/EditGoalModal';
import WithdrawModal from './components/WithdrawModal';
import AddExpenseModal from './components/AddExpenseModal';
import useLocalStorage from './hooks/useLocalStorage';
import type { Goal, Transaction, Expense, RecurringExpense, Page } from './types';
import { getFinancialInsights } from './services/geminiService';

interface UserData {
    monthlyAllowance: number | null;
    monthlySpendingTarget: number | null;
    goals: Goal[];
    transactions: Transaction[];
    expenses: Expense[];
    recurringExpenses: RecurringExpense[];
    lastRecurringCheck: string;
    cachedInsight: string;
    lastInsightFetchTimestamp: number;
}

interface AppData {
    users: Record<string, UserData>;
}

const initialUserData: UserData = {
    monthlyAllowance: null,
    monthlySpendingTarget: null,
    goals: [],
    transactions: [],
    expenses: [],
    recurringExpenses: [],
    lastRecurringCheck: '',
    cachedInsight: '',
    lastInsightFetchTimestamp: 0,
};

// Start with dummy users if it's the first time running the app
const initialAppData: AppData = {
    users: {
        user1: { ...initialUserData, monthlyAllowance: 20000, monthlySpendingTarget: 15000 },
        user2: { ...initialUserData, monthlyAllowance: 25000, monthlySpendingTarget: 18000 },
    }
};


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useLocalStorage<string | null>('currentUser', null);
  const [appData, setAppData] = useLocalStorage<AppData>('appData', initialAppData);
  
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [authPage, setAuthPage] = useState<'login' | 'signup'>('login');
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [isEditGoalModalOpen, setIsEditGoalModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const [isInsightLoading, setIsInsightLoading] = useState(false);

  const KNOWN_USERS = useMemo(() => Object.keys(appData.users), [appData.users]);
  
  const currentUserData = useMemo(() => {
    if (currentUser && appData.users[currentUser]) {
      return appData.users[currentUser];
    }
    return initialUserData;
  }, [currentUser, appData]);
  
  const updateCurrentUserData = (newUserData: Partial<UserData>) => {
      if (!currentUser) return;
      setAppData(prevData => ({
          ...prevData,
          users: {
              ...prevData.users,
              [currentUser]: {
                  ...prevData.users[currentUser],
                  ...newUserData
              }
          }
      }));
  };

  useEffect(() => {
    if (!currentUser) return;
    const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    if (currentUserData.lastRecurringCheck !== currentMonth) {
      const newExpenses: Expense[] = currentUserData.recurringExpenses.map(re => ({
        id: `${re.id}-${currentMonth}`,
        name: `${re.name} (Recurring)`,
        amount: re.amount,
        category: re.category,
        date: new Date().toISOString(),
      }));

      const existingRecurringExpenseIds = currentUserData.expenses.map(e => e.id);
      const uniqueNewExpenses = newExpenses.filter(ne => !existingRecurringExpenseIds.includes(ne.id));
      
      if (uniqueNewExpenses.length > 0) {
        updateCurrentUserData({ expenses: [...currentUserData.expenses, ...uniqueNewExpenses] });
      }
      updateCurrentUserData({ lastRecurringCheck: currentMonth });
    }
  }, [currentUser, currentUserData.recurringExpenses, currentUserData.lastRecurringCheck, currentUserData.expenses]);

  const totalExpenses = useMemo(() => {
    return currentUserData.expenses
      .filter(expense => !expense.isRefunded)
      .reduce((total, expense) => total + (expense.myShare ?? expense.amount) , 0);
  }, [currentUserData.expenses]);

  const contributionsThisMonth = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return currentUserData.transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return t.type === 'deposit' && tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
      })
      .reduce((total, t) => total + t.amount, 0);
  }, [currentUserData.transactions]);
  
  const totalSavedInGoals = useMemo(() => currentUserData.goals.reduce((sum, goal) => sum + goal.savedAmount, 0), [currentUserData.goals]);
  
  const personalSavingsPot = (currentUserData.monthlyAllowance || 0) - (currentUserData.monthlySpendingTarget || 0);
  const savingsLeftToAllocate = personalSavingsPot - contributionsThisMonth;
  const remainingSpendingMoney = (currentUserData.monthlySpendingTarget || 0) - totalExpenses;
  
  const fetchInsights = useCallback(async (forceRefresh = false) => {
    if (currentUserData.monthlyAllowance === null || currentUserData.monthlySpendingTarget === null) return;

    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    // Only fetch if it's a force refresh, or if there's no cached insight, or if cache is older than 5 minutes
    if (!forceRefresh && currentUserData.cachedInsight && (now - currentUserData.lastInsightFetchTimestamp < fiveMinutes)) {
        return;
    }

    setIsInsightLoading(true);
    const newInsight = await getFinancialInsights(currentUserData.goals, currentUserData.transactions, currentUserData.expenses, currentUserData.monthlyAllowance, currentUserData.monthlySpendingTarget, contributionsThisMonth);
    updateCurrentUserData({
        cachedInsight: newInsight,
        lastInsightFetchTimestamp: Date.now(),
    });
    setIsInsightLoading(false);
  }, [currentUserData.goals, currentUserData.transactions, currentUserData.expenses, currentUserData.monthlyAllowance, currentUserData.monthlySpendingTarget, contributionsThisMonth, currentUserData.cachedInsight, currentUserData.lastInsightFetchTimestamp]);

  useEffect(() => {
    if(currentUserData.monthlyAllowance !== null) {
        fetchInsights();
    }
  }, [currentUserData.monthlyAllowance, fetchInsights]); 

  const handleAddGoal = (newGoalData: Omit<Goal, 'id' | 'savedAmount'>) => {
    if (newGoalData.monthlyContribution > savingsLeftToAllocate) {
      if (!window.confirm("This contribution is higher than your available savings for the month. Add anyway?")) {
        return;
      }
    }
    const newGoal: Goal = {
      ...newGoalData,
      id: new Date().toISOString(),
      savedAmount: 0,
    };
    updateCurrentUserData({ goals: [...currentUserData.goals, newGoal] });
  };

  const handleEditGoal = (updatedGoal: Goal) => {
    updateCurrentUserData({ goals: currentUserData.goals.map(g => g.id === updatedGoal.id ? updatedGoal : g) });
    setIsEditGoalModalOpen(false);
    setSelectedGoal(null);
  };
  
  const handleDeleteGoal = (goalId: string) => {
      if(window.confirm("Are you sure you want to delete this goal? This action cannot be undone.")) {
          updateCurrentUserData({ goals: currentUserData.goals.filter(g => g.id !== goalId) });
      }
  };

  const handleAddExpense = (newExpenseData: Omit<Expense, 'id'>, isRecurring: boolean, dayOfMonth?: number) => {
      if (!currentUser) return;
      
      const newExpense: Expense = {
          ...newExpenseData,
          id: `${currentUser}-${new Date().toISOString()}`,
      };
      
      updateCurrentUserData({ expenses: [...currentUserData.expenses, newExpense] });

      if (isRecurring && dayOfMonth) {
        const newRecurringExpense: RecurringExpense = {
            id: new Date().toISOString(),
            name: newExpenseData.name,
            amount: newExpenseData.amount,
            category: newExpenseData.category,
            dayOfMonth,
        };
        updateCurrentUserData({ recurringExpenses: [...currentUserData.recurringExpenses, newRecurringExpense] });
      }
  }
  
  const handleAcceptSplitRequest = (requesterName: string, expenseId: string) => {
    if (!currentUser) return;
    
    setAppData(prevData => {
        const newData = JSON.parse(JSON.stringify(prevData));
        const requesterData = newData.users[requesterName];
        const acceptorData = newData.users[currentUser];

        if (!requesterData || !acceptorData) return prevData;

        // Find original expense and update its status
        const originalExpense = requesterData.expenses.find((e: Expense) => e.id === expenseId);
        if (!originalExpense) return prevData;
        
        originalExpense.splitStatus[currentUser] = 'accepted';

        // Create a new expense for the acceptor
        const numPeople = (originalExpense.splitWith?.length ?? 0) + 1;
        const shareAmount = originalExpense.amount / numPeople;

        const newExpenseForAcceptor: Expense = {
            id: `${currentUser}-${new Date().toISOString()}`,
            name: `${originalExpense.name} (Split)`,
            category: originalExpense.category,
            amount: shareAmount,
            myShare: shareAmount, // For an accepted request, amount and myshare are the same
            date: new Date().toISOString(),
            isSplitRequest: true,
            requestedBy: requesterName,
        };
        
        acceptorData.expenses = [...acceptorData.expenses, newExpenseForAcceptor];

        return newData;
    });
    alert('Split request accepted!');
  };

  const handleDeclineSplitRequest = (requesterName: string, expenseId: string) => {
      if (!currentUser) return;
      setAppData(prevData => {
          const newData = JSON.parse(JSON.stringify(prevData));
          const requesterData = newData.users[requesterName];
          if (!requesterData) return prevData;

          const originalExpense = requesterData.expenses.find((e: Expense) => e.id === expenseId);
          if (!originalExpense) return prevData;
          
          originalExpense.splitStatus[currentUser] = 'declined';
          
          return newData;
      });
      alert('Split request declined.');
  };

  const handleDeleteRecurringExpense = (id: string) => {
    if(window.confirm("Are you sure you want to delete this recurring expense?")) {
        updateCurrentUserData({ recurringExpenses: currentUserData.recurringExpenses.filter(re => re.id !== id) });
    }
  }
  
  const handleRefundExpense = (expenseId: string) => {
    if (window.confirm("Marking this as refunded will remove it from your total expenses. Are you sure?")) {
        updateCurrentUserData({ expenses: currentUserData.expenses.map(exp => exp.id === expenseId ? { ...exp, isRefunded: true } : exp) });
    }
  };

  const handleDeleteExpense = (expenseId: string) => {
    if (window.confirm("Are you sure you want to permanently delete this expense?")) {
      updateCurrentUserData({ expenses: currentUserData.expenses.filter(exp => exp.id !== expenseId) });
    }
  };
  
  const handleManualSettle = (expenseId: string, username: string) => {
      if (!currentUser) return;
      setAppData(prevData => {
          const newData = JSON.parse(JSON.stringify(prevData));
          const userExpenses = newData.users[currentUser].expenses;
          const expenseIndex = userExpenses.findIndex((e: Expense) => e.id === expenseId);
          if (expenseIndex > -1) {
              userExpenses[expenseIndex].splitStatus[username] = 'settled';
          }
          return newData;
      });
  };

  const handleEditClick = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsEditGoalModalOpen(true);
  }

  const handleWithdrawClick = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsWithdrawModalOpen(true);
  };

  const handleWithdraw = (goalId: string, amount: number, reason: string) => {
    const goal = currentUserData.goals.find(g => g.id === goalId);
    if (!goal) return;

    const newGoals = currentUserData.goals.map(g =>
        g.id === goalId ? { ...g, savedAmount: g.savedAmount - amount } : g
    );

    const newTransaction: Transaction = {
      id: new Date().toISOString(),
      goalId,
      goalName: goal.name,
      goalEmoji: goal.emoji,
      amount,
      reason,
      date: new Date().toISOString(),
      type: 'withdrawal',
    };
    updateCurrentUserData({ goals: newGoals, transactions: [...currentUserData.transactions, newTransaction] });
  };
  
  const handleContributeToGoal = (goalId: string) => {
    const goal = currentUserData.goals.find(g => g.id === goalId);
    if (!goal) return;

    if (goal.savedAmount >= goal.targetAmount) {
        alert("This goal is already completed!");
        return;
    }

    const amountToAdd = Math.min(
      goal.monthlyContribution,
      goal.targetAmount - goal.savedAmount
    );

    if (amountToAdd <= 0) return;
    
    if (amountToAdd > savingsLeftToAllocate) {
        if (!window.confirm("You don't have enough in your savings pot for this contribution. Proceed anyway?")) {
            return;
        }
    }
    
    const newGoals = currentUserData.goals.map(g =>
        g.id === goalId ? { ...g, savedAmount: g.savedAmount + amountToAdd } : g
    );

    const newTransaction: Transaction = {
      id: `${goal.id}-${new Date().toISOString()}`,
      goalId: goal.id,
      goalName: goal.name,
      goalEmoji: goal.emoji,
      amount: amountToAdd,
      date: new Date().toISOString(),
      type: 'deposit',
    };
    
    updateCurrentUserData({ goals: newGoals, transactions: [...currentUserData.transactions, newTransaction] });
    alert(`₹${amountToAdd.toFixed(2)} has been added to your "${goal.name}" goal!`);
  };
  
  const handleUpdateBudget = (newAllowance: number, newSpendingTarget: number) => {
      if (newSpendingTarget > newAllowance) {
          alert("Your spending target cannot be greater than your total allowance.");
          return;
      }
      updateCurrentUserData({ monthlyAllowance: newAllowance, monthlySpendingTarget: newSpendingTarget });
      alert("Budget updated successfully!");
  };

  const handleLogin = (username: string, password_unused: string): boolean => {
      if (appData.users[username]) {
          setCurrentUser(username);
          return true;
      }
      return false;
  };

  const handleSignup = (username: string, password_unused: string): boolean => {
      if (appData.users[username]) {
          return false; // User already exists
      }
      setAppData(prevData => ({
          ...prevData,
          users: {
              ...prevData.users,
              [username]: { ...initialUserData }
          }
      }));
      setCurrentUser(username);
      return true;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('home');
  }
  
  const incomingSplitRequests = useMemo(() => {
    if (!currentUser) return [];
    
    const requests: Array<Expense & { requester: string }> = [];
    Object.entries(appData.users).forEach(([username, userData]) => {
        if (username !== currentUser) {
            userData.expenses.forEach(expense => {
                if (expense.splitWith?.some(p => p.username === currentUser) && expense.splitStatus?.[currentUser] === 'pending') {
                    requests.push({ ...expense, requester: username });
                }
            });
        }
    });
    return requests;
  }, [appData, currentUser]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage 
                    remainingSpendingMoney={remainingSpendingMoney}
                    monthlySpendingTarget={currentUserData.monthlySpendingTarget || 0}
                    savingsLeftToAllocate={savingsLeftToAllocate}
                    personalSavingsPot={personalSavingsPot}
                    totalSavedInGoals={totalSavedInGoals}
                    goals={currentUserData.goals}
                    insight={currentUserData.cachedInsight}
                    fetchInsights={() => fetchInsights(true)}
                    isInsightLoading={isInsightLoading}
                    setIsAddExpenseModalOpen={setIsAddExpenseModalOpen}
                    setIsAddGoalModalOpen={setIsAddGoalModalOpen}
                    expenses={currentUserData.expenses}
                    onRefundExpense={handleRefundExpense}
                    onDeleteExpense={handleDeleteExpense}
                    incomingSplitRequests={incomingSplitRequests}
                    onAcceptSplit={handleAcceptSplitRequest}
                    onDeclineSplit={handleDeclineSplitRequest}
                    onManualSettle={handleManualSettle}
                    currentUser={currentUser || ''}
                />;
      case 'goals':
        return <GoalsPage 
                    goals={currentUserData.goals} 
                    onWithdrawClick={handleWithdrawClick} 
                    onContributeClick={handleContributeToGoal} 
                    onDeleteGoal={handleDeleteGoal}
                    onEditClick={handleEditClick}
                    setIsAddGoalModalOpen={setIsAddGoalModalOpen}
                />;
      case 'transactions':
        return <TransactionsPage transactions={currentUserData.transactions} goals={currentUserData.goals} />;
      case 'insights':
        return <InsightsPage expenses={currentUserData.expenses} goals={currentUserData.goals} insight={currentUserData.cachedInsight} isInsightLoading={isInsightLoading} onRefresh={() => fetchInsights(true)} />;
      case 'settings':
        return <SettingsPage 
                    monthlyAllowance={currentUserData.monthlyAllowance || 0}
                    monthlySpendingTarget={currentUserData.monthlySpendingTarget || 0}
                    onUpdateBudget={handleUpdateBudget}
                    recurringExpenses={currentUserData.recurringExpenses}
                    onDeleteRecurringExpense={handleDeleteRecurringExpense}
                    onLogout={handleLogout}
                />;
      default:
        return <HomePage 
                    remainingSpendingMoney={remainingSpendingMoney}
                    monthlySpendingTarget={currentUserData.monthlySpendingTarget || 0}
                    savingsLeftToAllocate={savingsLeftToAllocate}
                    personalSavingsPot={personalSavingsPot}
                    totalSavedInGoals={totalSavedInGoals}
                    goals={currentUserData.goals}
                    insight={currentUserData.cachedInsight}
                    fetchInsights={() => fetchInsights(true)}
                    isInsightLoading={isInsightLoading}
                    setIsAddExpenseModalOpen={setIsAddExpenseModalOpen}
                    setIsAddGoalModalOpen={setIsAddGoalModalOpen}
                    expenses={currentUserData.expenses}
                    onRefundExpense={handleRefundExpense}
                    onDeleteExpense={handleDeleteExpense}
                    incomingSplitRequests={incomingSplitRequests}
                    onAcceptSplit={handleAcceptSplitRequest}
                    onDeclineSplit={handleDeclineSplitRequest}
                    onManualSettle={handleManualSettle}
                    currentUser={currentUser || ''}
                />;
    }
  };

  const Onboarding = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-950 p-4">
        <div className="w-full max-w-sm mx-auto text-center">
            <div className="flex justify-center items-center mb-4">
                 <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-white text-3xl">S</div>
            </div>
            <h1 className="text-4xl font-bold mb-2 text-white">Welcome to SmartSave</h1>
            <p className="text-slate-400 mb-8">Let's set up your monthly budget to get started.</p>
            <form onSubmit={(e) => { 
                e.preventDefault(); 
                const form = e.target as HTMLFormElement;
                const allowance = parseFloat(form.allowance.value);
                const spendingTarget = parseFloat(form.spendingTarget.value);
                if (spendingTarget > allowance) {
                    alert("Your spending target cannot be greater than your total allowance.");
                    return;
                }
                updateCurrentUserData({ monthlyAllowance: allowance, monthlySpendingTarget: spendingTarget });
            }} className="space-y-6">
                <div>
                    <label className="text-lg text-slate-300 mb-2 block">Your total monthly allowance (in ₹)</label>
                    <input type="number" name="allowance" className="w-full p-3 text-center bg-slate-800 border-slate-700 rounded-lg text-white text-2xl focus:ring-2 focus:ring-purple-500 focus:outline-none" placeholder="20000" required />
                </div>
                <div>
                    <label className="text-lg text-slate-300 mb-2 block">How much do you want to spend? (Spending Target)</label>
                    <input type="number" name="spendingTarget" className="w-full p-3 text-center bg-slate-800 border-slate-700 rounded-lg text-white text-2xl focus:ring-2 focus:ring-purple-500 focus:outline-none" placeholder="12000" required />
                    <p className="text-xs text-slate-500 mt-2">The rest automatically goes into your Personal Savings Pot for goals.</p>
                </div>
                <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-lg transition-colors text-lg">
                    Get Started
                </button>
            </form>
        </div>
    </div>
  );

  if (!currentUser) {
      if (authPage === 'login') {
          return <LoginPage onLogin={handleLogin} onSwitchToSignup={() => setAuthPage('signup')} />;
      } else {
          return <SignupPage onSignup={handleSignup} onSwitchToLogin={() => setAuthPage('login')} />;
      }
  }

  if (currentUserData.monthlyAllowance === null || currentUserData.monthlySpendingTarget === null) {
    return <Onboarding />;
  }

  return (
    <div className="md:flex h-screen w-full bg-blue-950">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} currentUser={currentUser} />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 mb-16 md:mb-0">
          {renderPage()}
      </main>

      {isAddGoalModalOpen && (
        <AddGoalModal onClose={() => setIsAddGoalModalOpen(false)} onAddGoal={handleAddGoal} />
      )}
      {isEditGoalModalOpen && selectedGoal && (
        <EditGoalModal goal={selectedGoal} onClose={() => setIsEditGoalModalOpen(false)} onEditGoal={handleEditGoal} />
      )}
      {isWithdrawModalOpen && selectedGoal && (
        <WithdrawModal goal={selectedGoal} onClose={() => setIsWithdrawModalOpen(false)} onWithdraw={handleWithdraw} />
      )}
      {isAddExpenseModalOpen && (
        <AddExpenseModal onClose={() => setIsAddExpenseModalOpen(false)} onAddExpense={handleAddExpense} currentUser={currentUser} knownUsers={KNOWN_USERS} />
      )}
    </div>
  );
};

export default App;