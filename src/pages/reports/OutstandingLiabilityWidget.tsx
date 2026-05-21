// // components/dashboard/charts/OutstandingLiabilityWidget.tsx
// import { Doughnut } from 'react-chartjs-2';
// import { useAuthData } from '../../hooks/useAuthData';
// import { useGetOutstandingStats } from '../../api_services/financeApi/financeApi';
// import { useState } from 'react';
// // import { useGetOutstandingStats } from '../../../api_services/financeApi'; // Adjust path
// // import { useAuthData } from '../../../hooks/useAuthData';

// // Assuming academicYear comes from a global context or hook, passed as prop here for simplicity
// export default function OutstandingLiabilityWidget({ academicYear }: { academicYear: string }) {
//     const { schoolId } = useAuthData();

//     const { data: outstandingPayload, isLoading } = useGetOutstandingStats({
//         schoolId: schoolId!,
//         academicYear
//     });
//     const [selectedAcademicYear, SetSelectedAcademicYear] = useState(academicYear);

//     const breakdown = outstandingPayload?.breakdown || {};
//     const totalDue = outstandingPayload?.totalOutstanding || 0;

//     const chartData = {
//         labels: ['Admission', 'Term 1', 'Term 2', 'Transport'],
//         datasets: [
//             {
//                 data: [
//                     breakdown.admission || 0,
//                     breakdown.term1 || 0,
//                     breakdown.term2 || 0,
//                     breakdown.transport || 0
//                 ],
//                 backgroundColor: [
//                     '#3b82f6', // Blue
//                     '#8b5cf6', // Violet
//                     '#f59e0b', // Amber
//                     '#ec4899'  // Pink
//                 ],
//                 borderWidth: 0,
//                 hoverOffset: 4
//             },
//         ],
//     };

//     const options = {
//         responsive: true,
//         maintainAspectRatio: false,
//         cutout: '70%', // Makes it a donut
//         plugins: {
//             legend: { position: 'bottom' as const, labels: { usePointStyle: true, padding: 20 } },
//             tooltip: {
//                 callbacks: {
//                     label: (context: any) => ` ₹${context.raw.toLocaleString()}`
//                 }
//             }
//         },
//     };

//     return (
//         <div className="bg-surface p-6 rounded-2xl border border-border flex flex-col h-[400px]">
//             <h3 className="font-bold text-foreground uppercase tracking-wide text-sm">Outstanding Liability Matrix</h3>
//             <p className="text-xs text-muted mt-1 mb-6">Categorical structure mapping dynamic uncollected asset balances</p>

//             <div className="flex-1 relative w-full h-full flex items-center justify-center">
//                 {isLoading ? (
//                     <i className="fas fa-circle-notch fa-spin text-muted text-2xl"></i>
//                 ) : totalDue === 0 ? (
//                     <div className="text-center text-muted">
//                         <i className="fas fa-chart-pie text-3xl mb-2 opacity-50"></i>
//                         <p className="text-sm font-medium">Perfect ledger clearance.</p>
//                         <p className="text-xs">Zero pending liabilities identified.</p>
//                     </div>
//                 ) : (
//                     <>
//                         <Doughnut data={chartData} options={options} />
//                         {/* Center Text overlay */}
//                         <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
//                             <span className="text-[10px] font-bold text-muted uppercase">Total Pending</span>
//                             <span className="text-xl font-bold text-danger">₹{totalDue.toLocaleString()}</span>
//                         </div>
//                     </>
//                 )}
//             </div>
//         </div>
//     );
// }

    // components/dashboard/charts/OutstandingLiabilityWidget.tsx
    import { Doughnut } from 'react-chartjs-2';
    import { useAuthData } from '../../hooks/useAuthData';
    import { useGetOutstandingStats } from '../../api_services/financeApi/financeApi';
    import { useState } from 'react';
    import { SearchSelect } from '../../shared/ui/SearchSelect';
    import { getAcademicYears } from '../../utils/utils';
    // import { useGetOutstandingStats } from '../../../api_services/financeApi'; // Adjust path
    // import { useAuthData } from '../../../hooks/useAuthData';

    export default function OutstandingLiabilityWidget({ defaultYear }: { defaultYear: string }) {
        const { schoolId } = useAuthData();
        
        // Local state to manage the dropdown, initialized with the global default
        const [academicYear, setAcademicYear] = useState(defaultYear);

        const { data: outstandingPayload, isLoading } = useGetOutstandingStats({
            schoolId: schoolId!,
            academicYear
        });

        const breakdown = outstandingPayload?.breakdown || {};
        const totalDue = outstandingPayload?.totalOutstanding || 0;

        const chartData = {
            labels: ['Admission', 'Term 1', 'Term 2', 'Transport'],
            datasets: [
                {
                    data: [
                        breakdown.admission || 0,
                        breakdown.term1 || 0,
                        breakdown.term2 || 0,
                        breakdown.transport || 0
                    ],
                    backgroundColor: ['#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'],
                    borderWidth: 0,
                    hoverOffset: 4
                },
            ],
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: { position: 'bottom' as const, labels: { usePointStyle: true, padding: 20 } },
                tooltip: {
                    callbacks: { label: (context: any) => ` ₹${context.raw.toLocaleString()}` }
                }
            },
        };

        return (
            <div className="bg-surface p-6 rounded-2xl border border-border flex flex-col h-[400px]">
                {/* Header Area with the Dropdown */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="font-bold text-foreground uppercase tracking-wide text-sm">Outstanding Liability Matrix</h3>
                        <p className="text-xs text-muted mt-1">Categorical structure mapping dynamic uncollected asset balances</p>
                    </div>
                    
                    {/* Independent Academic Year Filter */}
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
                <div className="flex-1 relative w-full h-full flex items-center justify-center">
                    {isLoading ? (
                        <i className="fas fa-circle-notch fa-spin text-muted text-2xl"></i>
                    ) : totalDue === 0 ? (
                        <div className="text-center text-muted">
                            <i className="fas fa-chart-pie text-3xl mb-2 opacity-50"></i>
                            <p className="text-sm font-medium">Perfect ledger clearance.</p>
                            <p className="text-xs">Zero pending liabilities identified.</p>
                        </div>
                    ) : (
                        <>
                            <Doughnut data={chartData} options={options} />
                            {/* Center Text overlay */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                                <span className="text-[10px] font-bold text-muted uppercase">Total Pending</span>
                                <span className="text-xl font-bold text-danger">₹{totalDue.toLocaleString()}</span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }