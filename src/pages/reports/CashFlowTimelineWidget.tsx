
// FOURTH VERSION

import { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { useGetFinanceTimelineV1 } from '../../api_services/financeApi/financeApi';
import { useAuthData } from '../../hooks/useAuthData';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// Formatters
const formatDate = (date: Date) => date.toISOString().split('T')[0];
const displayFormat = (dateStr: string) => {
    if (!dateStr) return 'mm/dd/yyyy';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
};

// 🌟 NEW: The Zero-Padding Engine
// This fills in the blank days/months with 0s so the chart timeline doesn't skip missing data
const generatePaddedData = (data: any[], range: string, customStart: string, customEnd: string) => {
    // If there is literally zero data in the database, return empty
    if (!data || data.length === 0) return [];

    let start = new Date();
    let end = new Date();
    let isMonthFormat = false;

    // 1. Determine the exact bounds based on the selected chip
    switch (range) {
        case '30d':
            start.setDate(end.getDate() - 30);
            break;
        case 'year':
            start = new Date(end.getFullYear(), 0, 1);
            isMonthFormat = true;
            break;
        case 'month':
            start = new Date(end.getFullYear(), end.getMonth(), 1);
            break;
        case 'all':
            start = new Date(data[0].date); // Start from the earliest record in the DB
            isMonthFormat = true;
            break;
        case 'custom':
            start = new Date(customStart);
            end = new Date(customEnd);
            const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays > 90) isMonthFormat = true; // Match backend > 90 days grouping
            break;
    }

    const dataMap = new Map(data.map(item => [item.date, item]));
    const paddedData = [];

    let current = new Date(start);
    if (isMonthFormat) current.setDate(1); // Standardize to 1st of month

    // 2. Loop through every single date/month and inject 0s if missing
    while (current <= end || (isMonthFormat && current.getFullYear() === end.getFullYear() && current.getMonth() === end.getMonth())) {
        const yyyy = current.getFullYear();
        const mm = String(current.getMonth() + 1).padStart(2, '0');
        const dd = String(current.getDate()).padStart(2, '0');
        
        const dateKey = isMonthFormat ? `${yyyy}-${mm}` : `${yyyy}-${mm}-${dd}`;

        // Grab real data if it exists, otherwise push a zero-state object
        paddedData.push(
            dataMap.get(dateKey) || { date: dateKey, income: 0, expense: 0 }
        );

        // Increment loop
        if (isMonthFormat) {
            current.setMonth(current.getMonth() + 1);
        } else {
            current.setDate(current.getDate() + 1);
        }
    }
    
    return paddedData;
};

export default function CashFlowTimelineWidget() {
    const { schoolId } = useAuthData();
    const [range, setRange] = useState<'all' | '30d' | 'month' | 'year' | 'custom'>('month');

    // Custom Date States
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const [startDate, setStartDate] = useState(formatDate(firstDay));
    const [endDate, setEndDate] = useState(formatDate(today));

    // Fetch Data
    const { data: timelinePayload, isLoading } = useGetFinanceTimelineV1({
        schoolId: schoolId!,
        range,
        ...(range === 'custom' ? { startDate, endDate } : {})
    });

    // 🌟 Apply the padding logic to the raw backend data
    const rawData = timelinePayload || [];
    const timelineData = useMemo(() => {
        return generatePaddedData(rawData, range, startDate, endDate);
    }, [rawData, range, startDate, endDate]);

    // Chart Configuration
    const chartData = {
        labels: timelineData.map((d: any) => d.date),
        datasets: [
            {
                label: 'Created / Inflows',
                borderColor: '#3b82f6',
                backgroundColor: 'transparent',
                data: timelineData.map((d: any) => d.income),
                borderWidth: 3,
                tension: 0.4,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#3b82f6',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
            {
                label: 'Drafts / Outflows',
                borderColor: '#f59e0b',
                backgroundColor: 'transparent',
                data: timelineData.map((d: any) => d.expense),
                borderWidth: 3,
                tension: 0.4,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#f59e0b',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
            }
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index' as const, intersect: false },
        plugins: {
            legend: { position: 'top' as const, labels: { usePointStyle: true, boxWidth: 8, padding: 20, font: { family: 'Poppins', size: 12, weight: 'bold' } } },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                padding: 12,
                callbacks: {
                    label: function(context: any) {
                        return `${context.dataset.label}: ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(context.parsed.y)}`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                border: { display: false },
                grid: { color: 'rgba(156, 163, 175, 0.2)', drawTicks: false, tickLength: 0 },
                ticks: { padding: 10, color: '#6b7280' }
            },
            x: {
                grid: { display: false },
                ticks: { padding: 10, color: '#6b7280' }
            },
        },
    };

    return (
        <div className="bg-surface p-6 rounded-2xl border border-border flex flex-col h-[500px]">
            {/* Header Row */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-primary rounded-full"></div>
                    <h3 className="font-bold text-foreground uppercase tracking-wide text-sm">
                        Cash Flow (TIMELINE)
                    </h3>
                </div>

                {/* Filters */}
                <div className="flex flex-col items-end gap-3 w-full xl:w-auto">
                    {/* Range Chips */}
                    <div className="flex items-center bg-sub-header/50 p-1 rounded-xl border border-border shrink-0 w-full xl:w-auto justify-between xl:justify-start">
                        {['All', '30D', 'Month', 'Year', 'Custom'].map((r) => {
                            const val = r.toLowerCase();
                            return (
                                <button
                                    key={r}
                                    onClick={() => setRange(val as any)}
                                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                        range === val 
                                            ? 'bg-surface text-primary shadow-sm border border-border/50' 
                                            : 'text-muted hover:text-foreground hover:bg-surface/50'
                                    }`}
                                >
                                    {r}
                                </button>
                            );
                        })}
                    </div>

                    {/* Custom Date Picker Overlay */}
                    {range === 'custom' && (
                        <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-xl p-1.5 shadow-sm animate-in fade-in slide-in-from-top-2">
                            <div className="relative flex items-center px-3 cursor-pointer hover:bg-primary/10 rounded-lg transition-colors h-8">
                                <span className="text-xs font-bold text-primary mr-6 pointer-events-none">{displayFormat(startDate)}</span>
                                <i className="fas fa-calendar-alt text-primary/70 text-xs absolute right-3 pointer-events-none"></i>
                                <input type="date" value={startDate} max={endDate} onChange={(e) => setStartDate(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full layout-datepicker-reset" />
                            </div>
                            <span className="text-primary/30 font-light">—</span>
                            <div className="relative flex items-center px-3 cursor-pointer hover:bg-primary/10 rounded-lg transition-colors h-8">
                                <span className="text-xs font-bold text-primary mr-6 pointer-events-none">{displayFormat(endDate)}</span>
                                <i className="fas fa-calendar-alt text-primary/70 text-xs absolute right-3 pointer-events-none"></i>
                                <input type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full layout-datepicker-reset" />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Chart Container */}
            <div className="flex-1 relative w-full h-full pb-2">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center text-muted">
                        <i className="fas fa-circle-notch fa-spin text-3xl opacity-50"></i>
                    </div>
                ) : timelineData.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted">
                        <i className="fas fa-chart-line text-3xl mb-2 opacity-30"></i>
                        <span className="text-sm font-medium">No data available for this range.</span>
                    </div>
                ) : (
                    <Line data={chartData as any} options={options as any} />
                )}
            </div>
        </div>
    );
}