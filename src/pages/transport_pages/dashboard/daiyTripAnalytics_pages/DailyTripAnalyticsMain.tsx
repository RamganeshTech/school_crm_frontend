import { useState } from 'react';
// Chart.js Setup
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
    Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// UI Components & API
import { useGetDailyTripAnalytics } from '../../../../api_services/transport_api/dailyTripLogApi';
import { Button } from '../../../../shared/ui/Button';

// Register ChartJS modules globally
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

// ============================================================================
// 1. PARENT COMPONENT: Fetches Data & Manages Layout
// ============================================================================
export default function DailyTripAnalyticsMain({ schoolId }: { schoolId: string }) {



    // --- State for Filters ---
    const [rangeType, setRangeType] = useState<"today" | "week" | "month" | "year" | "custom">("month");
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // --- SINGLE API CALL ---
    const { data, isLoading, isError } = useGetDailyTripAnalytics({
        schoolId: schoolId!,
        rangeType,
        ...(rangeType === 'custom' ? { startDate, endDate } : {})
    });

    const handleApplyCustomDate = () => {
        if (!startDate || !endDate) return;
        setRangeType('custom');
    };

    const analytics = data;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full space-y-4">
                <i className="fas fa-circle-notch fa-spin text-primary text-4xl"></i>
                <p className="text-muted font-medium animate-pulse">Aggregating Transportation Analytics...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center h-full w-full">
                <p className="text-danger bg-danger/10 p-4 rounded-xl border border-danger/20 font-medium">
                    Failed to load analytics. Please try again.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col p-4 space-y-6 overflow-y-auto custom-scrollbar bg-background">

            {/* --- Dashboard Header & Filters --- */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-surface p-5 rounded-2xl border border-border shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <i className="fas fa-chart-pie"></i>
                        </div>
                        Daily Trip Analytics
                    </h1>
                    <p className="text-sm text-muted mt-1">Comprehensive overview of transport utilization, distance, and log integrity.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                    {/* Range Selectors */}
                    <div className="flex bg-background border border-border rounded-xl overflow-hidden shadow-sm p-1 gap-1">
                        {['today' , 'week', 'month', 'year'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setRangeType(type as any)}
                                className={`px-4 py-1.5 text-sm font-semibold capitalize rounded-lg transition-all duration-200 ${rangeType === type ? 'bg-primary text-white shadow-md' : 'text-muted hover:bg-surface hover:text-foreground'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    {/* Custom Date Filters */}
                    <div className="flex items-center gap-2 bg-background border border-border p-1.5 rounded-xl shadow-sm">
                        <input type="date" className="text-sm bg-transparent border-none focus:ring-0 text-foreground px-2 outline-none" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        <span className="text-muted/50 font-bold">-</span>
                        <input type="date" className="text-sm bg-transparent border-none focus:ring-0 text-foreground px-2 outline-none" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        <Button variant="primary" size="sm" onClick={handleApplyCustomDate} className="rounded-lg">Apply</Button>
                    </div>
                </div>
            </div>

            {/* --- Top Metrics Row --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard icon="fas fa-road" title="Total Distance" value={`${analytics?.summary?.totalKmRun || 0} km`} colorClass="text-indigo-600 dark:text-indigo-400" bgClass="bg-indigo-100 dark:bg-indigo-500/10" />
                <KPICard icon="fas fa-route" title="Total Trips" value={analytics?.summary?.totalTrips || 0} colorClass="text-emerald-600 dark:text-emerald-400" bgClass="bg-emerald-100 dark:bg-emerald-500/10" />
                <KPICard icon="fas fa-tachometer-alt" title="Avg KM / Trip" value={`${analytics?.summary?.avgKmPerTrip?.toFixed(1) || 0} km`} colorClass="text-amber-600 dark:text-amber-400" bgClass="bg-amber-100 dark:bg-amber-500/10" />
                <KPICard icon="fas fa-calendar-day" title="Max KM in a Day" value={`${analytics?.summary?.maxKmInADay || 0} km`} colorClass="text-rose-600 dark:text-rose-400" bgClass="bg-rose-100 dark:bg-rose-500/10" />
            </div>

            {/* --- Main Dashboard Grid --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Line Chart Component (Spans 8 columns) */}
                <div className="lg:col-span-6">
                    <DailyTrendChart data={analytics?.dailyTrend || []} />
                </div>


                <div className="lg:col-span-6">
                    {/* <DailyTrendChart data={analytics?.dailyTrend || []} /> */}
                    <BusDailyTrendChart data={analytics?.busDailyTrend || []} />

                </div>

                {/* <div className="lg:col-span-4 flex flex-col gap-6">
                    <OdometerAuditCard mismatches={analytics?.odometerMismatches || []} />
                </div> */}

                {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <DailyTrendChart data={analytics?.dailyTrend || []} />
                    <BusDailyTrendChart data={analytics?.busDailyTrend || []} />
                </div> */}

                {/* Bar Chart Component (Spans 8 columns) */}
                <div className="lg:col-span-8">
                    <FleetUtilizationChart data={analytics?.busWiseBreakdown || []} />
                </div>

                {/* Idle Buses Component (Spans 4 columns) */}
                <div className="lg:col-span-4">
                    <IdleBusesCard idleBuses={analytics?.idleBuses || []} />
                </div>

            </div>
        </div>
    );
}



// ============================================================================
// 2. CHILD COMPONENTS (Can be moved to separate files later)
// ============================================================================

// --- KPI Card ---
function KPICard({ icon, title, value, colorClass, bgClass }: { icon: string, title: string, value: string | number, colorClass: string, bgClass: string }) {
    return (
        <div className="bg-surface border border-border p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${bgClass} ${colorClass}`}>
                <i className={icon}></i>
            </div>
            <div>
                <p className="text-xs font-bold text-muted uppercase tracking-wider mb-1">{title}</p>
                <p className="text-2xl font-bold text-foreground">{value}</p>
            </div>
        </div>
    );
}

// --- Daily Trend Line Chart ---
function DailyTrendChart({ data }: { data: any[] }) {
    const chartData = {
        labels: data.map((item) => new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })),
        datasets: [
            {
                label: 'Total Distance (km)',
                data: data.map((item) => item.totalKmRun),
                borderColor: '#6366f1', // Indigo 500
                backgroundColor: 'rgba(99, 102, 241, 0.15)', // Light Indigo gradient feel
                borderWidth: 3,
                tension: 0.4, // Curvy lines
                fill: true,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#6366f1',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleFont: { size: 13, family: 'Inter' },
                bodyFont: { size: 14, weight: 'bold' as const, family: 'Inter' },
                padding: 12,
                cornerRadius: 8,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(150, 150, 150, 0.1)', drawBorder: false },
                ticks: { color: '#64748b' }
            },
            x: {
                grid: { display: false, drawBorder: false },
                ticks: { color: '#64748b' }
            }
        }
    };

    return (
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm flex flex-col h-[400px]">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="font-bold text-foreground text-base">Daily Distance Trend</h3>
                    <p className="text-xs text-muted mt-1">Kilometers covered across all fleet vehicles per day.</p>
                </div>
            </div>
            <div className="flex-1 relative w-full">
                {data.length > 0 ? <Line data={chartData} options={options} /> : <EmptyChartState />}
            </div>
        </div>
    );
}

// --- Fleet Utilization Bar Chart ---
function FleetUtilizationChart({ data }: { data: any[] }) {
    // Semantic color array for distinct bars
    const semanticColors = [
        'rgba(16, 185, 129, 0.85)', // Emerald
        'rgba(14, 165, 233, 0.85)', // Light Blue
        'rgba(139, 92, 246, 0.85)', // Violet
        'rgba(245, 158, 11, 0.85)', // Amber
        'rgba(239, 68, 68, 0.85)',  // Rose
        'rgba(6, 182, 212, 0.85)',  // Cyan
    ];

    // Map colors cyclically based on data length
    const backgroundColors = data.map((_, i) => semanticColors[i % semanticColors.length]);

    const chartData = {
        labels: data.map((item) => item.registrationNo || item.busNumber),
        datasets: [
            {
                label: 'Distance Covered (km)',
                data: data.map((item) => item.totalKmRun),
                backgroundColor: backgroundColors,
                borderRadius: 6,
                borderSkipped: false,
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                padding: 12,
                cornerRadius: 8,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(150, 150, 150, 0.1)' },
                ticks: { color: '#64748b' }
            },
            x: {
                grid: { display: false },
                ticks: {
                    color: '#64748b',
                    // FIX: Changed '600' (string) to 600 (number) or 'bold'
                    font: { weight: 'bold' as const }
                }
            }
        }
    };

    return (
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm min-h-[350px] flex flex-col h-full">
            <div className="mb-6">
                <h3 className="font-bold text-foreground text-base">Fleet Utilization</h3>
                <p className="text-xs text-muted mt-1">Total distance driven segmented by individual buses.</p>
            </div>
            <div className="flex-1 relative w-full">
                {data.length > 0 ? <Bar data={chartData} options={options} /> : <EmptyChartState />}
            </div>
        </div>
    );
}



// --- Bus-wise Daily Trend Multi-Line Chart ---
function BusDailyTrendChart({ data }: { data: any[] }) {
    // 1. Extract unique dates for the X-axis and sort them
    const uniqueDates = Array.from(new Set(data.map(d => d.date))).sort();

    // 2. Extract unique buses for the datasets
    const uniqueBuses = Array.from(new Set(data.map(d => d.registrationNo || d.busNumber)));

    const semanticColors = [
        '#10b981', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#f97316'
    ];

    // 3. Map the data into Chart.js datasets
    const datasets = uniqueBuses.map((busIdentifier, index) => {
        const color = semanticColors[index % semanticColors.length];

        // Match the kmRun to the exact date, fallback to 0 if the bus didn't drive that day
        const dataPoints = uniqueDates.map(date => {
            const record = data.find(d => d.date === date && (d.registrationNo === busIdentifier || d.busNumber === busIdentifier));
            return record ? record.dailyKmRun : 0;
        });

        return {
            label: String(busIdentifier),
            data: dataPoints,
            borderColor: color,
            backgroundColor: color,
            borderWidth: 2,
            tension: 0.3,
            fill: false,
            pointRadius: 3,
            pointHoverRadius: 5,
        };
    });

    const chartData = {
        labels: uniqueDates.map(date => new Date(String(date)).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })),
        datasets: datasets
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: { boxWidth: 12, usePointStyle: true, font: { family: 'Inter', size: 11 } }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                padding: 12,
                cornerRadius: 8,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(150, 150, 150, 0.1)', drawBorder: false },
                ticks: { color: '#64748b' }
            },
            x: {
                grid: { display: false, drawBorder: false },
                ticks: { color: '#64748b', font: { weight: 'bold' as const } }
            }
        }
    };

    return (
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm flex flex-col h-[400px]">
            <div className="mb-2">
                <h3 className="font-bold text-foreground text-base">Individual Bus Trends</h3>
                <p className="text-xs text-muted mt-1">Daily distance covered by each vehicle.</p>
            </div>
            <div className="flex-1 relative w-full mt-2">
                {data.length > 0 ? <Line data={chartData} options={options} /> : <EmptyChartState />}
            </div>
        </div>
    );
}

// // --- Odometer Audit Component ---
// function OdometerAuditCard({ mismatches }: { mismatches: any[] }) {
//     return (
//         <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm flex flex-col h-[400px]">
//             <h3 className="font-bold text-foreground text-base flex items-center justify-between border-b border-border pb-4 mb-4">
//                 <span className="flex items-center gap-2">
//                     <i className="fas fa-shield-alt text-danger"></i> Log Audits
//                 </span>
//                 <span className="bg-danger/10 text-danger text-xs px-2.5 py-1 rounded-full font-bold">
//                     {mismatches.length} Flags
//                 </span>
//             </h3>

//             <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
//                 {mismatches.length > 0 ? (
//                     mismatches.map((mismatch, idx) => (
//                         <div key={idx} className="bg-background border border-danger/20 p-3.5 rounded-xl hover:border-danger/40 transition-colors">
//                             <div className="flex justify-between items-center mb-2">
//                                 <span className="text-sm font-bold text-foreground">
//                                     {new Date(mismatch.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
//                                 </span>
//                                 <span className="text-[10px] bg-danger/10 text-danger px-2 py-0.5 rounded font-mono uppercase font-bold tracking-wider">
//                                     Log: {mismatch.dailyLogNo || 'N/A'}
//                                 </span>
//                             </div>
//                             <div className="flex items-center justify-between text-xs text-muted bg-surface p-2 rounded-lg mb-2">
//                                 <div><span className="block text-[10px] uppercase opacity-70">Logged</span> <span className="font-bold text-foreground">{mismatch.kmRun} km</span></div>
//                                 <div><span className="block text-[10px] uppercase opacity-70 text-right">Calculated</span> <span className="font-bold text-foreground">{(mismatch.closingOdometer - mismatch.openingOdometer)} km</span></div>
//                             </div>
//                             <p className="text-xs font-bold text-danger flex items-center gap-1">
//                                 <i className="fas fa-exclamation-circle"></i> Variance of {mismatch.diff} km detected
//                             </p>
//                         </div>
//                     ))
//                 ) : (
//                     <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
//                         <div className="w-12 h-12 bg-success/10 text-success rounded-full flex items-center justify-center text-xl mb-3">
//                             <i className="fas fa-check"></i>
//                         </div>
//                         <p className="text-sm font-bold text-foreground">Data is pristine</p>
//                         <p className="text-xs text-muted">No odometer discrepancies found.</p>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }

// --- Idle Buses Component ---
function IdleBusesCard({ idleBuses }: { idleBuses: any[] }) {
    return (
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm h-full min-h-[250px]">
            <h3 className="font-bold text-foreground text-base flex items-center justify-between border-b border-border pb-4 mb-4">
                <span className="flex items-center gap-2">
                    <i className="fas fa-parking text-warning"></i> Idle Vehicles
                </span>
                <span className="bg-warning/10 text-warning text-xs px-2.5 py-1 rounded-full font-bold">
                    {idleBuses.length} Inactive
                </span>
            </h3>

            <div className="flex flex-wrap gap-2.5 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
                {idleBuses.length > 0 ? (
                    idleBuses.map((bus) => (
                        <div key={bus._id} className="flex items-center gap-2 bg-background border border-border px-3 py-2 rounded-lg shadow-sm">
                            <i className="fas fa-bus text-muted/50 text-xs"></i>
                            <span className="text-sm font-semibold text-foreground tracking-wide">
                                {bus.registrationNo || bus.busNumber}
                            </span>
                        </div>
                    ))
                ) : (
                    <div className="w-full text-center py-6 opacity-70">
                        <i className="fas fa-tachometer-fast text-2xl text-success mb-2"></i>
                        <p className="text-sm text-muted">100% Fleet Utilization!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- Reusable Empty Chart State ---
function EmptyChartState() {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-background/50 rounded-xl backdrop-blur-sm">
            <i className="fas fa-folder-open text-muted text-3xl mb-3 opacity-40"></i>
            <p className="text-sm font-medium text-muted">Awaiting trip data for this period.</p>
        </div>
    );
}


