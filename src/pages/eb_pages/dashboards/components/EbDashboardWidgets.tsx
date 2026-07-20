import React, { useMemo, useState } from 'react';
import { Card } from '../../../../shared/ui/Card';
import { useGetPremisesEBConsumptionChart, type IEBLog, type IEBPremisesAnalytics } from '../../../../api_services/eb_api/ebLogApi';
import { TableContainer, TBody, Td, Th, THead, Tr } from '../../../../shared/ui/TableLayout';
import { formatTime12Hour } from '../../../../utils/utils';
// import { TableContainer, TBody, Td, Th, THead, Tr } from '../../../../shared/ui/TableLayout';

// // ==========================================
// // WIDGET 1: KPI Stat Card (Highly Reusable)
// // ==========================================
// interface EbStatCardProps {
//     title: string;
//     value: string | number;
//     icon: string;
//     subtitle?: string;
//     isLoading?: boolean;
//     valueColor?: string;
// }

// export const EbStatCard: React.FC<EbStatCardProps> = ({ title, value, icon, subtitle, isLoading, valueColor = "text-foreground" }) => (
//     <Card className="bg-surface border border-border-default p-5 flex flex-col justify-between shadow-sm h-full">
//         <div className="flex justify-between items-start mb-4">
//             <h3 className="text-[13px] font-semibold text-muted uppercase tracking-wide">{title}</h3>
//             <div className="w-8 h-8 rounded-md bg-background border border-border-default flex items-center justify-center text-muted">
//                 <i className={`${icon} text-sm`}></i>
//             </div>
//         </div>
//         <div>
//             {isLoading ? (
//                 <div className="h-8 w-24 bg-border-soft animate-pulse rounded"></div>
//             ) : (
//                 <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
//             )}
//             {subtitle && (
//                 <p className="text-xs text-muted mt-1.5 font-medium">{subtitle}</p>
//             )}
//         </div>
//     </Card>
// );
// // EbDashboardWidgets.tsx

// ==========================================
// WIDGET 1: KPI Stat Card
// ==========================================
interface EbStatCardProps {
    title: string;
    value: string | number;
    icon: string;
    subtitle?: string;
    isLoading?: boolean;
    valueColor?: string;
}

export const EbStatCard: React.FC<EbStatCardProps> = ({ title, value, icon, subtitle, isLoading, valueColor = "text-foreground" }) => (
    <Card className="bg-surface border border-border-default p-5 flex flex-col justify-between shadow-sm h-full hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
            <h3 className="text-[13px] font-semibold text-muted uppercase tracking-wide">{title}</h3>
            <div className="w-9 h-9 rounded-lg bg-sub-header border border-border-default flex items-center justify-center text-primary shadow-sm">
                <i className={`${icon} text-sm`}></i>
            </div>
        </div>
        <div>
            {isLoading ? (
                <div className="h-8 w-24 bg-border-soft animate-pulse rounded"></div>
            ) : (
                <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
            )}
            {subtitle && (
                <p className="text-xs text-muted mt-2 font-medium bg-mainBg inline-block px-2 py-1 rounded-md border border-border-soft">{subtitle}</p>
            )}
        </div>
    </Card>
);

// ==========================================
// WIDGET 2: Premises Analytics Cards (Replaces Table)
// ==========================================
interface EbAnalyticsCardsProps {
    data: IEBPremisesAnalytics[];
    isLoading: boolean;
}

export const EbAnalyticsCards: React.FC<EbAnalyticsCardsProps> = ({ data, isLoading }) => {
    if (isLoading) {
        return (
            <div className="py-16 flex flex-col items-center justify-center bg-surface border border-border-default rounded-xl shadow-sm">
                <i className="fas fa-circle-notch fa-spin text-primary text-2xl mb-3"></i>
                <p className="text-sm font-medium text-muted">Loading analytics...</p>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="py-16 text-center bg-surface border border-border-default rounded-xl shadow-sm">
                <div className="w-16 h-16 rounded-full bg-mainBg border border-border-default flex items-center justify-center mx-auto mb-3 text-muted text-2xl">
                    <i className="fas fa-chart-line"></i>
                </div>
                <p className="text-sm font-medium text-foreground">No analytics data available.</p>
            </div>
        );
    }

    return (
       

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {data?.map((item) => (
                <Card 
                    key={item.premisesId} 
                    className="bg-surface border border-border-default shadow-sm hover:shadow-md hover:border-primary-soft hover:-translate-y-1 transition-all duration-300 flex flex-col group relative overflow-hidden rounded-xl"
                >
                    {/* Top Accent Line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-primary opacity-80 group-hover:opacity-100 transition-opacity"></div>

                    {/* Header */}
                    <div className="p-4 pt-5 flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary-soft/20 flex items-center justify-center text-primary shrink-0">
                                <i className="fas fa-bolt text-lg"></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-foreground text-[15px] truncate max-w-[180px]" title={item.premisesName}>
                                    {item.premisesName}
                                </h4>
                                <p className="text-[11px] text-muted font-medium mt-0.5 uppercase tracking-wide">
                                    Energy Analytics
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Body */}
                    <div className="p-4 pt-0 flex-1 flex flex-col gap-3">
                        
                        {/* Two Column Grid for Daily/Avg Stats */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-background border border-border-soft rounded-lg p-3 flex flex-col justify-center group-hover:border-primary-soft/40 transition-colors">
                                <span className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                    <i className="fas fa-calendar-day text-primary-soft"></i> Yesterday
                                </span>
                                <span className="font-mono text-[16px] font-bold text-foreground">
                                    {item.yesterdayConsumption !== null ? (
                                        <>
                                            {item.yesterdayConsumption} <span className="text-[11px] text-muted font-sans font-medium">kWh</span>
                                        </>
                                    ) : (
                                        <span className="text-[13px] text-muted italic font-sans font-normal">N/A</span>
                                    )}
                                </span>
                            </div>
                            
                            <div className="bg-background border border-border-soft rounded-lg p-3 flex flex-col justify-center group-hover:border-primary-soft/40 transition-colors">
                                <span className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                    <i className="fas fa-chart-line text-primary-soft"></i> 30-Day Avg
                                </span>
                                <span className="font-mono text-[16px] font-bold text-foreground">
                                    {item.avg30DayConsumption !== null ? (
                                        <>
                                            {item.avg30DayConsumption} <span className="text-[11px] text-muted font-sans font-medium">kWh/d</span>
                                        </>
                                    ) : (
                                        <span className="text-[13px] text-muted italic font-sans font-normal">N/A</span>
                                    )}
                                </span>
                            </div>
                        </div>

                        {/* Projected Month (Highlight Section) */}
                        <div className="mt-auto bg-primary-soft/10 border border-primary-soft/20 rounded-lg p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-primary-soft/30 flex items-center justify-center text-primary">
                                    <i className="fas fa-bullseye text-[10px]"></i>
                                </div>
                                <span className="text-[12px] font-bold text-primary">Proj. Month</span>
                            </div>
                            <span className="font-mono text-[16px] font-bold text-primary">
                                {item.projectedThisMonthConsumption !== null ? (
                                    <>
                                        {item.projectedThisMonthConsumption} <span className="text-[10px] text-primary/70 font-sans font-semibold">kWh</span>
                                    </>
                                ) : (
                                    <span className="text-[12px] text-primary/60 italic font-sans font-normal">N/A</span>
                                )}
                            </span>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

// ==========================================
// WIDGET 3: Recent Activity List (Multi-column Table)
// ==========================================
interface EbRecentLogsProps {
    logs: IEBLog[];
    isLoading: boolean;
}

export const EbRecentLogsList: React.FC<EbRecentLogsProps> = ({ logs, isLoading }) => (
    <div className="bg-surface border border-border-default rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
        <div className="p-4 border-b border-border-default flex justify-between items-center">
            <div className="flex items-center gap-2">
                <i className="fas fa-history text-primary text-sm"></i>
                <h3 className="text-[15px] font-semibold text-foreground">Recent Log Entries</h3>
            </div>
            <span className="text-[11px] font-medium text-muted uppercase bg-mainBg px-2 py-1 rounded border border-border-default shadow-sm">
                Latest 10 Records
            </span>
        </div>
        
        <TableContainer className="max-h-[400px] overflow-y-auto custom-scrollbar">
            <THead className="sticky top-0 z-10 bg-mainBg after:absolute after:bottom-0 after:left-0 after:right-0 after:border-b after:border-border-default">
                <tr>
                    <Th className="font-semibold text-[12px] w-24">Log No</Th>
                    <Th className="font-semibold text-[12px]">Premises</Th>
                    <Th className="font-semibold text-[12px]">Date</Th>
                    <Th className="font-semibold text-[12px]">Time</Th>
                    <Th className="font-semibold text-[12px]">Reading (kWh)</Th>
                </tr>
            </THead>
            <TBody>
                {isLoading ? (
                    <tr>
                        <td colSpan={5} className="py-16 text-center">
                            <i className="fas fa-circle-notch fa-spin text-primary text-xl"></i>
                            <p className="text-xs font-medium text-muted mt-2">Loading recent logs...</p>
                        </td>
                    </tr>
                ) : logs.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="py-16 text-center">
                            <div className="w-12 h-12 rounded-full bg-background border border-border-default flex items-center justify-center mx-auto mb-3 text-muted text-lg shadow-sm">
                                <i className="fas fa-clipboard-list"></i>
                            </div>
                            <p className="text-sm font-medium text-foreground">No recent logs found.</p>
                        </td>
                    </tr>
                ) : (
                    logs.map((log: any) => (
                        <Tr key={log._id} className="border-b border-border-soft last:border-0 group">
                            {/* Log No */}
                            <Td>
                                <span className="font-mono text-[12px] font-medium text-muted bg-mainBg border border-border-soft px-1.5 py-0.5 rounded group-hover:border-border-default transition-colors">
                                    #{log.ebLogNo}
                                </span>
                            </Td>

                            {/* Premises Details */}
                            <Td>
                                <div className="flex items-center gap-2">
                                    <i className="fas fa-building text-primary text-xs opacity-70"></i>
                                    <span className="text-[13px] font-medium text-foreground">
                                        {log.premisesId?.premisesName || 'Unknown Premises'}
                                    </span>
                                </div>
                            </Td>

                            {/* Date & Time */}
                            <Td>
                                <div className="text-[12px] font-medium text-muted flex items-center gap-1.5">
                                    <i className="far fa-calendar-alt opacity-70"></i>
                                    {new Date(log.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} 
                                    {/* <span className="opacity-50 mx-0.5">•</span> 
                                    <i className="far fa-clock opacity-70"></i>
                                    {formatTime12Hour(log.time)} */}
                                </div>
                            </Td>

                             <Td>
                                <div className="text-[12px] font-medium text-muted flex items-center gap-1.5">
                                    {/* <i className="far fa-calendar-alt opacity-70"></i>
                                    {new Date(log.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} 
                                    <span className="opacity-50 mx-0.5">•</span>  */}
                                    <i className="far fa-clock opacity-70"></i>
                                    {formatTime12Hour(log.time)}
                                </div>
                            </Td>

                            {/* Meter Reading */}
                            <Td>
                                <span className="font-mono text-[14px] font-bold text-foreground">
                                    {Number(log.meterReading).toLocaleString()} 
                                    <span className="text-[11px] font-sans font-medium text-muted ml-1">kWh</span>
                                </span>
                            </Td>

                          
                        </Tr>
                    ))
                )}
            </TBody>
        </TableContainer>
    </div>
);





import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    type ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useAuthData } from '../../../../hooks/useAuthData';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

// ==========================================
// WIDGET 4: EB Consumption Line Chart (Chart.js)
// ==========================================
// Professional color palette for different premises lines
const CHART_COLORS = ["#4b5563", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6", "#ec4899"];

export const EbConsumptionChart: React.FC = () => {
    // 1. Get Context
    const { schoolId } = useAuthData();

    // 2. Local State Management for the Chart
    const [period, setPeriod] = useState<string>("week");
    const [customDates, setCustomDates] = useState({
        // Default to last 7 days
        fromDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0], 
        toDate: new Date().toISOString().split('T')[0]
    });

    // 3. Data Fetching (Autonomous)
    const { data, isLoading } = useGetPremisesEBConsumptionChart(schoolId!, {
        period,
        ...(period === 'custom' ? customDates : {})
    });
    
    // 4. Transform backend data format into Chart.js format
    const chartDataObj = useMemo(() => {
        if (!data || !data.premises || data.premises.length === 0) return null;

        // Extract buckets (labels on the X-axis) from the first premises
        const labels = data.premises[0].series.map(s => s.label);
        
        // Map each premises to a Chart.js dataset
        const datasets = data.premises.map((p, index) => {
            const color = CHART_COLORS[index % CHART_COLORS.length];
            return {
                label: p.premisesName,
                data: p.series.map(s => s.kwUsed),
                borderColor: color,
                backgroundColor: color,
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5,
                tension: 0.1, // Slight curve
                spanGaps: true, // Joins lines across missing data
            };
        });

        return { labels, datasets };
    }, [data]);

    // 5. Chart.js Configuration Options
    const chartOptions: ChartOptions<'line'> = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top',
                align: 'end',
                labels: {
                    usePointStyle: true,
                    boxWidth: 8,
                    font: { size: 12, family: 'inherit' },
                    color: '#6b6b6b' 
                }
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#1a1a1a', 
                bodyColor: '#6b6b6b', 
                borderColor: '#dbdbdb', 
                borderWidth: 1,
                padding: 10,
                boxPadding: 4,
                usePointStyle: true,
                titleFont: { size: 13, weight: 'bold' },
                bodyFont: { size: 12 },
                callbacks: {
                    label: (context) => {
                        let label = context.dataset.label || '';
                        if (label) label += ': ';
                        if (context.parsed.y !== null) {
                            label += `${context.parsed.y} kWh`;
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { font: { size: 11 }, color: '#6b6b6b' },
                border: { color: '#dbdbdb' }
            },
            y: {
                grid: { color: '#f3f4f6', tickLength: 0 },
                border: { display: false, dash: [4, 4] },
                ticks: { font: { size: 11 }, color: '#6b6b6b', padding: 8 }
            }
        }
    }), []);

    return (
        <div className="bg-surface border border-border-default rounded-xl shadow-sm overflow-hidden flex flex-col w-full">
            {/* Chart Header & Controls */}
            <div className="p-4 border-b border-border-default bg-mainBg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <i className="fas fa-chart-area text-primary text-sm"></i>
                    <h3 className="text-[15px] font-semibold text-foreground">Consumption Over Time</h3>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                    {/* Period Selector */}
                    <div className="flex bg-background border border-border-default rounded-lg p-0.5 shadow-sm overflow-x-auto w-full sm:w-auto">
                        {['today', 'week', 'month', 'year', 'custom'].map(p => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-3 py-1.5 text-[12px] font-medium rounded-md capitalize whitespace-nowrap transition-colors ${
                                    period === p 
                                    ? 'bg-primary text-white shadow-sm' 
                                    : 'text-muted hover:text-foreground hover:bg-sub-header'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>

                    {/* Custom Date Pickers */}
                    {period === 'custom' && (
                        <div className="flex items-center gap-2 w-full sm:w-auto animate-in fade-in zoom-in-95 duration-200">
                            <input
                                type="date"
                                value={customDates.fromDate}
                                onChange={(e) => setCustomDates({ ...customDates, fromDate: e.target.value })}
                                className="px-2 py-1.5 rounded-md border border-border-default bg-background text-[12px] text-foreground focus:border-primary-soft focus:outline-none"
                            />
                            <span className="text-muted text-xs">to</span>
                            <input
                                type="date"
                                value={customDates.toDate}
                                onChange={(e) => setCustomDates({ ...customDates, toDate: e.target.value })}
                                className="px-2 py-1.5 rounded-md border border-border-default bg-background text-[12px] text-foreground focus:border-primary-soft focus:outline-none"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Chart Rendering Area */}
            <div className="p-4 h-[350px] w-full relative">
                {isLoading ? (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                        <i className="fas fa-circle-notch fa-spin text-primary text-2xl mb-3"></i>
                        <p className="text-sm text-muted font-medium">Rendering chart...</p>
                    </div>
                ) : !chartDataObj ? (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-mainBg border border-border-default flex items-center justify-center mb-3 text-muted text-lg shadow-sm">
                            <i className="fas fa-chart-line"></i>
                        </div>
                        <p className="text-sm font-medium text-foreground">No data available for this period.</p>
                    </div>
                ) : (
                    <div className="w-full h-full">
                        <Line data={chartDataObj} options={chartOptions} />
                    </div>
                )}
            </div>
        </div>
    );
};