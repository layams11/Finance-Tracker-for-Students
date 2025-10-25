import React, { useEffect, useRef } from 'react';
import type { Chart } from 'chart.js';
import type { Expense, ExpenseCategory } from '../../types';

interface CategoryDoughnutChartProps {
    expenses: Expense[];
}

const categoryColors: Record<ExpenseCategory, { border: string; bg: string }> = {
    'Education': { border: 'rgb(59, 130, 246)', bg: 'rgba(59, 130, 246, 0.5)' },
    'Food': { border: 'rgb(249, 115, 22)', bg: 'rgba(249, 115, 22, 0.5)' },
    'Transport': { border: 'rgb(168, 85, 247)', bg: 'rgba(168, 85, 247, 0.5)' },
    'Fun': { border: 'rgb(236, 72, 153)', bg: 'rgba(236, 72, 153, 0.5)' },
    'Utilities': { border: 'rgb(234, 179, 8)', bg: 'rgba(234, 179, 8, 0.5)' },
    'Other': { border: 'rgb(107, 114, 128)', bg: 'rgba(107, 114, 128, 0.5)' }
};

const CategoryDoughnutChart: React.FC<CategoryDoughnutChartProps> = ({ expenses }) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<Chart | null>(null);

    useEffect(() => {
        if (!chartRef.current) return;
        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;

        const spendingByCategory = expenses.reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
            return acc;
        }, {} as Record<ExpenseCategory, number>);

        const labels = Object.keys(spendingByCategory) as ExpenseCategory[];
        const data = Object.values(spendingByCategory);

        // Destroy previous chart instance if it exists
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        chartInstanceRef.current = new (window as any).Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Spending by Category',
                    data: data,
                    backgroundColor: labels.map(label => categoryColors[label].bg),
                    borderColor: labels.map(label => categoryColors[label].border),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#9ca3af', // text-slate-400
                            font: {
                                family: 'Inter',
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Spending Breakdown',
                        color: '#f1f5f9', // text-slate-100
                        font: {
                            size: 18,
                            family: 'Inter',
                        }
                    }
                }
            }
        });

        // Cleanup function
        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
                chartInstanceRef.current = null;
            }
        };

    }, [expenses]);

    return (
        <div className="relative h-96 w-full">
            <canvas ref={chartRef}></canvas>
        </div>
    );
};

export default CategoryDoughnutChart;