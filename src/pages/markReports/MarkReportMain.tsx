import { useState, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthData } from '../../hooks/useAuthData'; // Adjust path
import { useGetClasses } from '../../api_services/schoolConfig_api/classApi'; // Adjust path
import { useGetAllMarkReports } from '../../api_services/markReport_api/markReportApi'; // Adjust path
import { SearchSelect } from '../../shared/ui/SearchSelect'; // Adjust path
import { Button } from '../../shared/ui/Button'; // Adjust path
import { getAcademicYears } from '../../utils/utils';
import { useGetSchoolById } from '../../api_services/schoolConfig_api/schoolapi';

export default function MarkReportMain() {
    const navigate = useNavigate();
    const location = useLocation(); // Hook to track current URL
    const { schoolId , currentRole} = useAuthData();
    // const currentYear = new Date().getFullYear();

    const { data: schoolData } = useGetSchoolById(schoolId!);


    const currentYear = schoolData?.currentAcademicYear || "";

    // --- State Filters ---
    const [filters, setFilters] = useState({
        academicYear: `${currentYear}`,
        classId: '',
        sectionId: '',
        studentId: ''
    });

    // --- Data Queries ---
    const { data: classesData, isLoading: isClassesLoading } = useGetClasses(schoolId!);

    // Fetch reports based on current selections
    const { data: reportPayload, isLoading: isReportsLoading } = useGetAllMarkReports({
        schoolId: schoolId!,
        academicYear: filters.academicYear,
        classId: filters.classId || undefined,
        sectionId: filters.sectionId || undefined,
        studentId: filters.studentId || undefined
    });

    const reports = reportPayload?.data || [];

    // --- Select Handlers ---
    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            // Reset downstream values automatically on shift
            ...(key === 'classId' ? { sectionId: '', studentId: '' } : {}),
            ...(key === 'sectionId' ? { studentId: '' } : {})
        }));
    };

    // Extract unique students across available reports
    const studentOptions = useMemo(() => {
        const uniqueStudents: Record<string, string> = {};
        reports.forEach((rep: any) => {
            if (rep.studentId?._id && rep.studentId?.studentName) {
                uniqueStudents[rep.studentId._id] = rep.studentId.studentName;
            }
        });
        return Object.entries(uniqueStudents).map(([value, label]) => ({ label, value }));
    }, [reports]);

    const classOptions = useMemo(() => {
        return (classesData || []).map((c: any) => ({ label: `Class ${c.name}`, value: c._id }));
    }, [classesData]);

    const activeReport = useMemo(() => {
        if (!filters.studentId) return null;
        return reports.find((r: any) => r.studentId?._id === filters.studentId);
    }, [reports, filters.studentId]);

    const marksSummary = useMemo(() => {
        if (!activeReport || activeReport.isAbsent) return null;
        let obtained = 0;
        let totalMax = 0;
        let status = 'PASS';

        activeReport.subjects.forEach((sub: any) => {
            obtained += sub.marksObtained || 0;
            totalMax += sub.maxMarks || 100;
            if (sub.marksObtained < sub.minPassingMarks) {
                status = 'FAIL';
            }
        });

        const percentage = totalMax > 0 ? parseFloat(((obtained / totalMax) * 100).toFixed(2)) : 0;
        return { obtained, totalMax, percentage, status };
    }, [activeReport]);


    const canCreate = !['parent'].includes(currentRole || '');

    // --- NESTED ROUTE BYPASS ---
    // If the URL has 'single' or 'create', stop rendering this main page and ONLY render the child component.
    const isChildRoute = location.pathname.includes('/single') || location.pathname.includes('/create');

    if (isChildRoute) {
        return <Outlet />;
    }

    return (
        <div className="w-full h-full flex flex-col space-y-6 overflow-hidden p-2 md:p-6 bg-mainBg animate-in fade-in duration-300">

            {/* --- FLAT HEADER DESIGN (Matches Class Configuration) --- */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 shrink-0 px-1">
                <div>
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <i className="fas fa-file-invoice text-primary"></i>
                        Mark Report Generation
                    </h2>
                    <p className="text-sm text-muted mt-1">Select configurations step-by-step to compile the student marksheet matrix.</p>
                </div>

                {/* Filter Dropdowns sitting cleanly on the right */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
                    <div className="w-full sm:w-48">
                        <SearchSelect
                            label="" // Removed label to keep the top bar clean like a search input
                            options={getAcademicYears()}
                            value={filters.academicYear}
                            onChange={(opt) => handleFilterChange('academicYear', String(opt.value))}
                            placeholder="Academic Year..."
                        />
                    </div>
                    <div className="w-full sm:w-48">
                        <SearchSelect
                            label=""
                            options={classOptions}
                            value={filters.classId}
                            onChange={(opt) => handleFilterChange('classId', String(opt.value))}
                            placeholder={isClassesLoading ? "Loading..." : "Choose Class..."}
                        />
                    </div>
                    <div className="w-full sm:w-56">
                        <SearchSelect
                            label=""
                            options={studentOptions}
                            value={filters.studentId}
                            onChange={(opt) => handleFilterChange('studentId', String(opt.value))}
                            placeholder="Target Student..."
                        />
                    </div>

                    {/* NEW: Create Button (Hidden from Parents) */}
                    {canCreate && (
                        <Button 
                            variant="primary" 
                            leftIcon="fas fa-plus" 
                            onClick={() => navigate('create')}
                            className="w-full sm:w-auto ml-2 shrink-0"
                        >
                            Create Report
                        </Button>
                    )}
                </div>
            </div>

            {/* --- Core Spreadsheet Workspace Layout --- */}
            <div className="flex-1 bg-surface border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">

                {!filters.classId ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-muted">
                        <i className="fas fa-layer-group text-4xl mb-3 opacity-30"></i>
                        <p className="font-semibold text-foreground">Awaiting Parameters</p>
                        <p className="text-sm mt-1 max-w-xs">Please select an active academic level from the top dropdown panels to stream results.</p>
                    </div>
                ) : isReportsLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <i className="fas fa-circle-notch fa-spin text-primary text-3xl"></i>
                    </div>
                ) : !filters.studentId ? (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="px-6 py-4 border-b border-border bg-sub-header flex justify-between items-center shrink-0">
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Class Report Registry ({reports.length})</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {reports.map((report: any) => (
                                <div key={report._id} className="border border-border rounded-xl p-5 bg-background flex justify-between items-center hover:border-primary/30 transition-colors">
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <div className="w-12 h-12 rounded-full bg-sub-header flex items-center justify-center text-primary font-bold text-lg shrink-0 border border-border">
                                            {report.studentId?.studentName?.charAt(0) || 'S'}
                                        </div>
                                        <div className="truncate">
                                            <p className="text-base font-bold text-foreground truncate">{report.studentId?.studentName || 'Unknown Student'}</p>
                                            <p className="text-xs text-muted font-medium mt-0.5">SR ID: {report.studentId?.srId || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="py-2 px-4 text-xs shrink-0"
                                        onClick={() => handleFilterChange('studentId', report.studentId?._id)}
                                    >
                                        View Grid
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : !activeReport ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-muted">
                        <i className="fas fa-folder-open text-4xl mb-3 opacity-30"></i>
                        <p className="text-base font-bold">No Records Found</p>
                    </div>
                ) : (
                    /* Detailed Spreadsheet Grid-Based Marksheet View */
                    <div className="flex-1 flex flex-col h-full overflow-hidden animate-in fade-in duration-200">

                        {/* Summary Header */}
                        <div className="px-6 py-5 border-b border-border bg-sub-header/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-foreground">{activeReport.studentId?.studentName}</h3>
                                <p className="text-sm text-muted mt-1 font-medium">
                                    Class {activeReport.classId?.name || 'Unassigned'} — Section {activeReport.sectionId?.name || 'N/A'}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" leftIcon="fas fa-arrow-left" className="text-sm py-2" onClick={() => setFilters(p => ({ ...p, studentId: '' }))}>
                                    All Students
                                </Button>
                                <Button variant="primary" leftIcon="fas fa-external-link-alt" className="text-sm py-2" onClick={() => navigate(`single/${activeReport._id}`)}>
                                    Detailed Sheet
                                </Button>
                            </div>
                        </div>

                        {/* Marksheet Grid (Timetable Matrix Style) */}
                        {/* <div className="flex-1 overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse min-w-[36rem]">
                                <thead>
                                    <tr className="border-b border-border bg-sub-header text-xs font-bold text-muted uppercase tracking-wider">
                                        <th className="px-6 py-4">Subject Heading</th>
                                        <th className="px-6 py-4 text-center">Marks Obtained</th>
                                        <th className="px-6 py-4 text-center">Min Passing</th>
                                        <th className="px-6 py-4 text-center">Max Aggregate</th>
                                        <th className="px-6 py-4 text-center">Grade</th>
                                        <th className="px-6 py-4 text-center">Result Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border text-sm">
                                    {activeReport.isAbsent ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-16 text-center text-danger font-semibold bg-danger/5">
                                                <i className="fas fa-user-times mr-2 text-xl mb-2 block"></i> Student was marked ABSENT for this examination timeline.
                                            </td>
                                        </tr>
                                    ) : (
                                        activeReport.subjects.map((sub: any) => {
                                            const isFailed = sub.marksObtained < sub.minPassingMarks;
                                            return (
                                                <tr key={sub._id} className="hover:bg-sub-header/30 transition-colors">
                                                    <td className="px-6 py-5 font-semibold text-foreground">{sub.subject}</td>
                                                    <td className={`px-6 py-5 text-center font-bold text-base ${isFailed ? 'text-danger' : 'text-foreground'}`}>
                                                        {sub.marksObtained}
                                                    </td>
                                                    <td className="px-6 py-5 text-center text-muted font-medium">{sub.minPassingMarks}</td>
                                                    <td className="px-6 py-5 text-center text-muted font-medium">{sub.maxMarks}</td>
                                                    <td className="px-6 py-5 text-center font-bold text-primary text-base">{sub.grade || '--'}</td>
                                                    <td className="px-6 py-5 text-center">
                                                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${isFailed ? 'bg-danger/10 text-danger border-danger/20' : 'bg-success/10 text-success border-success/20'
                                                            }`}>
                                                            {isFailed ? 'Fail' : 'Pass'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div> */}


                        {/* Consolidated Marksheet Matrix (Real World Rank Card Style) */}
                        <div className="flex-1 overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse min-w-[40rem]">
                                <thead>
                                    <tr className="border-b border-border bg-sub-header text-xs font-bold text-muted uppercase tracking-wider">
                                        <th className="px-6 py-4 border-r border-border/50 w-1/3">Subject</th>
                                        <th className="px-6 py-4 text-center">Quarterly</th>
                                        <th className="px-6 py-4 text-center">Mid Term</th>
                                        <th className="px-6 py-4 text-center">Half Yearly</th>
                                        <th className="px-6 py-4 text-center">Annual</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border text-sm">
                                    {activeReport.isAbsent ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-16 text-center text-danger font-semibold bg-danger/5">
                                                <i className="fas fa-user-times mr-2 text-xl mb-2 block"></i> Student was marked ABSENT for this examination timeline.
                                            </td>
                                        </tr>
                                    ) : (
                                        <>
                                            {/* --- Subject Rows --- */}
                                            {activeReport.subjects.map((sub: any) => {
                                                const passThreshold = sub.minPassingMarks || 35;
                                                
                                                // Map standard data or fallback to new matrix fields
                                                // (Currently maps marksObtained to Quarterly so UI doesn't break)
                                                const qMark = sub.quarterly ?? sub.marksObtained;
                                                const mMark = sub.midTerm ?? null;
                                                const hMark = sub.halfYearly ?? null;
                                                const aMark = sub.annual ?? null;

                                                // Helper to color marks safely
                                                const getMarkColor = (mark: number | null | undefined) => {
                                                    if (mark === null || mark === undefined || (mark as any) === '') return 'text-muted/40';
                                                    return Number(mark) < passThreshold ? 'text-danger font-black' : 'text-foreground font-bold';
                                                };

                                                return (
                                                    <tr key={sub._id || sub.subject} className="hover:bg-sub-header/30 transition-colors">
                                                        <td className="px-6 py-4 font-semibold text-foreground border-r border-border/50">
                                                            {sub.subject}
                                                        </td>
                                                        <td className={`px-6 py-4 text-center text-base ${getMarkColor(qMark)}`}>{qMark ?? '--'}</td>
                                                        <td className={`px-6 py-4 text-center text-base ${getMarkColor(mMark)}`}>{mMark ?? '--'}</td>
                                                        <td className={`px-6 py-4 text-center text-base ${getMarkColor(hMark)}`}>{hMark ?? '--'}</td>
                                                        <td className={`px-6 py-4 text-center text-base ${getMarkColor(aMark)}`}>{aMark ?? '--'}</td>
                                                    </tr>
                                                );
                                            })}

                                            {/* --- Overall Status Footer Row --- */}
                                            <tr className="bg-sub-header/20 border-t-2 border-border">
                                                <td className="px-6 py-4 font-bold text-muted uppercase tracking-wider border-r border-border/50 text-right text-[11px]">
                                                    Overall Result
                                                </td>
                                                {/* Iterate over column keys to calculate pass/fail vertically */}
                                                {['quarterly', 'midTerm', 'halfYearly', 'annual'].map((examKey, idx) => {
                                                    let hasData = false;
                                                    let isFail = false;

                                                    activeReport.subjects.forEach((sub: any) => {
                                                        const passThreshold = sub.minPassingMarks || 35;
                                                        // Check new fields, fallback to marksObtained for Quarterly
                                                        const mark = sub[examKey] ?? (examKey === 'quarterly' ? sub.marksObtained : null);
                                                        
                                                        if (mark !== null && mark !== undefined && mark !== '') {
                                                            hasData = true;
                                                            if (Number(mark) < passThreshold) {
                                                                isFail = true;
                                                            }
                                                        }
                                                    });

                                                    if (!hasData) {
                                                        return <td key={idx} className="px-6 py-4 text-center font-medium text-muted/40">--</td>;
                                                    }

                                                    return (
                                                        <td key={idx} className="px-6 py-4 text-center">
                                                            <span className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${
                                                                isFail ? 'bg-danger/10 text-danger border-danger/20' : 'bg-success/10 text-success border-success/20'
                                                            }`}>
                                                                {isFail ? 'Fail' : 'Pass'}
                                                            </span>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Sticky Grid Summary Aggregates */}
                        {marksSummary && (
                            <div className="px-6 py-5 border-t border-border bg-sub-header/30 grid grid-cols-2 sm:grid-cols-4 gap-6 shrink-0">
                                <div>
                                    <p className="text-[11px] text-muted font-bold uppercase tracking-wider">Total Marks</p>
                                    <p className="text-lg font-bold text-foreground mt-1">{marksSummary.obtained} <span className="text-sm text-muted">/ {marksSummary.totalMax}</span></p>
                                </div>
                                <div>
                                    <p className="text-[11px] text-muted font-bold uppercase tracking-wider">Percentage</p>
                                    <p className="text-lg font-bold text-primary mt-1">{marksSummary.percentage}%</p>
                                </div>
                                <div>
                                    <p className="text-[11px] text-muted font-bold uppercase tracking-wider">Aggregated Status</p>
                                    <span className={`inline-block text-xs font-bold uppercase tracking-wider mt-1.5 px-3 py-1 rounded-md border ${marksSummary.status === 'FAIL' ? 'bg-danger/10 text-danger border-danger/20' : 'bg-success/10 text-success border-success/20'
                                        }`}>
                                        {marksSummary.status}
                                    </span>
                                </div>
                                {activeReport.remarks && (
                                    <div className="col-span-2 sm:col-span-1 border-l border-border pl-4">
                                        <p className="text-[11px] text-muted font-bold uppercase tracking-wider">Teacher Remarks</p>
                                        <p className="text-sm font-semibold text-foreground mt-1 line-clamp-2" title={activeReport.remarks}>
                                            "{activeReport.remarks}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}