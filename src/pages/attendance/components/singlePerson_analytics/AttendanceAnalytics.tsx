
// ============================================================================
// SUB-COMPONENT: Analytics Panel & Donut Chart

import { Doughnut } from "react-chartjs-2";


// 🌟 1. YOU MUST IMPORT THESE FROM 'chart.js'
import { 
    Chart as ChartJS, 
    ArcElement, 
    Tooltip, 
    Legend 
} from 'chart.js';

// 🌟 2. YOU MUST REGISTER THE ARC ELEMENT OUTSIDE THE COMPONENT
ChartJS.register(ArcElement, Tooltip, Legend);

// ============================================================================
export default function AttendanceAnalytics({ summary, academicYear }: { summary: any, academicYear: string }) {

    
    // Tally Data strictly from Backend Summary Object
    const presentCount = summary.present || 0;
    const absentCount = summary.absent || 0;
    const lateCount = summary.late || 0;
    const halfDayCount = summary.halfDay || 0;
    const totalRecorded = summary.totalDays || 0;

    // Chart Configuration using standard semantic colors
    const donutData = {
        labels: ['Present', 'Absent', 'Late', 'Half-Day'],
        datasets: [{
            data: [presentCount, absentCount, lateCount, halfDayCount],
            backgroundColor: ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'], // Success, Danger, Warning, Primary
            borderWidth: 0,
            hoverOffset: 4
        }]
    };

    const donutOptions = {
        cutout: '75%',
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (ctx: any) => ` ${ctx.label}: ${ctx.raw} Days`
                }
            }
        },
        maintainAspectRatio: false
    };

    return (
        <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
            {/* <div className="px-5 py-4 border-b border-border bg-sub-header/50"> */}
            {/* <div className="px-6 py-4 border-b border-border/50 bg-transparent"> */}
            <div className="px-6 py-4 border-b border-border/50 bg-transparent flex items-center gap-2.5">


                <h3 className="text-sm font-bold text-foreground tracking-wider">Analytics Overview</h3>
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">{academicYear}</span>

            </div>

            <div className="p-5 flex-1 flex flex-col overflow-y-auto custom-scrollbar">
                {totalRecorded === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted opacity-50 py-10">
                        <i className="fas fa-chart-pie text-4xl mb-3"></i>
                        <p className="text-sm font-medium">No Data Available</p>
                    </div>
                ) : (
                    <>
                        <div className="h-48 relative flex justify-center mb-6 mt-2 shrink-0">
                            <Doughnut data={donutData} options={donutOptions} />
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-black text-foreground">{totalRecorded}</span>
                                <span className="text-[10px] font-bold text-muted uppercase tracking-widest mt-0.5">Total Days</span>
                            </div>
                        </div>

                        <div className="space-y-3 mt-auto shrink-0">
                            <StatRow color="bg-success" textColor="text-success" label="Present Days" count={presentCount} total={totalRecorded} />
                            <StatRow color="bg-danger" textColor="text-danger" label="Absent Days" count={absentCount} total={totalRecorded} />
                            {lateCount > 0 && (
                                <StatRow color="bg-warning" textColor="text-warning" label="Late Arrivals" count={lateCount} total={totalRecorded} />
                            )}
                            {halfDayCount > 0 && (
                                <StatRow color="bg-primary" textColor="text-primary" label="Half Days" count={halfDayCount} total={totalRecorded} />
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// Helper for Analytics Rows
function StatRow({ color, textColor, label, count, total }: { color: string, textColor: string, label: string, count: number, total: number }) {
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

    return (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-background border border-border shadow-sm">
            <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${color}`}></div>
                <span className="text-sm font-bold text-foreground">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className={`text-base font-black ${textColor}`}>{count}</span>
                <span className="text-[10px] font-bold text-muted bg-surface border border-border px-1.5 py-0.5 rounded">
                    {percentage}%
                </span>
            </div>
        </div>
    );
}