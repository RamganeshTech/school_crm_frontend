import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface TrendsChartProps {
    timelineData: Array<{ date: string; income: number; expense: number }>;
    isLoading: boolean;
}

export default function FinanceTrendsChart({ timelineData, isLoading }: TrendsChartProps) {

    const labels = timelineData?.map(item => item?.date);
    const incomeData = timelineData?.map(item => item?.income);
    const expenseData = timelineData?.map(item => item?.expense);

    const data = {
        labels,
        datasets: [
            {
                type: 'bar' as const,
                label: 'Inflows / Credits',
                backgroundColor: 'rgba(34, 197, 94, 0.85)',
                borderColor: 'rgb(34, 197, 94)',
                borderWidth: 1,
                borderRadius: 6,
                data: incomeData,
            },
            {
                type: 'line' as const,
                label: 'Outflows / Debits',
                borderColor: 'rgb(239, 68, 68)',
                borderWidth: 2,
                fill: false,
                tension: 0.15,
                pointBackgroundColor: 'rgb(239, 68, 68)',
                data: expenseData,
            }
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    usePointStyle: true,
                    boxWidth: 8,
                    font: {
                        weight: 'bold' as const, // ✅ Fix: Explicit type literal or use 'bold' as const
                        size: 11
                    }
                }
            },
            tooltip: {
                padding: 12,
                borderRadius: 8,
                usePointStyle: true,
            }
        },
        scales: {
            x: {
                grid: { display: false },
                // ticks: { font: { size: 10, weight: '500' } }
                ticks: { font: { size: 10, weight: 'normal' as const } } // ✅ Fix
            },
            y: {
                grid: { color: 'rgba(0, 0, 0, 0.04)' },
                // ticks: { font: { size: 10, weight: '500' } }
                ticks: { font: { size: 10, weight: 'normal' as const } } // ✅ Fix
            }
        }
    };

    return (
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm h-96 flex flex-col">
            <div className="mb-4">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Cash Flow Runway Trends</h3>
                <p className="text-xs text-muted mt-0.5">Comparative overlay tracking baseline collections against operational expenses</p>
            </div>
            <div className="flex-1 relative min-h-0">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <i className="fas fa-circle-notch fa-spin text-primary text-2xl"></i>
                    </div>
                ) : timelineData?.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted">
                        <i className="fas fa-chart-line text-2xl mb-2 opacity-30"></i>
                        <p className="text-xs">No ledger activity captured for this block timeline.</p>
                    </div>
                ) : (
                    <Chart type="bar" data={data} options={options} />
                )}
            </div>
        </div>
    );
}