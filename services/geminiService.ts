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
    monthlyBudget: number
): Promise<string> => {
  if (goals.length === 0 && transactions.length === 0 && expenses.length === 0) {
    return "Start by creating a savings goal or adding an expense to get personalized insights!";
  }

  const withdrawalReasons = transactions
    .filter(t => t.type === 'withdrawal' && t.reason)
    .map(w => w.reason)
    .join(', ');
    
  const goalsSummary = goals.map(g => `${g.name} (₹${g.savedAmount}/₹${g.targetAmount})`).join(', ');

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const expenseByCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<ExpenseCategory, number>);
  
  const expenseSummary = Object.entries(expenseByCategory)
    .map(([category, total]) => `${category}: ₹${total.toFixed(2)}`)
    .join(', ');

  const budgetSummary = monthlyBudget > 0 
    ? `They have a monthly budget of ₹${monthlyBudget} and have spent ₹${totalExpenses.toFixed(2)} so far.`
    : 'They have not set a monthly budget.';

  try {
    const prompt = `
      Analyze this student's financial data (all amounts in INR).
      - Monthly Allowance: ₹${allowance}
      - Spending & Budget: ${budgetSummary}
      - Savings Goals: ${goalsSummary || 'None'}
      - Spending by Category: ${expenseSummary || 'None'}
      - Recent withdrawal reasons from savings: ${withdrawalReasons || 'None'}

      Provide a short, motivational, and helpful financial insight (max 2-3 sentences) for a college student in India. Be encouraging and provide one actionable tip. For example, mention their highest spending category, praise good saving discipline, comment on their budget adherence, or suggest areas for improvement based on spending or withdrawals.
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