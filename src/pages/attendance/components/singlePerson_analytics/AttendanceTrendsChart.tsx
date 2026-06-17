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
import { Line } from 'react-chartjs-2';
import { useGetStudentAttendanceTrends } from '../../../../api_services/attendance_api/attendanceApi';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function AttendanceTrendsChart({ studentId, academicYear }: { studentId: string, academicYear: string }) {
    const { data: trends, isLoading } = useGetStudentAttendanceTrends(studentId, academicYear);

    const hasData = trends && trends.length > 0;

    // 🌟 Extract labels and all FOUR data arrays
    const labels = hasData ? trends.map((t: any) => `${monthNames[t.month - 1]}`) : [];
    const presentPoints = hasData ? trends.map((t: any) => t.presentPercentage) : [];
    const absentPoints = hasData ? trends.map((t: any) => t.absentPercentage) : [];
    const latePoints = hasData ? trends.map((t: any) => t.latePercentage) : [];
    const halfDayPoints = hasData ? trends.map((t: any) => t.halfDayPercentage) : []; // 🌟 Added extraction

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Present',
                data: presentPoints,
                borderColor: '#10b981', // Success Green
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 2,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#10b981',
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true, // Keep fill on Present to anchor the chart visually
                tension: 0.4 
            },
            {
                label: 'Absent',
                data: absentPoints,
                borderColor: '#ef4444', // Danger Red
                backgroundColor: '#ef4444',
                borderWidth: 2,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#ef4444',
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: false,
                tension: 0.4 
            },
            {
                label: 'Late',
                data: latePoints,
                borderColor: '#f59e0b', // Warning Yellow
                backgroundColor: '#f59e0b',
                borderWidth: 2,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#f59e0b',
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: false,
                tension: 0.4 
            },
            {
                // 🌟 Added Half-Day Dataset
                label: 'Half-Day',
                data: halfDayPoints,
                borderColor: '#3b82f6', // Primary Blue
                backgroundColor: '#3b82f6',
                borderWidth: 2,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#3b82f6',
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: false,
                tension: 0.4 
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { 
                display: true,
                position: 'top' as const,
                align: 'end' as const,
                labels: { boxWidth: 12, usePointStyle: true, font: { size: 11 } }
            },
            tooltip: {
                mode: 'index' as const, 
                intersect: false,
                callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.raw}%` }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                grid: { color: 'rgba(0, 0, 0, 0.05)' },
                ticks: { callback: (value: any) => `${value}%`, stepSize: 25, font: { size: 10 } }
            },
            x: {
                grid: { display: false },
                ticks: { font: { size: 10 } }
            }
        },
        interaction: {
            mode: 'nearest' as const,
            axis: 'x' as const,
            intersect: false
        }
    };

    return (
        <div className="bg-surface border border-border rounded-2xl shadow-sm flex flex-col h-full overflow-hidden">
            {/* Premium Header */}
            <div className="px-6 py-4 border-b border-border/50 bg-transparent flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                    <i className="fas fa-chart-line text-muted/60 text-sm"></i>
                    <h3 className="text-sm font-bold text-foreground tracking-wider">Monthly Chart</h3>
                </div>
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">{academicYear}</span>
            </div>

            <div className="p-5 flex-1 relative min-h-[200px] flex flex-col">
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center text-muted animate-pulse">
                        <i className="fas fa-spinner fa-spin mr-2"></i> Loading trends...
                    </div>
                ) : !hasData ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted opacity-50">
                        <i className="fas fa-chart-line text-3xl mb-2"></i>
                        <p className="text-sm">No trend data available yet.</p>
                    </div>
                ) : (
                    <div className="relative flex-1 w-full h-full">
                        <Line data={chartData} options={chartOptions} />
                    </div>
                )}
            </div>
        </div>
    );
}