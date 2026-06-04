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
import { TableContainer, TBody, Td, Th, THead, Tr } from '../../shared/ui/TableLayout';
import { useRoleCheck } from '../../hooks/useRoleCheck';
// import { useGetMarkReportByIdV1 } from '../../api_services/markReport_api/markReportApi';
// import { useGetMarkReportConfigByClass } from '../../api_services/markReport_api/markReportConfigApi';

export default function MarkReportMain() {
    const navigate = useNavigate();
    const location = useLocation(); // Hook to track current URL
    const { schoolId } = useAuthData();
    const { isCorrespondent, isAdmin, isTeacher } = useRoleCheck();

    const canModify = isCorrespondent || isAdmin || isTeacher 
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


    // const canCreate = !['parent'].includes(currentRole || '');

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
                    {canModify && (
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
                    // <div className="flex-1 overflow-y-auto custom-scrollbar p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

                    //     {/* Map over the actual students */}
                    //     {studentsList?.map((student: any) => (
                    //         <div
                    //             key={student._id}
                    //             className="group flex flex-col bg-surface border border-border rounded-2xl overflow-hidden hover:shadow-md hover:border-primary/40 transition-all duration-200"
                    //         >
                    //             {/* Top half: Identity */}
                    //             <div className="p-5 flex items-start gap-4">
                    //                 <div className="w-12 h-12 rounded-xl bg-primary-soft flex items-center justify-center text-primary font-bold text-xl shrink-0 shadow-sm">
                    //                     {student.studentName?.charAt(0).toUpperCase() || 'S'}
                    //                 </div>
                    //                 <div className="flex-1 min-w-0">
                    //                     <h3 className="text-base font-bold text-foreground truncate" title={student.studentName}>
                    //                         {student.studentName || 'Unknown Student'}
                    //                     </h3>
                    //                     <div className="flex items-center gap-1.5 mt-1">
                    //                         <i className="fa-solid fa-id-card text-[10px] text-muted"></i>
                    //                         <p className="text-xs text-muted font-medium truncate">
                    //                             {student.srId || 'N/A'}
                    //                         </p>
                    //                     </div>
                    //                 </div>
                    //             </div>

                    //             {/* Bottom half: Context & Action */}
                    //             <div className="px-5 py-4 bg-background/50 border-t border-border flex items-center justify-between mt-auto gap-2">

                    //                 {/* Academic Badges */}
                    //                 <div className="flex items-center gap-2 overflow-hidden">
                    //                     {student.classId?.className && (
                    //                         <span className="px-2 py-1 bg-surface border border-border rounded-md text-[10px] font-bold text-foreground uppercase tracking-wider truncate">
                    //                             {student.classId.className}
                    //                         </span>
                    //                     )}
                    //                     {student.sectionId?.name && (
                    //                         <span className="px-2 py-1 bg-surface border border-border rounded-md text-[10px] font-bold text-foreground uppercase tracking-wider truncate">
                    //                             {student.sectionId.name}
                    //                         </span>
                    //                     )}
                    //                 </div>


                    //                 <Button
                    //                     variant="primary"
                    //                     leftIcon="fas fa-external-link-alt"
                    //                     className="py-1.5 px-3 text-xs shrink-0 group-hover:shadow-md transition-all"
                    //                     onClick={() => {
                    //                         // Pass the student ID in the path, and the context in the URL query string
                    //                         navigate(`single/${student._id}?academicYear=${filters.academicYear}&classId=${student.classId?._id || filters.classId}&sectionId=${student.sectionId?._id || filters.sectionId}`);
                    //                     }}
                    //                 >
                    //                     Detailed Sheet
                    //                 </Button>
                    //             </div>
                    //         </div>
                    //     ))}

                    //     {/* Empty State */}
                    //     {(!studentsList || studentsList.length === 0) && (
                    //         <div className="col-span-full py-12 text-center text-muted flex flex-col items-center">
                    //             <i className="fa-solid fa-users-slash text-4xl mb-3 opacity-50"></i>
                    //             <p className="font-medium">No students found.</p>
                    //             <p className="text-xs mt-1">Select a valid Class and Section to view the roster.</p>
                    //         </div>
                    //     )}
                    // </div>

                    <TableContainer className="h-full custom-scrollbar overscroll-none">
                        <THead className="sticky top-0 z-10 shadow-sm">
                            <Tr>
                                <Th className="text-center w-16">S.No</Th>
                                <Th className="text-left">Student Identity</Th>
                                <Th className="text-center">Class & Section</Th>
                                <Th className="text-right pr-6">Action</Th>
                            </Tr>
                        </THead>
                        <TBody>
                            {(!studentsList || studentsList.length === 0) ? (
                                /* Empty State */
                                <Tr>
                                    <td colSpan={4} className="py-12 text-center text-muted">
                                        <div className="flex flex-col items-center justify-center">
                                            <i className="fa-solid fa-users-slash text-4xl mb-3 opacity-50"></i>
                                            <p className="font-bold text-foreground">No students found.</p>
                                            <p className="text-xs mt-1">Select a valid Class and Section to view the roster.</p>
                                        </div>
                                    </td>
                                </Tr>
                            ) : (
                                /* Student Rows */
                                studentsList.map((student: any, index: number) => (
                                    <Tr key={student._id} className="hover:bg-primary-soft/20 transition-colors">

                                        {/* 1. S.No Column */}
                                        <Td className="align-middle pt-4 text-center">
                                            <span className="text-sm font-bold text-muted">
                                                {index + 1}
                                            </span>
                                        </Td>

                                        {/* 2. Identity Column (Avatar + Name + SR ID) */}
                                        <Td className="align-middle pt-3 text-left">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center text-primary font-bold text-lg shrink-0 shadow-sm border border-primary/10">
                                                    {student.studentName?.charAt(0).toUpperCase() || 'S'}
                                                </div>
                                                <div className="flex flex-col max-w-[200px] sm:max-w-[250px]">
                                                    <span className="text-sm font-bold text-foreground truncate" title={student.studentName}>
                                                        {student.studentName || 'Unknown Student'}
                                                    </span>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <i className="fa-solid fa-id-card text-[10px] text-muted"></i>
                                                        <span className="text-xs text-muted font-medium truncate">
                                                            {student.srId || 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Td>

                                        {/* 3. Class & Section Badges Column */}
                                        <Td className="align-middle pt-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {student.currentClassId?.name ? (
                                                    <span className="px-2 py-1 bg-surface border border-border rounded-md text-[10px] font-bold text-foreground uppercase tracking-wider">
                                                        {student.currentClassId.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted text-xs">--</span>
                                                )}
                                                {student.currentClassId?.name && (
                                                    <span className="px-2 py-1 bg-surface border border-border rounded-md text-[10px] font-bold text-foreground uppercase tracking-wider">
                                                        {student.currentSectionId.name}
                                                    </span>
                                                )}
                                            </div>
                                        </Td>

                                        {/* 4. Action Column */}
                                        <Td className="align-middle pt-3 text-right pr-6">
                                            <Button
                                                variant="primary"
                                                leftIcon="fas fa-external-link-alt"
                                                className="py-1.5 px-3 text-xs shrink-0 transition-all ml-auto"
                                                onClick={() => {
                                                    // Pass the student ID in the path, and the context in the URL query string
                                                    navigate(`single/${student._id}?academicYear=${filters.academicYear}&classId=${student.classId?._id || filters.classId}&sectionId=${student.sectionId?._id || filters.sectionId}`);
                                                }}
                                            >
                                                Detailed Sheet
                                            </Button>
                                        </Td>
                                    </Tr>
                                ))
                            )}
                        </TBody>
                    </TableContainer>
                )

                    : (

                        <></>
                    )
                }
            </div>
        </div>
    );
}