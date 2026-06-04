// components/dashboard/charts/CollectedFeesWidget.tsx
import { Doughnut } from 'react-chartjs-2';
import { useGetCollectedFeesStats } from '../../api_services/financeApi/financeApi';
import { useAuthData } from '../../hooks/useAuthData';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { SearchSelect } from '../../shared/ui/SearchSelect';
import { getAcademicYears } from '../../utils/utils';
import { useEffect, useState } from 'react';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function CollectedFeesWidget({ defaultYear }: { defaultYear: string }) {
    const { schoolId } = useAuthData();

    const [academicYear, setAcademicYear] = useState(defaultYear);

    useEffect(() => {
        if (defaultYear) {
            setAcademicYear(defaultYear);
        }
    }, [defaultYear]); // This runs every time defaultYear changes from the parent


    const { data: collectedData, isLoading } = useGetCollectedFeesStats({
        schoolId: schoolId!,
        academicYear: academicYear || '2026-2027' // Fallback or pass from parent
    });

    const breakdown = collectedData?.breakdown || {};
    const totalCollected = collectedData?.totalCollected || 0;

    // Convert the breakdown object into arrays for Chart.js
    const labels = Object.keys(breakdown);
    const dataValues = Object.values(breakdown);

    const chartData = {
        labels: labels,
        datasets: [
            {
                data: dataValues,
                backgroundColor: [
                    '#10b981', // Success Green (Term 1)
                    '#3b82f6', // Blue (Term 2)
                    '#8b5cf6', // Purple (Admission)
                    '#f59e0b', // Orange (Transport)
                ],
                borderWidth: 0,
                hoverOffset: 4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%', // Makes it a nice thin Doughnut ring instead of a full pie
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: { family: 'Poppins', size: 12 }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                padding: 12,
                callbacks: {
                    label: function (context: any) {
                        return ` ${context.label}: ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(context.raw)}`;
                    }
                }
            }
        }
    };

    return (
        <div className="bg-surface p-6 rounded-2xl border border-border flex flex-col min-h-[400px]">

            {/* Simple, Non-Technical Header */}
            {/* <div className="mb-4"> */}
            <div className="flex justify-between items-start mb-6">

                <div>
                    {/* <h3 className="font-bold text-foreground uppercase tracking-wide text-sm">Outstanding Fees</h3>
                    <p className="text-xs text-muted mt-1">Track pending term fees, and transport dues across the school.</p> */}

                    <h3 className="font-bold text-foreground uppercase tracking-wide text-sm flex items-center gap-2">
                        {/* <i className="fas fa-piggy-bank text-success"></i> */}
                        Collected Fees
                    </h3>
                    <p className="text-xs text-muted mt-1">
                        See exactly how much money has been paid for each fee category.
                    </p>

                </div>


                <div className="w-40 shrink-0">
                    <SearchSelect
                        label="" // Kept empty for a cleaner top-bar look
                        options={getAcademicYears()}
                        value={academicYear}
                        onChange={(opt) => setAcademicYear(opt.value as string)}
                        placeholder="Select Year..."
                    />
                </div>
            </div>

            {/* Chart Area */}
            <div className="flex-1 relative flex flex-col items-center justify-center">
                {isLoading ? (
                    <i className="fas fa-circle-notch fa-spin text-3xl text-muted opacity-50"></i>
                ) : totalCollected === 0 ? (
                    <div className="text-center space-y-2">
                        <div className="w-12 h-12 rounded-full bg-mainBg border border-border flex items-center justify-center mx-auto text-xl shadow-sm text-muted">
                            <i className="fas fa-coins"></i>
                        </div>
                        <h4 className="text-sm font-bold text-foreground mt-3">No Collections Yet</h4>
                        <p className="text-xs text-muted max-w-[200px] mx-auto">No payments have been recorded for this academic year.</p>
                    </div>
                ) : (
                    <div className="w-full h-[250px] relative">
                        <Doughnut data={chartData} options={options} />

                        {/* Center Text displaying the Total Amount */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-8">
                            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Total Received</span>
                            <span className="text-xl font-black text-foreground">
                                {new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(totalCollected)}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}