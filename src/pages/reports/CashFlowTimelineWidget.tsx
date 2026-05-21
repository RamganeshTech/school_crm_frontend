// components/dashboard/charts/CashFlowTimelineWidget.tsx
import { useState } from 'react';
import { Chart } from 'react-chartjs-2';
import { useGetFinanceTimeline } from '../../api_services/financeApi/financeApi';
import { useAuthData } from '../../hooks/useAuthData';
import type { ChartData, ChartOptions } from 'chart.js';
// import { useGetFinanceTimeline } from '../../../api_services/financeApi'; // Adjust path
// import { useAuthData } from '../../../hooks/useAuthData';

export default function CashFlowTimelineWidget() {
    const { schoolId } = useAuthData();
    // Local state for the filter chips
    const [range, setRange] = useState<'week' | 'month' | 'year'>('month');

    // Self-fetching data
    const { data: timelinePayload, isLoading } = useGetFinanceTimeline({
        schoolId: schoolId!,
        range
    });

    const timelineData = timelinePayload || [];

   // Add the explicit generic type here
const chartData: ChartData<'bar' | 'line'> = {
    labels: timelineData.map((d: any) => d.date),
    datasets: [
        {
            type: 'line' as const, 
            label: 'Outflows / Debits',
            borderColor: '#ef4444', 
            borderWidth: 2,
            fill: false,
            data: timelineData.map((d: any) => d.expense),
            tension: 0.3, 
            pointRadius: 3,
        },
        {
            type: 'bar' as const,
            label: 'Inflows / Credits',
            backgroundColor: '#10b981', 
            data: timelineData.map((d: any) => d.income),
            borderRadius: 4, 
        },
    ],
};


    // Explicitly typing it as ChartOptions prevents deep partial inference errors
    const options: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8 } },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                padding: 12,
                titleFont: { size: 13 },
                bodyFont: { size: 13 },
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                // FIX: Moved 'dash' into the 'border' object for Chart.js v4
                border: {
                    dash: [4, 4]
                },
                grid: {
                    // You can still put grid-specific things here, like color
                }
            },
            x: {
                grid: {
                    display: false
                }
            },
        },
    };

    return (
        <div className="bg-surface p-6 rounded-2xl border border-border flex flex-col h-[400px]">
            {/* Header with Chips */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h3 className="font-bold text-foreground uppercase tracking-wide text-sm">Cash Flow Runway Trends</h3>
                    <p className="text-xs text-muted mt-1">Comparative overlay tracking baseline collections against operational expenses</p>
                </div>

                {/* Independent Filter Chips */}
                <div className="flex items-center gap-2 bg-mainBg p-1 rounded-lg border border-border">
                    {['week', 'month', 'year'].map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r as any)}
                            className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md transition-colors ${range === r ? 'bg-primary text-inverse shadow-sm' : 'text-muted hover:text-foreground'
                                }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart Area */}
            <div className="flex-1 relative w-full h-full">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center text-muted">
                        <i className="fas fa-circle-notch fa-spin text-2xl"></i>
                    </div>
                ) : timelineData.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center text-muted text-sm font-medium">
                        No financial data available for this range.
                    </div>
                ) : (
                    <Chart type="bar" data={chartData as any} options={options} />
                )}
            </div>
        </div>
    );
}