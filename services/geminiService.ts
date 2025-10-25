import { GoogleGenAI } from "@google/genai";
import type { Goal, Transaction, Expense, ExpenseCategory } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const getSavingSuggestion = async (targetAmount: number, months: number): Promise<number> => {
  if (months <= 0) return targetAmount;
  try {
    const prompt = `A student wants to save ₹${targetAmount} in ${months} months. What's a reasonable monthly savings amount in Rupees? Respond with only the number, no currency symbols or text.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    const suggestionText = response.text.trim();
    const suggestedAmount = parseFloat(suggestionText.replace(/[^0-9.]/g, ''));
    return isNaN(suggestedAmount) ? Math.ceil(targetAmount / months) : Math.ceil(suggestedAmount);
  } catch (error) {
    console.error("Error getting saving suggestion:", error);
    return Math.ceil(targetAmount / months);
  }
};

export const getFinancialInsights = async (
    goals: Goal[], 
    transactions: Transaction[], 
    expenses: Expense[], 
    allowance: number,
    spendingTarget: number,
    contributionsThisMonth: number
): Promise<string> => {
  if (goals.length === 0 && transactions.length === 0 && expenses.length === 0) {
    return "Start by creating a savings goal or adding an expense to get personalized insights!";
  }
    
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remainingSpendingMoney = spendingTarget - totalExpenses;
  const personalSavingsPot = allowance - spendingTarget;
  const availablePersonalSavings = personalSavingsPot - contributionsThisMonth;

  const withdrawalReasons = transactions
    .filter(t => t.type === 'withdrawal' && t.reason)
    .map(w => w.reason)
    .join(', ');
    
  const goalsSummary = goals.map(g => `${g.name} (₹${g.savedAmount}/₹${g.targetAmount})`).join(', ');

  const expenseByCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<ExpenseCategory, number>);
  
  const expenseSummary = Object.entries(expenseByCategory)
    .map(([category, total]) => `${category}: ₹${total.toFixed(2)}`)
    .join(', ');

  const financialStatusSummary = `
      - Total Monthly Allowance: ₹${allowance.toFixed(2)}
      - Student's Monthly Spending Target: ₹${spendingTarget.toFixed(2)}
      - Automatic Personal Savings Pot (Allowance - Target): ₹${personalSavingsPot.toFixed(2)}
      ---
      - Spent on Expenses: ₹${totalExpenses.toFixed(2)}
      - Remaining Spending Money: ₹${remainingSpendingMoney.toFixed(2)}
      ---
      - Contributed to Specific Savings Goals this month: ₹${contributionsThisMonth.toFixed(2)}
      - Savings left to allocate from Pot: ₹${availablePersonalSavings.toFixed(2)}
    `;

  try {
    const prompt = `
      You are a friendly financial advisor for a college student in India. Analyze the following financial data for the month (all amounts in INR). The student has a "Pay Yourself First" budget: they set a spending target, and the rest of their allowance automatically goes into a personal savings pot for their goals.

      Financial Overview:
      ${financialStatusSummary}

      Detailed Breakdown:
      - Savings Goals: ${goalsSummary || 'None'}
      - Spending by Category: ${expenseSummary || 'None'}
      - Reasons for withdrawing from savings: ${withdrawalReasons || 'None'}

      Based on this, provide a short, motivational, and highly actionable financial insight (max 3-4 sentences). Your goal is to help the student stick to their *spending target* and utilize their *savings pot* effectively.

      Instructions:
      1.  Look at the 'Remaining Spending Money'. If it's positive, praise them for staying within their target. If it's negative, they've overspent their target; be encouraging about getting back on track.
      2.  Identify their highest spending category from the breakdown.
      3.  Provide one *very specific and practical tip* to reduce spending in that category to help them meet their *spending target*. For example, instead of "spend less on food," suggest "try the university canteen for lunch twice a week instead of ordering out."
      4.  Acknowledge their savings. If they contributed a good amount, commend their discipline. If contributions are low, gently suggest that sticking to their spending target will free up more money for their goals from the savings pot.
      5.  Keep the tone encouraging, not critical. Focus on the strategy of separating spending and saving.
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error("Error getting financial insights:", error);
    return "Could not retrieve AI insights at the moment. Keep tracking your finances!";
  }
};
