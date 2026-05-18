import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface OutstandingProps {
    outstandingData: {
        totalOutstanding: number;
        breakdown: {
            admission?: number;
            term1?: number;
            term2?: number;
            transport?: number;
        };
    };
    isLoading: boolean;
}

export default function OutstandingFeesChart({ outstandingData, isLoading }: OutstandingProps) {
    const breakdown = outstandingData?.breakdown || {};
    
    const labels = ['Admission Fees', 'Term 1 Dues', 'Term 2 Dues', 'Transport Logistics'];
    const values = [
        breakdown.admission || 0,
        breakdown.term1 || 0,
        breakdown.term2 || 0,
        breakdown.transport || 0
    ];

    const hasData = values.some(v => v > 0);

    const data = {
        labels,
        datasets: [
            {
                data: values,
                backgroundColor: [
                    'rgba(59, 130, 246, 0.85)',
                    'rgba(168, 85, 247, 0.85)',
                    'rgba(251, 146, 60, 0.85)',
                    'rgba(244, 63, 94, 0.85)'
                ],
                borderColor: 'transparent',
                hoverOffset: 4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    usePointStyle: true,
                    boxWidth: 8,
                    padding: 16,
                    font: { 
                        weight: 'bold' as const, // ✅ Fix: Replaced raw string '600' with typed 'bold' literal
                        size: 11 
                    }
                }
            },
            tooltip: {
                padding: 12,
                borderRadius: 8,
            }
        },
        cutout: '65%'
    };

    return (
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm h-96 flex flex-col">
            <div className="mb-4">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Outstanding Liability Matrix</h3>
                <p className="text-xs text-muted mt-0.5">Categorical structure mapping dynamic uncollected asset balances</p>
            </div>
            <div className="flex-1 relative min-h-0 flex items-center justify-center">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <i className="fas fa-circle-notch fa-spin text-primary text-2xl"></i>
                    </div>
                ) : !hasData ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted">
                        <i className="fas fa-pie-chart text-2xl mb-2 opacity-30"></i>
                        <p className="text-xs">Perfect ledger clearance. Zero pending liabilities identified.</p>
                    </div>
                ) : (
                    <div className="w-full h-full max-h-64 relative">
                        <Doughnut data={data} options={options} />
                    </div>
                )}
            </div>
        </div>
    );
}