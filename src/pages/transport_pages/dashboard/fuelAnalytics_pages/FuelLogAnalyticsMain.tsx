import { useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useGetFuelLogAnalytics } from '../../../../api_services/transport_api/fuelLogApi';
import { Button } from '../../../../shared/ui/Button';
// import { useGetFuelLogAnalytics } from '../../../api_services/transport_api/fuelLogApi'; // Update path as needed
// import { Button } from '../../../shared/ui/Button';

// Register ChartJS modules including ArcElement for Doughnut charts
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

// ============================================================================
// MAIN FUEL TAB COMPONENT
// ============================================================================
export default function FuelLogAnalyticsMain({ schoolId }: { schoolId: string }) {
    // --- State for Filters ---
    const [rangeType, setRangeType] = useState<"today" | "week" | "month" | "year" | "custom">("month");
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // --- API Hook ---
    const { data: analytics, isLoading, isError } = useGetFuelLogAnalytics({
        schoolId,
        rangeType,
        ...(rangeType === 'custom' ? { startDate, endDate } : {})
    });

    const handleApplyCustomDate = () => {
        if (!startDate || !endDate) return;
        setRangeType('custom');
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <i className="fas fa-circle-notch fa-spin text-primary text-4xl"></i>
                <p className="text-muted font-bold animate-pulse">Analyzing Fuel Consumption...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center h-full w-full">
                <p className="text-danger bg-danger/10 p-4 rounded-xl border border-danger/20 font-bold">
                    Failed to load fuel analytics. Please try again.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col space-y-6 overflow-y-auto custom-scrollbar pb-6">

            {/* Filter Row */}
            <div className="flex flex-wrap items-center gap-3 bg-surface p-4 rounded-2xl border border-border shadow-sm justify-between">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <i className="fas fa-filter text-muted"></i> Date Range Filter
                </h2>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex bg-background border border-border rounded-xl overflow-hidden shadow-sm p-1 gap-1">
                        {['today', 'week', 'month', 'year'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setRangeType(type as any)}
                                className={`px-4 py-1.5 text-sm font-bold capitalize rounded-lg transition-all duration-200 ${rangeType === type ? 'bg-primary text-white shadow-md' : 'text-muted hover:bg-surface hover:text-foreground'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 bg-background border border-border p-1.5 rounded-xl shadow-sm">
                        <input type="date" className="text-sm bg-transparent border-none focus:ring-0 text-foreground px-2 outline-none" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        <span className="text-muted/50 font-bold">-</span>
                        <input type="date" className="text-sm bg-transparent border-none focus:ring-0 text-foreground px-2 outline-none" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        <Button variant="primary" size="sm" onClick={handleApplyCustomDate} className="rounded-lg">Apply</Button>
                    </div>
                </div>
            </div>

            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard icon="fas fa-rupee-sign" title="Total Spent" value={`₹${analytics?.summary?.totalAmountSpent?.toLocaleString('en-IN') || 0}`} colorClass="text-emerald-600 dark:text-emerald-400" bgClass="bg-emerald-100 dark:bg-emerald-500/10" />
                <KPICard icon="fas fa-gas-pump" title="Total Fuel" value={`${analytics?.summary?.totalFuelQuantity?.toFixed(1) || 0} L`} colorClass="text-indigo-600 dark:text-indigo-400" bgClass="bg-indigo-100 dark:bg-indigo-500/10" />
                <KPICard 
                    icon="fas fa-calendar-day" 
                    title="Avg Daily Cost" 
                    value={`₹${analytics?.summary?.avgDailyCost?.toLocaleString('en-IN') || 0}`} 
                    colorClass="text-rose-600 dark:text-rose-400" 
                    bgClass="bg-rose-100 dark:bg-rose-500/10" 
                />
                
                {/* 4. DYNAMIC: Projected Spend (if month) OR Daily Consumption (if other) */}
                {analytics?.summary?.projectedMonthEndCost ? (
                    <KPICard 
                        icon="fas fa-chart-line" 
                        title="Projected Month Spend" 
                        value={`₹${analytics?.summary?.projectedMonthEndCost?.toLocaleString('en-IN') || 0}`} 
                        colorClass="text-amber-600 dark:text-amber-400" 
                        bgClass="bg-amber-100 dark:bg-amber-500/10" 
                    />
                ) : (
                    <KPICard 
                        icon="fas fa-tachometer-alt" 
                        title="Avg Daily Consumption" 
                        value={`${analytics?.summary?.avgDailyConsumption?.toLocaleString('en-IN') || 0} L`} 
                        colorClass="text-amber-600 dark:text-amber-400" 
                        bgClass="bg-amber-100 dark:bg-amber-500/10" 
                    />
                )}
            </div>

            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">


                <div className="lg:col-span-12">
                    <TotalDailySpendChart data={analytics?.dailyTrend || []} />
                </div>

                {/* Daily Trend (Line Chart) */}
                <div className="lg:col-span-8">
                    {/* <FuelDailyTrendChart data={analytics?.dailyTrend || []} /> */}
                    <BusFuelBreakdownChart data={analytics?.busWiseBreakdown || []} />
                </div>

                {/* Payment Modes (Doughnut Chart) */}
                <div className="lg:col-span-4">
                    <PaymentModeChart data={analytics?.paymentModeBreakdown || []} />
                </div>

                {/* Mileage Report (Bar Chart) */}
                <div className="lg:col-span-8">
                    <MileageReportChart data={analytics?.mileageReport || []} />
                </div>

                {/* Station Breakdown (List) */}
                <div className="lg:col-span-4">
                    <StationWiseList data={analytics?.stationWiseBreakdown || []} />
                </div>

            </div>
        </div>
    );
}

// ============================================================================
// MODULAR CHILD COMPONENTS
// ============================================================================

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



function TotalDailySpendChart({ data }: { data: any[] }) {
    const chartData = {
        labels: data.map((item) => new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })),
        datasets: [
            {
                label: 'Total Daily Spend (₹)',
                data: data.map((item) => item.totalAmountSpent),
                borderColor: '#ef4444', // Red color to stand out from the bus chart
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                borderWidth: 2,
                tension: 0.3,
                fill: true,
                pointBackgroundColor: '#ef4444',
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { backgroundColor: 'rgba(15, 23, 42, 0.9)', cornerRadius: 8 }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(150, 150, 150, 0.1)' },
                ticks: { color: '#64748b', font: { weight: 'bold' as const } }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#64748b', font: { weight: 'bold' as const } }
            }
        }
    };

    return (
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm flex flex-col h-[350px]">
            <div className="mb-4">
                <h3 className="font-bold text-foreground text-base">Total Fleet Spend Over Time</h3>
                <p className="text-xs text-muted mt-1">Combined daily fuel expenses across all vehicles.</p>
            </div>
            <div className="flex-1 relative w-full">
                {data.length > 0 ? <Line data={chartData} options={options} /> : <EmptyChartState />}
            </div>
        </div>
    );
}


function BusFuelBreakdownChart({ data }: { data: any[] }) {
    const chartData = {
        labels: data.map(item => item.registrationNo || 'Unknown Bus'),
        datasets: [
            {
                label: 'Amount Spent (₹)',
                data: data.map(item => item.totalAmountSpent),
                backgroundColor: 'rgba(16, 185, 129, 0.85)', // Emerald Green
                borderRadius: 4,
                yAxisID: 'y',
            },
            {
                label: 'Quantity (L)',
                data: data.map(item => item.totalFuelQuantity),
                backgroundColor: 'rgba(59, 130, 246, 0.85)', // Blue
                borderRadius: 4,
                yAxisID: 'y1',
            },
            {
                label: 'Fill Ups',
                data: data.map(item => item.totalFillUps),
                backgroundColor: 'rgba(245, 158, 11, 0.85)', // Amber
                borderRadius: 4,
                yAxisID: 'y1', // Grouped with Quantity on the right axis so it stays visible
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index' as const, // Hovering over a bus shows all 3 stats in one tooltip
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top' as const,
                labels: { font: { weight: 'bold' as const } }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                cornerRadius: 8
            }
        },
        scales: {
            y: {
                type: 'linear' as const,
                display: true,
                position: 'left' as const,
                title: { display: true, text: 'Amount (₹)', font: { weight: 'bold' as const }, color: '#64748b' },
                grid: { color: 'rgba(150, 150, 150, 0.1)' }
            },
            y1: {
                type: 'linear' as const,
                display: true,
                position: 'right' as const,
                title: { display: true, text: 'Liters / Count', font: { weight: 'bold' as const }, color: '#64748b' },
                grid: { drawOnChartArea: false }, // Hides the grid lines so they don't overlap with the left axis
            },
            x: {
                grid: { display: false },
                ticks: { font: { weight: 'bold' as const } }
            }
        }
    };

    return (
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm flex flex-col h-[400px]">
            <div className="mb-4">
                <h3 className="font-bold text-foreground text-base">Bus-Wise Fuel Consumption</h3>
                <p className="text-xs text-muted mt-1">Amount spent, liters consumed, and total fill-ups per vehicle.</p>
            </div>
            <div className="flex-1 relative w-full">
                {data.length > 0 ? <Bar data={chartData} options={options} /> : <EmptyChartState />}
            </div>
        </div>
    );
}

function MileageReportChart({ data }: { data: any[] }) {
    // Filter out buses that have no mileage calculated
    const validData = data.filter(d => d.mileageKmPerLitre !== null);

    const chartData = {
        labels: validData.map(item => item.registrationNo || item.busNumber),
        datasets: [
            {
                label: 'Mileage (km/L)',
                data: validData.map(item => item.mileageKmPerLitre),
                backgroundColor: '#8b5cf6', // Violet
                borderRadius: 4,
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { backgroundColor: 'rgba(15, 23, 42, 0.9)', cornerRadius: 8 }
        },
        scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(150, 150, 150, 0.1)' } },
            x: { grid: { display: false }, ticks: { font: { weight: 'bold' as const } } }
        }
    };

    return (
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm flex flex-col h-[350px]">
            <div className="mb-4">
                <h3 className="font-bold text-foreground text-base">Fleet Mileage Performance</h3>
                <p className="text-xs text-muted mt-1">Kilometers per litre (km/L) breakdown by bus.</p>
            </div>
            <div className="flex-1 relative w-full">
                {validData.length > 0 ? <Bar data={chartData} options={options} /> : <EmptyChartState />}
            </div>
        </div>
    );
}

function PaymentModeChart({ data }: { data: any[] }) {
    const chartData = {
        labels: data.map(item => item.paymentMode),
        datasets: [{
            data: data.map(item => item.totalAmountSpent),
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
            borderWidth: 0,
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            legend: { position: 'bottom' as const, labels: { font: { weight: 'bold' as const } } },
        }
    };

    return (
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm flex flex-col h-[400px]">
            <h3 className="font-bold text-foreground text-base border-b border-border pb-4 mb-4">Payment Modes (₹)</h3>
            <div className="flex-1 relative w-full">
                {data.length > 0 ? <Doughnut data={chartData} options={options} /> : <EmptyChartState />}
            </div>
        </div>
    );
}

function StationWiseList({ data }: { data: any[] }) {
    return (
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm flex flex-col h-[350px]">
            <h3 className="font-bold text-foreground text-base border-b border-border pb-4 mb-4">Top Fuel Stations</h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                {data.length > 0 ? (
                    data.map((station, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-background border border-border p-3 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <i className="fas fa-store"></i>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-foreground line-clamp-1">{station.fuelStation}</p>
                                    <p className="text-xs text-muted">{station.totalFillUps} Fill Ups</p>
                                </div>
                            </div>
                            <p className="text-sm font-bold text-foreground shrink-0 pl-2">
                                ₹{station.totalAmountSpent?.toLocaleString('en-IN')}
                            </p>
                        </div>
                    ))
                ) : (
                    <EmptyChartState />
                )}
            </div>
        </div>
    );
}

function EmptyChartState() {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-background/50 rounded-xl backdrop-blur-sm">
            <i className="fas fa-folder-open text-muted text-3xl mb-3 opacity-40"></i>
            <p className="text-sm font-bold text-muted">Awaiting fuel data for this period.</p>
        </div>
    );
}