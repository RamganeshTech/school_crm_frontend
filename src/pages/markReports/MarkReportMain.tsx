import { useState, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthData } from '../../hooks/useAuthData'; // Adjust path
import { useGetClasses } from '../../api_services/schoolConfig_api/classApi'; // Adjust path
// import { useGetAllMarkReports } from '../../api_services/markReport_api/markReportApi'; // Adjust path
import { SearchSelect, type SelectOption } from '../../shared/ui/SearchSelect'; // Adjust path
import { Button } from '../../shared/ui/Button'; // Adjust path
import { getAcademicYears } from '../../utils/utils';
import { useGetSchoolById } from '../../api_services/schoolConfig_api/schoolapi';
import { useGetSections } from '../../api_services/schoolConfig_api/sectionApi';
import { useGetAllStudentsV1 } from '../../api_services/student_api/studentMainApi';
// import { useGetMarkReportByIdV1 } from '../../api_services/markReport_api/markReportApi';
// import { useGetMarkReportConfigByClass } from '../../api_services/markReport_api/markReportConfigApi';

export default function MarkReportMain() {
    const navigate = useNavigate();
    const location = useLocation(); // Hook to track current URL
    const { schoolId, currentRole } = useAuthData();
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
    const { data: sectionsData, isLoading: isSectionsLoading } = useGetSections({
        schoolId: schoolId!,
        classId: filters.classId
    });



    // 1. Fetch Students based on Class and Section (Roster View)
    const { data: studentsList, isLoading: isStudentsLoading } = useGetAllStudentsV1({
        schoolId: schoolId!,
        classId: filters.classId || undefined,
        sectionId: filters.sectionId || undefined,
    });

    // 2. NEW: Fetch single report only when a student is selected
    // const { data: reportPayload, isLoading: isReportLoading } = useGetMarkReportByIdV1(
    //     {
    //         studentId: filters.studentId,
    //         academicYear: filters.academicYear,
    //         classId: filters.classId,
    //         sectionId: filters.sectionId
    //     }

    // );


   
    // NOTE: You will use your "Get or Initialize Marksheet" hook further down in your code 
    // ONLY when filters.studentId is not null.
    // const reports = reportPayload?.data || [];

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

   


    const classOptions: SelectOption[] = useMemo(() => {
        return (classesData || []).map((c: any) => ({ label: `Class ${c.name}`, value: c._id }));
    }, [classesData]);

    const sectionOptions: SelectOption[] = useMemo(() => {
        return sectionsData?.map((sec: any) => ({ label: `Section ${sec.name}`, value: sec._id })) || [];
    }, [sectionsData]);

    // This replaces your old useMemo!
    // const activeReport = reportPayload?.data || null;
   

    const canCreate = !['parent'].includes(currentRole || '');

    // --- NESTED ROUTE BYPASS ---
    // If the URL has 'single' or 'create', stop rendering this main page and ONLY render the child component.
    const isChildRoute = location.pathname.includes('/single') || location.pathname.includes('/create');

    if (isChildRoute) {
        return <Outlet />;
    }

    return (
        <div className="w-full h-full flex flex-col space-y-6 overflow-hidden p-2 bg-mainBg animate-in fade-in duration-300">

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
                    {/* --- NEW SECTION FILTER --- */}
                    <div className="w-full sm:w-48 relative">
                        <SearchSelect
                            label=""
                            options={sectionOptions}
                            value={filters.sectionId}
                            onChange={(opt) => handleFilterChange('sectionId', String(opt.value))}
                            placeholder={isSectionsLoading ? "Loading..." : "Section..."}
                        />
                    </div>
                    {/* <div className="w-full sm:w-56">
                        <SearchSelect
                            label=""
                            options={studentOptions}
                            value={filters.studentId}
                            onChange={(opt) => handleFilterChange('studentId', String(opt.value))}
                            placeholder="Target Student..."
                        />
                    </div> */}

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
                ) : isStudentsLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <i className="fas fa-circle-notch fa-spin text-primary text-3xl"></i>
                    </div>
                ) : !filters.studentId ? (
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

                        {/* Map over the actual students */}
                        {studentsList?.map((student: any) => (
                            <div
                                key={student._id}
                                className="group flex flex-col bg-surface border border-border rounded-2xl overflow-hidden hover:shadow-md hover:border-primary/40 transition-all duration-200"
                            >
                                {/* Top half: Identity */}
                                <div className="p-5 flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary-soft flex items-center justify-center text-primary font-bold text-xl shrink-0 shadow-sm">
                                        {student.studentName?.charAt(0).toUpperCase() || 'S'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-bold text-foreground truncate" title={student.studentName}>
                                            {student.studentName || 'Unknown Student'}
                                        </h3>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <i className="fa-solid fa-id-card text-[10px] text-muted"></i>
                                            <p className="text-xs text-muted font-medium truncate">
                                                {student.srId || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom half: Context & Action */}
                                <div className="px-5 py-4 bg-background/50 border-t border-border flex items-center justify-between mt-auto gap-2">

                                    {/* Academic Badges */}
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        {student.classId?.className && (
                                            <span className="px-2 py-1 bg-surface border border-border rounded-md text-[10px] font-bold text-foreground uppercase tracking-wider truncate">
                                                {student.classId.className}
                                            </span>
                                        )}
                                        {student.sectionId?.name && (
                                            <span className="px-2 py-1 bg-surface border border-border rounded-md text-[10px] font-bold text-foreground uppercase tracking-wider truncate">
                                                {student.sectionId.name}
                                            </span>
                                        )}
                                    </div>

                                    {/* View Button - Sets the target student ID */}
                                    {/* <Button
                                        variant="outline"
                                        className="py-1.5 px-3 text-xs shrink-0 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-colors"
                                        onClick={() => handleFilterChange('studentId', student._id)}
                                    >
                                        View Grid
                                    </Button> */}

                                    <Button
                                        variant="primary"
                                        leftIcon="fas fa-external-link-alt"
                                        className="py-1.5 px-3 text-xs shrink-0 group-hover:shadow-md transition-all"
                                        onClick={() => {
                                            // Pass the student ID in the path, and the context in the URL query string
                                            navigate(`single/${student._id}?academicYear=${filters.academicYear}&classId=${student.classId?._id || filters.classId}&sectionId=${student.sectionId?._id || filters.sectionId}`);
                                        }}
                                    >
                                        Detailed Sheet
                                    </Button>
                                </div>
                            </div>
                        ))}

                        {/* Empty State */}
                        {(!studentsList || studentsList.length === 0) && (
                            <div className="col-span-full py-12 text-center text-muted flex flex-col items-center">
                                <i className="fa-solid fa-users-slash text-4xl mb-3 opacity-50"></i>
                                <p className="font-medium">No students found.</p>
                                <p className="text-xs mt-1">Select a valid Class and Section to view the roster.</p>
                            </div>
                        )}
                    </div>
                ) 
                
                : (

                    <></>
                )
                // : !activeReport ? (
                //     <div className="flex-1 flex flex-col items-center justify-center p-6 text-muted">
                //         <i className="fas fa-folder-open text-4xl mb-3 opacity-30"></i>
                //         <p className="text-base font-bold">No Records Found</p>
                //     </div>
                // ) : (
                //     <div className="flex-1 flex flex-col h-full overflow-hidden animate-in fade-in duration-200">



                //         <div className="px-6 py-5 border-b border-border bg-sub-header/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                //             <div>
                //                 <h3 className="text-xl font-bold text-foreground">{activeReport.studentId?.studentName}</h3>
                //                 <p className="text-sm text-muted mt-1 font-medium">
                //                     Class {activeReport.classId?.name || 'Unassigned'} — Section {activeReport.sectionId?.name || 'N/A'}
                //                 </p>
                //             </div>
                //             <div className="flex gap-3">
                //                 <Button variant="outline" leftIcon="fas fa-arrow-left" className="text-sm py-2" onClick={() => setFilters(p => ({ ...p, studentId: '' }))}>
                //                     All Students
                //                 </Button>
                //                 <Button variant="primary" leftIcon="fas fa-external-link-alt" className="text-sm py-2" onClick={() => navigate(`single/${activeReport._id}`)}>
                //                     Detailed Sheet
                //                 </Button>
                //             </div>
                //         </div>

                        

                //         <div className="overflow-x-auto rounded-xl border border-border shadow-sm bg-surface">
                //             <table className="w-full text-left border-collapse min-w-max">
                //                 <thead>
                //                     <tr className="text-[11px] font-bold text-muted uppercase tracking-wider border-b-2 border-border bg-mainBg">
                //                         <th className="p-4 border-r border-border/50 sticky left-0 z-10 bg-mainBg shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] w-64">
                //                             Subjects
                //                         </th>
                //                         {/* DYNAMIC EXAM HEADERS */}
                //                         {exams.map((exam, eIdx) => (
                //                             <th key={eIdx} className="p-4 border-r border-border/50 text-center min-w-[140px]">
                //                                 <div className="font-bold text-foreground text-sm">{exam.examName}</div>
                //                                 <div className="text-[10px] mt-1 font-normal opacity-70">
                //                                     Max {exam.maxMarks} • Pass {exam.passingMarks}
                //                                 </div>
                //                             </th>
                //                         ))}
                //                     </tr>
                //                 </thead>

                //                 <tbody className="divide-y divide-border/50">
                //                     {activeReport?.isAbsent ? (
                //                         <tr>
                //                             <td colSpan={exams.length + 1} className="px-6 py-16 text-center text-danger font-semibold bg-danger/5">
                //                                 <i className="fas fa-user-times mr-2 text-xl mb-2 block"></i>
                //                                 Student was marked ABSENT for this examination timeline.
                //                             </td>
                //                         </tr>
                //                     ) : (
                //                         /* DYNAMIC SUBJECT ROWS */
                //                         subjects.map((sub, sIdx) => (
                //                             <tr key={sIdx} className="hover:bg-sub-header/30 transition-colors group">

                //                                 {/* Subject Name Column (Sticky) */}
                //                                 <td className="p-4 font-semibold text-foreground border-r border-border/50 sticky left-0 z-10 bg-surface group-hover:bg-sub-header/50 transition-colors shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                //                                     {sub.subjectName}
                //                                     {sub.subjectCode && (
                //                                         <span className="block text-[10px] text-muted font-normal mt-0.5">
                //                                             {sub.subjectCode}
                //                                         </span>
                //                                     )}
                //                                 </td>

                //                                 {/* Exam Mark Columns */}
                //                                 {exams.map((exam, eIdx) => {
                //                                     const mark = getMark(sub.subjectName, exam.examName);

                //                                     // Check for null, undefined, and empty string
                //                                     const hasMark = mark !== null && mark !== undefined && mark !== '';
                //                                     const isFail = hasMark && Number(mark) < (exam?.passingMarks || 35);

                //                                     return (
                //                                         <td key={eIdx} className="p-3 border-r border-border/50 text-center">
                //                                             {hasMark ? (
                //                                                 <span className={`font-bold text-lg ${isFail ? 'text-danger' : 'text-foreground'}`}>
                //                                                     {mark}
                //                                                 </span>
                //                                             ) : (
                //                                                 <span className="text-muted/40 font-medium">--</span>
                //                                             )}
                //                                         </td>
                //                                     );
                //                                 })}
                //                             </tr>
                //                         ))
                //                     )}
                //                 </tbody>
                //             </table>
                //         </div>

                //         {marksSummary && (
                //             <div className="px-6 py-5 border-t border-border bg-sub-header/30 grid grid-cols-2 sm:grid-cols-4 gap-6 shrink-0">
                //                 <div>
                //                     <p className="text-[11px] text-muted font-bold uppercase tracking-wider">Total Marks</p>
                //                     <p className="text-lg font-bold text-foreground mt-1">{marksSummary.obtained} <span className="text-sm text-muted">/ {marksSummary.totalMax}</span></p>
                //                 </div>
                //                 <div>
                //                     <p className="text-[11px] text-muted font-bold uppercase tracking-wider">Percentage</p>
                //                     <p className="text-lg font-bold text-primary mt-1">{marksSummary.percentage}%</p>
                //                 </div>
                //                 <div>
                //                     <p className="text-[11px] text-muted font-bold uppercase tracking-wider">Aggregated Status</p>
                //                     <span className={`inline-block text-xs font-bold uppercase tracking-wider mt-1.5 px-3 py-1 rounded-md border ${marksSummary.status === 'FAIL' ? 'bg-danger/10 text-danger border-danger/20' : 'bg-success/10 text-success border-success/20'
                //                         }`}>
                //                         {marksSummary.status}
                //                     </span>
                //                 </div>
                //                 {activeReport.remarks && (
                //                     <div className="col-span-2 sm:col-span-1 border-l border-border pl-4">
                //                         <p className="text-[11px] text-muted font-bold uppercase tracking-wider">Teacher Remarks</p>
                //                         <p className="text-sm font-semibold text-foreground mt-1 line-clamp-2" title={activeReport.remarks}>
                //                             "{activeReport.remarks}"
                //                         </p>
                //                     </div>
                //                 )}
                //             </div>
                //         )}
                //     </div>
                // )
                }
            </div>
        </div>
    );
}