import { useState, useMemo, useEffect } from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import { useAuthData } from '../../../hooks/useAuthData';
import { useGetExpenseReport } from '../../../api_services/expense_api/expenseApi';
import { useGetSchoolById } from '../../../api_services/schoolConfig_api/schoolapi';
import { SearchSelect } from '../../../shared/ui/SearchSelect';
import { getAcademicYears } from '../../../utils/utils';
// import { useGetExpenseReport } from '../../api_services/expenseApi'; // Adjust path
// import { useAuthData } from '../../hooks/useAuthData';
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
    LineController,
    BarController
} from 'chart.js';

// Register the required components for Line, Bar, and Doughnut charts
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    LineController,
    BarController
);

// A nice palette of distinct colors for our dynamic categories
const CHART_COLORS = ['#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#14b8a6', '#f97316'];

export const STATUS_OPTIONS = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Verified', value: 'verified' }
];

const PAYMENT_MODE_OPTIONS = [
    { label: 'All Payment Modes', value: 'all' },
    { label: 'Cash', value: 'Cash' },
    { label: 'UPI', value: 'UPI' },
    { label: 'Cheque', value: 'Cheque' },
    { label: 'Bank Transfer', value: 'School Account Transfer' }
];


export default function ExpenseReportWidget() {
    const { schoolId } = useAuthData();


    const { data: schoolData } = useGetSchoolById(schoolId!);


    const currentYear = schoolData?.currentAcademicYear || "";


    // --- 1. Small Filter States ---
    const [range, setRange] = useState<'week' | 'month' | 'year'>('month');
    const [academicYear, setAcademicYear] = useState(currentYear); // Replace with your global default
    const [verificationStatus, setVerificationStatus] = useState('');
    // const [category, setCategory] = useState(''); // NEW state
    const [paymentMode, setPaymentMode] = useState('');


    // 2. 🌟 THE BRIDGE: Force the local state to stay updated when the parent changes
    useEffect(() => {
        if (currentYear) {
            setAcademicYear(currentYear);
        }
    }, [currentYear]); // This runs every time defaultYear changes from the parent


    // --- 2. Fetch Data ---
    const { data: reportData, isLoading } = useGetExpenseReport({
        schoolId: schoolId!,
        academicYear,
        range,
        verificationStatus: verificationStatus === 'all' ? undefined : verificationStatus,
        paymentMode: paymentMode === 'all' ? undefined : paymentMode,
        // category: category === 'all' ? undefined : category, // NEW filter
    });

    // Safely extract the facets
    const kpi = reportData?.kpi || { grandTotal: 0, totalTransactions: 0 };
    const categorySummary = reportData?.categorySummary || [];
    const timeline = reportData?.timeline || [];

    // --- 3. Dynamic Line Chart Config (Category-wise Timeline) ---
    const lineChartData = useMemo(() => {
        // Extract all unique categories present in the current summary
        const categories = categorySummary.map((c: any) => c.category);

        // Build a dataset line for EACH category
        const datasets = categories.map((cat: string, index: number) => ({
            label: cat,
            data: timeline.map((t: any) => t[cat] || 0), // Fallback to 0 if category had no expense that day/month
            borderColor: CHART_COLORS[index % CHART_COLORS.length],
            backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
            tension: 0.3,
            borderWidth: 2,
            pointRadius: 2,
        }));

        return {
            labels: timeline.map((t: any) => t.date),
            datasets
        };
    }, [timeline, categorySummary]);

    // --- 4. Donut Chart Config (Category Summary) ---
    const donutData = useMemo(() => {
        return {
            labels: categorySummary.map((c: any) => c.category),
            datasets: [{
                data: categorySummary.map((c: any) => c.amount),
                backgroundColor: CHART_COLORS.slice(0, categorySummary.length),
                borderWidth: 0,
                hoverOffset: 4
            }]
        };
    }, [categorySummary]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' as const, labels: { usePointStyle: true, boxWidth: 8 } } },
    };

    return (
        <div className="space-y-6">
            {/* --- TOP BAR: COMPACT FILTERS --- */}
            <div className="bg-surface p-4 rounded-xl border border-border shadow-sm flex flex-wrap items-center justify-between gap-4">


                {/* Left Side: Heading and Range Chips stacked vertically together */}
                <div className="flex flex-col gap-2 items-start">
                    <h3 className="text-lg text-primary font-bold tracking-tight">
                        Expense Report
                    </h3>

                    {/* Range Chips */}
                    <div className="flex items-center gap-1 bg-mainBg p-0.5 rounded-lg border border-border shrink-0">
                        {['week', 'month', 'year'].map((r) => (
                            <button
                                key={r}
                                onClick={() => setRange(r as any)}
                                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-colors ${range === r
                                        ? 'bg-primary text-inverse shadow-sm'
                                        : 'text-muted hover:text-foreground'
                                    }`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: Dropdown Filters */}
                <div className="flex items-center gap-3">

                    <SearchSelect
                        label="Academic Year" // Removed label to keep the top bar clean like a search input
                        options={getAcademicYears()}
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.value as string)}
                        placeholder="Academic Year..."
                    />

                    <SearchSelect
                        label="Status" // Removed label to keep the top bar clean like a search input
                        options={STATUS_OPTIONS}
                        value={verificationStatus}
                        onChange={(e) => setVerificationStatus(e.value as string)}
                        placeholder="pending, verified..."
                    />



                    <SearchSelect
                        label="Payment Mode"
                        options={PAYMENT_MODE_OPTIONS}
                        value={paymentMode}
                        // Access the value directly from the selected option object
                        onChange={(opt) => setPaymentMode(opt.value as string)}
                        placeholder="Select Mode..."
                    />
                </div>
            </div>

            {/* --- KPI SUMMARY ROW --- */}
            {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-surface p-5 rounded-xl border border-border shadow-sm">
                    <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Total Expense</p>
                    <h2 className="text-2xl font-bold text-foreground mt-1">₹{kpi.grandTotal.toLocaleString()}</h2>
                </div>

                <div className="bg-surface p-5 rounded-xl border border-border shadow-sm">
                    <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Total Transactions</p>
                    <h2 className="text-2xl font-bold text-foreground mt-1">{kpi.totalTransactions}</h2>
                </div>

                <div className="bg-surface p-5 rounded-xl border border-border shadow-sm border-l-4 border-l-warning">
                    <p className="text-[10px] font-bold text-warning uppercase tracking-wider">
                        Pending Verification
                    </p>
                    <h2 className="text-2xl font-bold text-foreground mt-1">
                        ₹{kpi.pendingAmount?.toLocaleString() || 0}
                    </h2>
                    <p className="text-[10px] text-muted mt-1">
                        {kpi.pendingCount || 0} documents pending
                    </p>
                </div>

                <div className="bg-surface p-5 rounded-xl border border-border shadow-sm border-l-4 border-l-success">
                    <p className="text-[10px] font-bold text-success uppercase tracking-wider">
                        Verified Expense
                    </p>
                    <h2 className="text-2xl font-bold text-foreground mt-1">
                        ₹{kpi.verifiedAmount?.toLocaleString() || 0}
                    </h2>
                    <p className="text-[10px] text-muted mt-1">
                        {kpi.verifiedCount || 0} documents verified
                    </p>
                </div>
            </div> */}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* 1. Total Expense Card */}
                <div className="bg-surface p-5 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow duration-200 group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Total Expense</p>
                            <h2 className="text-2xl font-black text-foreground mt-1 tracking-tight">
                                ₹{kpi.grandTotal.toLocaleString()}
                            </h2>
                        </div>
                        {/* Soft Icon Wrapper */}
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-200">
                            <i className="fas fa-wallet text-sm"></i>
                        </div>
                    </div>
                    <p className="text-[10px] text-muted mt-2 font-medium">
                        Across selected period
                    </p>
                </div>

                {/* 2. Total Transactions Card */}
                <div className="bg-surface p-5 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow duration-200 group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Total Transactions</p>
                            <h2 className="text-2xl font-black text-foreground mt-1 tracking-tight">
                                {kpi.totalTransactions}
                            </h2>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-200">
                            <i className="fas fa-file-invoice text-sm"></i>
                        </div>
                    </div>
                    <p className="text-[10px] text-muted mt-2 font-medium">
                        Recorded ledger entries
                    </p>
                </div>

                {/* 3. Pending Verification Card */}
                <div className="bg-surface p-5 rounded-xl border border-border shadow-sm border-l-4 border-l-warning hover:shadow-md transition-shadow duration-200 group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-bold text-warning uppercase tracking-wider">Pending Verification</p>
                            <h2 className="text-2xl font-black text-foreground mt-1 tracking-tight">
                                ₹{kpi.pendingAmount?.toLocaleString() || 0}
                            </h2>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center text-warning group-hover:scale-110 transition-transform duration-200">
                            <i className="fas fa-clock-rotate-left text-sm"></i>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                        <span className="relative flex h-2 w-2">
                            {/* <span className="absolute inline-flex h-full w-full rounded-full bg-warning opacity-75"></span> */}
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-warning"></span>
                        </span>
                        <p className="text-[10px] text-muted font-medium">
                            {kpi.pendingCount || 0} documents awaiting review
                        </p>
                    </div>
                </div>

                {/* 4. Verified Expense Card */}
                <div className="bg-surface p-5 rounded-xl border border-border shadow-sm border-l-4 border-l-success hover:shadow-md transition-shadow duration-200 group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-bold text-success uppercase tracking-wider">Verified Expense</p>
                            <h2 className="text-2xl font-black text-foreground mt-1 tracking-tight">
                                ₹{kpi.verifiedAmount?.toLocaleString() || 0}
                            </h2>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center text-success group-hover:scale-110 transition-transform duration-200">
                            <i className="fas fa-check text-sm"></i>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                        <i className="fas fa-check-circle text-[10px] text-success"></i>
                        <p className="text-[10px] text-muted font-medium">
                            {kpi.verifiedCount || 0} documents approved
                        </p>
                    </div>
                </div>
            </div>

            {/* --- CHARTS ROW --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Line Chart (2/3 width) */}
                <div className="lg:col-span-2 bg-surface p-6 rounded-xl border border-border shadow-sm flex flex-col h-[400px]">
                    <div className="mb-4">
                        <h3 className="font-bold text-sm uppercase tracking-wide">Category Spending Timeline</h3>
                        <p className="text-xs text-muted">Tracking outflow distribution across categories</p>
                    </div>
                    <div className="flex-1 relative">
                        {isLoading ? (
                            <div className="absolute inset-0 flex items-center justify-center"><i className="fas fa-spinner fa-spin text-muted text-2xl"></i></div>
                        ) : timeline.length === 0 ? (
                            <div className="absolute inset-0 flex items-center justify-center text-muted text-sm">No timeline data for this filter.</div>
                        ) : (
                            <Line data={lineChartData} options={chartOptions} />
                        )}
                    </div>
                </div>

                {/* Donut Chart (1/3 width) */}
                <div className="lg:col-span-1 bg-surface p-6 rounded-xl border border-border shadow-sm flex flex-col h-[400px]">
                    <div className="mb-4 text-center">
                        <h3 className="font-bold text-sm uppercase tracking-wide">Expense Composition</h3>
                    </div>
                    <div className="flex-1 relative">
                        {isLoading ? (
                            <div className="absolute inset-0 flex items-center justify-center"><i className="fas fa-spinner fa-spin text-muted text-2xl"></i></div>
                        ) : categorySummary.length === 0 ? (
                            <div className="absolute inset-0 flex items-center justify-center text-muted text-sm">No expenses found.</div>
                        ) : (
                            <Doughnut data={donutData} options={{ ...chartOptions, cutout: '65%' }} />
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}