// import  { useState, useEffect, useMemo } from 'react';
// import { useAuthData } from '../../../hooks/useAuthData';
// import { useGetMarkReportConfigByClass, 
// useCreateMarkReportConfig, 
// useUpdateMarkReportConfig, type IExamConfig, type ISubjectConfig } from '../../../api_services/markReport_api/markReportConfigApi';
// import { useGetClasses } from '../../../api_services/schoolConfig_api/classApi';
// import { toast } from '../../../shared/ui/ToastContext';
// import { SearchSelect } from '../../../shared/ui/SearchSelect';
// import { getAcademicYears } from '../../../utils/utils';
// import { Input } from '../../../shared/ui/Input';
// import { Button } from '../../../shared/ui/Button';
// import { useGetSchoolById } from '../../../api_services/schoolConfig_api/schoolapi';

// export default function MarkReportConfigMain() {
//     const { schoolId } = useAuthData();

//      const { data: schoolData } = useGetSchoolById(schoolId!);


//         const currentYear = schoolData?.currentAcademicYear || "";

//     // const currentYear = new Date().getFullYear();
//     // const defaultAcademicYear = `${currentYear}-${currentYear + 1}`;

//     // --- Core Filters ---
//     const [filters, setFilters] = useState({
//         academicYear: currentYear,
//         classId: ''
//     });

//     // --- Local Form State (Grid Builder) ---
//     const [exams, setExams] = useState<IExamConfig[]>([]);
//     const [subjects, setSubjects] = useState<ISubjectConfig[]>([]);

//     // --- Queries ---
//     const { data: classesData, isLoading: isClassesLoading } = useGetClasses(schoolId!);


//     // Only fetch config if we have selected a class
//     const { 
//         data: configData, 
//         isLoading: isConfigLoading, 
//         isError: isConfigError 
//     } = useGetMarkReportConfigByClass({
//         schoolId: schoolId!,
//         academicYear: filters.academicYear,
//         classId: filters.classId
//     });

//     // --- Mutations ---
//     const { mutateAsync: createConfig, isPending: isCreating } = useCreateMarkReportConfig();
//     const { mutateAsync: updateConfig, isPending: isUpdating } = useUpdateMarkReportConfig();

//     // --- Format Dropdown Options ---
//    const classOptions = useMemo(() => {
//            return (classesData || []).map((c: any) => ({ label: `Class ${c.name}`, value: c._id }));
//        }, [classesData]);

//     // --- Sync Fetched Data to Local State ---
//     useEffect(() => {
//         if (configData) {
//             // Existing config found
//             setExams(configData.exams || []);
//             setSubjects(configData.subjects || []);
//         } else if (isConfigError) {
//             // 404 Not Found (New config setup)
//             setExams([]);
//             setSubjects([]);
//         }
//     }, [configData, isConfigError, filters.classId]);

//     // --- Handlers ---
//     const handleFilterChange = (key: string, value: string) => {
//         setFilters(prev => ({ ...prev, [key]: value }));
//     };

//     const handleSave = async () => {
//         if (!filters.classId) return toast.error("Please select a class first");
//         if (exams.length === 0) return toast.error("Please add at least one exam column");
//         if (subjects.length === 0) return toast.error("Please add at least one subject row");

//         try {
//             if (configData?._id) {
//                 // UPDATE EXISTING
//                 await updateConfig({
//                     configId: configData._id,
//                     exams,
//                     subjects
//                 });
//                 toast.success("Report template updated successfully!");
//             } else {
//                 // CREATE NEW
//                 await createConfig({
//                     schoolId: schoolId!,
//                     academicYear: filters.academicYear,
//                     classId: filters.classId,
//                     exams,
//                     subjects
//                 });
//                 toast.success("New report template created!");
//             }
//         } catch (error: any) {
//             toast.error(error.response?.data?.message || "Failed to save configuration");
//         }
//     };

//     return (
//         <div className="w-full h-full flex flex-col space-y-6 overflow-y-auto custom-scrollbar p-4 md:p-6 bg-mainBg animate-in fade-in duration-300">

//             {/* Header & Filters */}
//             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5 shrink-0">
//                 <div>
//                     <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
//                         <i className="fas fa-table text-primary"></i>
//                         Mark Report Structure Builder
//                     </h2>
//                     <p className="text-sm text-muted mt-1">Define the exams (columns) and subjects (rows) for the selected class.</p>
//                 </div>

//                 <div className="flex flex-wrap items-center gap-3">
//                     <div className="w-full sm:w-48">
//                         <SearchSelect
//                             label=""
//                             options={getAcademicYears()}
//                             value={filters.academicYear}
//                             onChange={(opt) => handleFilterChange('academicYear', String(opt.value))}
//                             placeholder="Academic Year..."
//                         />
//                     </div>
//                     <div className="w-full sm:w-48">
//                         <SearchSelect
//                             label=""
//                             options={classOptions}
//                             value={filters.classId}
//                             onChange={(opt) => handleFilterChange('classId', String(opt.value))}
//                             placeholder={isClassesLoading ? "Loading..." : "Choose Class..."}
//                         />
//                     </div>
//                 </div>
//             </div>

//             {!filters.classId ? (
//                 <div className="flex-1 flex flex-col items-center justify-center text-muted border-2 border-dashed border-border rounded-xl">
//                     <i className="fas fa-hand-pointer text-4xl mb-3 opacity-50"></i>
//                     <p>Select a class from the dropdown to build its report card template.</p>
//                 </div>
//             ) : isConfigLoading ? (
//                 <div className="flex-1 flex items-center justify-center">
//                     <i className="fas fa-circle-notch fa-spin text-primary text-3xl"></i>
//                 </div>
//             ) : (
//                 <div className="flex flex-col lg:flex-row gap-6">

//                     {/* LEFT PANEL: EXAMS (COLUMNS) */}
//                     <div className="flex-1 bg-surface border border-border rounded-xl p-5 shadow-sm">
//                         <div className="flex items-center justify-between mb-4">
//                             <h3 className="font-bold text-foreground">Exams (Table Columns)</h3>
//                             <Button 
//                                 onClick={() => setExams([...exams, { examName: '', maxMarks: 100, passingMarks: 35 }])}
//                                 className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 transition"
//                             >
//                                 Add Exam
//                             </Button>
//                         </div>

//                         <div className="space-y-3">
//                             {exams.length === 0 && <p className="text-xs text-muted italic">No exams added yet.</p>}
//                             {exams.map((exam, idx) => (
//                                 <div key={idx} className="flex items-start gap-2 p-3 border border-border rounded-lg bg-mainBg">
//                                     <div className="flex-1 space-y-2">
//                                         <Input 
//                                             type="text" 
//                                             placeholder="Exam Name (e.g. 1st Mid Term)" 
//                                             value={exam.examName}
//                                             onChange={(e) => {
//                                                 const newExams = [...exams];
//                                                 newExams[idx].examName = e.target.value;
//                                                 setExams(newExams);
//                                             }}
//                                             className="w-full text-sm bg-transparent border-b border-border focus:border-primary outline-none px-1 py-1 text-foreground"
//                                         />
//                                         <div className="flex gap-4">
//                                             <label className="text-xs text-muted flex items-center gap-2">
//                                                 Max:
//                                                 <Input 
//                                                     type="number" 
//                                                     value={exam.maxMarks}
//                                                     onChange={(e) => {
//                                                         const newExams = [...exams];
//                                                         newExams[idx].maxMarks = Number(e.target.value);
//                                                         setExams(newExams);
//                                                     }}
//                                                     className="w-16 bg-surface border border-border rounded px-2 py-0.5"
//                                                 />
//                                             </label>
//                                             <label className="text-xs text-muted flex items-center gap-2">
//                                                 Pass:
//                                                 <Input 
//                                                     type="number" 
//                                                     value={exam.passingMarks}
//                                                     onChange={(e) => {
//                                                         const newExams = [...exams];
//                                                         newExams[idx].passingMarks = Number(e.target.value);
//                                                         setExams(newExams);
//                                                     }}
//                                                     className="w-16 bg-surface border border-border rounded px-2 py-0.5"
//                                                 />
//                                             </label>
//                                         </div>
//                                     </div>
//                                     <button 
//                                         onClick={() => setExams(exams.filter((_, i) => i !== idx))}
//                                         className="text-danger hover:bg-danger/10 w-8 h-8 rounded-lg flex items-center justify-center transition"
//                                     >
//                                         <i className="fas fa-trash text-sm"></i>
//                                     </button>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>

//                     {/* RIGHT PANEL: SUBJECTS (ROWS) */}
//                     <div className="flex-1 bg-surface border border-border rounded-xl p-5 shadow-sm">
//                         <div className="flex items-center justify-between mb-4">
//                             <h3 className="font-bold text-foreground">Subjects (Table Rows)</h3>
//                             <button 
//                                 onClick={() => setSubjects([...subjects, { subjectName: '', subjectCode: '' }])}
//                                 className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 transition"
//                             >
//                                 <i className="fas fa-plus mr-1"></i> Add Subject
//                             </button>
//                         </div>

//                         <div className="space-y-3">
//                             {subjects.length === 0 && <p className="text-xs text-muted italic">No subjects added yet.</p>}
//                             {subjects.map((subject, idx) => (
//                                 <div key={idx} className="flex items-center gap-2 p-3 border border-border rounded-lg bg-mainBg">
//                                     <input 
//                                         type="text" 
//                                         placeholder="Subject Name (e.g. Science)" 
//                                         value={subject.subjectName}
//                                         onChange={(e) => {
//                                             const newSubs = [...subjects];
//                                             newSubs[idx].subjectName = e.target.value;
//                                             setSubjects(newSubs);
//                                         }}
//                                         className="flex-1 text-sm bg-transparent border-b border-border focus:border-primary outline-none px-1 py-1 text-foreground"
//                                     />
//                                     <input 
//                                         type="text" 
//                                         placeholder="Code (Opt)" 
//                                         value={subject.subjectCode}
//                                         onChange={(e) => {
//                                             const newSubs = [...subjects];
//                                             newSubs[idx].subjectCode = e.target.value;
//                                             setSubjects(newSubs);
//                                         }}
//                                         className="w-24 text-sm bg-transparent border-b border-border focus:border-primary outline-none px-1 py-1 text-foreground"
//                                     />
//                                     <button 
//                                         onClick={() => setSubjects(subjects.filter((_, i) => i !== idx))}
//                                         className="text-danger hover:bg-danger/10 w-8 h-8 rounded-lg flex items-center justify-center transition"
//                                     >
//                                         <i className="fas fa-trash text-sm"></i>
//                                     </button>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Save Action Bar */}
//             {filters.classId && (
//                 <div className="flex justify-end pt-4 border-t border-border">
//                     <button 
//                         onClick={handleSave}
//                         disabled={isCreating || isUpdating}
//                         className="bg-primary text-white font-medium px-6 py-2.5 rounded-lg hover:bg-primary-hover active:scale-95 transition disabled:opacity-50 flex items-center gap-2 shadow-sm shadow-primary/20"
//                     >
//                         {isCreating || isUpdating ? (
//                             <i className="fas fa-circle-notch fa-spin"></i>
//                         ) : (
//                             <i className="fas fa-save"></i>
//                         )}
//                         {configData?._id ? "Update Configuration" : "Save New Configuration"}
//                     </button>
//                 </div>
//             )}
//         </div>
//     );
// }


import { useState, useEffect, useMemo } from 'react';
import { useAuthData } from '../../../hooks/useAuthData';
import {
    useGetMarkReportConfigByClass,
    useCreateMarkReportConfig,
    useUpdateMarkReportConfig,
    type IExamConfig,
    type ISubjectConfig
} from '../../../api_services/markReport_api/markReportConfigApi';
import { useGetClasses } from '../../../api_services/schoolConfig_api/classApi';
import { toast } from '../../../shared/ui/ToastContext';
import { SearchSelect } from '../../../shared/ui/SearchSelect';
import { getAcademicYears } from '../../../utils/utils';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { useGetSchoolById } from '../../../api_services/schoolConfig_api/schoolapi';

export default function MarkReportConfigMain() {
    const { schoolId } = useAuthData();
    const { data: schoolData } = useGetSchoolById(schoolId!);

    const currentYear = schoolData?.currentAcademicYear || "";

    const [filters, setFilters] = useState({
        academicYear: currentYear,
        classId: ''
    });

    const [exams, setExams] = useState<IExamConfig[]>([]);
    const [subjects, setSubjects] = useState<ISubjectConfig[]>([]);

    const { data: classesData, isLoading: isClassesLoading } = useGetClasses(schoolId!);

    const {
        data: configData,
        isLoading: isConfigLoading,
        isError: isConfigError
    } = useGetMarkReportConfigByClass({
        schoolId: schoolId!,
        academicYear: filters.academicYear,
        classId: filters.classId
    });

    const { mutateAsync: createConfig, isPending: isCreating } = useCreateMarkReportConfig();
    const { mutateAsync: updateConfig, isPending: isUpdating } = useUpdateMarkReportConfig();

    const classOptions = useMemo(() => {
        return (classesData || []).map((c: any) => ({ label: `Class ${c.name}`, value: c._id }));
    }, [classesData]);

    useEffect(() => {
        if (configData) {
            setExams(configData.exams || []);
            setSubjects(configData.subjects || []);
        } else if (isConfigError) {
            setExams([]);
            setSubjects([]);
        }
    }, [configData, isConfigError, filters.classId]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        if (!filters.classId) return toast.error("Please select a class first");
        if (exams.length === 0) return toast.error("Please add at least one exam column");
        if (subjects.length === 0) return toast.error("Please add at least one subject row");

        try {
            if (configData?._id) {
                await updateConfig({
                    configId: configData._id,
                    exams,
                    subjects
                });
                toast.success("Report template updated successfully!");
            } else {
                await createConfig({
                    schoolId: schoolId!,
                    academicYear: filters.academicYear,
                    classId: filters.classId,
                    exams,
                    subjects
                });
                toast.success("New report template created!");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || error?.message || "Failed to save configuration");
        }
    };

    // Prevent negative numbers in order fields
    const handleOrderChange = (value: string) => {
        const num = parseInt(value, 10);
        return isNaN(num) || num < 0 ? 0 : num;
    };

    // Sorted arrays for the Live Preview Matrix
    const sortedExams = [...exams].sort((a, b) => (a.order || 0) - (b.order || 0));
    const sortedSubjects = [...subjects].sort((a, b) => (a.order || 0) - (b.order || 0));

    return (
        <div className="w-full h-full flex flex-col space-y-6 overflow-y-auto custom-scrollbar p-4 md:p-6 bg-mainBg animate-in fade-in duration-300">

            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5 shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                        <i className="fas fa-table-list text-primary"></i>
                        Mark Report Configuration
                    </h2>
                    <p className="text-sm text-muted mt-1">Configure subjects and exams to generate the report matrix.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="w-full sm:w-48">
                        <SearchSelect
                            label=""
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
                </div>
            </div>

            {!filters.classId ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted border-2 border-dashed border-border rounded-xl">
                    <i className="fas fa-hand-pointer text-4xl mb-3 opacity-50"></i>
                    <p>Select a class to configure its report card.</p>
                </div>
            ) : isConfigLoading ? (
                <div className="flex-1 flex items-center justify-center">
                    <i className="fas fa-circle-notch fa-spin text-primary text-3xl"></i>
                </div>
            ) : (
                <div className="flex flex-col space-y-8">

                    {/* INPUT SECTION: EXAMS & SUBJECTS */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* 1. Subjects Configuration Box */}
                        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-foreground uppercase tracking-wider text-sm">Subjects (Rows)</h3>
                                <Button
                                    onClick={() => setSubjects([...subjects, { subjectName: '', subjectCode: '', order: subjects.length }])}
                                    className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-lg hover:bg-primary/20"
                                >
                                    <i className="fas fa-plus mr-1"></i> Add Subject
                                </Button>
                            </div>

                            <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                                {subjects.length === 0 && <p className="text-xs text-muted italic">No subjects added.</p>}
                                {subjects.map((sub, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-mainBg border border-border rounded p-2">
                                        <Input
                                            placeholder="Subject Name"
                                            value={sub.subjectName}
                                            onChange={(e) => {
                                                const newSubs = [...subjects];
                                                newSubs[idx].subjectName = e.target.value;
                                                setSubjects(newSubs);
                                            }}
                                            className="flex-1 text-sm py-1"
                                        />
                                        <Input
                                            placeholder="Code"
                                            value={sub.subjectCode}
                                            onChange={(e) => {
                                                const newSubs = [...subjects];
                                                newSubs[idx].subjectCode = e.target.value;
                                                setSubjects(newSubs);
                                            }}
                                            className="w-20 text-sm py-1"
                                        />
                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] text-muted">Order:</span>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={sub.order ?? 0}
                                                onChange={(e) => {
                                                    const newSubs = [...subjects];
                                                    newSubs[idx].order = handleOrderChange(e.target.value);
                                                    setSubjects(newSubs);
                                                }}
                                                className="w-14 text-sm py-1"
                                            />
                                        </div>
                                        <button onClick={() => setSubjects(subjects.filter((_, i) => i !== idx))} className="text-danger p-1">
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 2. Exams Configuration Box */}
                        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-foreground uppercase tracking-wider text-sm">Exams (Columns)</h3>
                                <Button
                                    onClick={() => setExams([...exams, { examName: '', maxMarks: 100, passingMarks: 35, order: exams.length }])}
                                    className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-lg hover:bg-primary/20"
                                >
                                    <i className="fas fa-plus mr-1"></i> Add Exam
                                </Button>
                            </div>

                            <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                                {exams.length === 0 && <p className="text-xs text-muted italic">No exams added.</p>}
                                {exams.map((exam, idx) => (
                                    <div key={idx} className="flex flex-col gap-2 bg-mainBg border border-border rounded p-2">
                                        <div className="flex items-center gap-2">
                                            <Input
                                                placeholder="Exam Name"
                                                value={exam.examName}
                                                onChange={(e) => {
                                                    const newExams = [...exams];
                                                    newExams[idx].examName = e.target.value;
                                                    setExams(newExams);
                                                }}
                                                className="flex-1 text-sm py-1"
                                            />
                                            <div className="flex items-center gap-1">
                                                <span className="text-[10px] text-muted">Order:</span>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={exam.order ?? 0}
                                                    onChange={(e) => {
                                                        const newExams = [...exams];
                                                        newExams[idx].order = handleOrderChange(e.target.value);
                                                        setExams(newExams);
                                                    }}
                                                    className="w-14 text-sm py-1"
                                                />
                                            </div>
                                            <button onClick={() => setExams(exams.filter((_, i) => i !== idx))} className="text-danger p-1">
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-4 px-1">
                                            <label className="text-[10px] text-muted flex items-center gap-2">
                                                Max Marks:
                                                <Input type="number" min="0" value={exam.maxMarks} onChange={(e) => { const newExams = [...exams]; newExams[idx].maxMarks = handleOrderChange(e.target.value); setExams(newExams); }} className="w-16 h-6 text-xs" />
                                            </label>
                                            <label className="text-[10px] text-muted flex items-center gap-2">
                                                Pass Marks:
                                                <Input type="number" min="0" value={exam.passingMarks} onChange={(e) => { const newExams = [...exams]; newExams[idx].passingMarks = handleOrderChange(e.target.value); setExams(newExams); }} className="w-16 h-6 text-xs" />
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* LIVE MATRIX PREVIEW */}
                    <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
                        <div className="bg-mainBg border-b border-border p-3 flex justify-between items-center">
                            <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                                <i className="fas fa-eye text-primary"></i> Live Matrix Preview
                            </h3>
                            <Button onClick={handleSave} disabled={isCreating || isUpdating} className="px-5 py-1.5 h-auto text-sm shadow-sm shadow-primary/20">
                                {isCreating || isUpdating ? <i className="fas fa-circle-notch fa-spin mr-2"></i> : <i className="fas fa-save mr-2"></i>}
                                {configData?._id ? "Update Configuration" : "Save Configuration"}
                            </Button>
                        </div>

                        <div className="overflow-x-auto p-4">
                            <table className="w-full min-w-max border-collapse">
                                <thead>
                                    <tr>
                                        <th className="p-3 border-b-2 border-border text-left font-bold text-muted uppercase text-xs w-48 bg-surface">
                                            Subjects
                                        </th>
                                        {sortedExams.map((exam, eIdx) => (
                                            <th
                                                key={exam._id?.toString() || eIdx}
                                                className="p-3 border-b-2 border-border text-left font-bold text-foreground text-sm"
                                            >
                                                {/* Left aligned exam header content */}
                                                {exam.examName || `Exam ${eIdx + 1}`}
                                                <div className="text-[10px] text-muted font-normal mt-0.5">
                                                    Max: {exam.maxMarks} | Pass: {exam.passingMarks}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedSubjects.length === 0 ? (
                                        <tr>
                                            <td colSpan={sortedExams.length + 1} className="p-4 text-center text-muted text-sm italic">
                                                Add subjects and exams above to see the matrix.
                                            </td>
                                        </tr>
                                    ) : (
                                        // sortedSubjects.map((subject, sIdx) => (
                                        //     <tr key={sIdx} className="hover:bg-mainBg/30 transition-colors">
                                        //         <td className="p-3 border-b border-border font-medium text-foreground text-sm">
                                        //             {subject.subjectName || `Subject ${sIdx + 1}`}
                                        //         </td>
                                        //         {sortedExams.map((_, eIdx) => (
                                        //             <td key={eIdx} className="p-3 border-b border-border text-center">
                                        //                 <div className="w-16 h-8 mx-auto bg-mainBg border border-border/50 rounded flex items-center justify-center">
                                        //                     <span className="text-[10px] text-muted opacity-50">Empty</span>
                                        //                 </div>
                                        //             </td>
                                        //         ))}
                                        //     </tr>
                                        // ))

                                        sortedSubjects.map((subject, sIdx) => (
                                            <tr key={sIdx} className="hover:bg-mainBg/30 transition-colors">
                                                <td className="p-3 border-b border-border font-medium text-foreground text-sm w-48">
                                                    {subject.subjectName || `Subject ${sIdx + 1}`}
                                                </td>
                                                {sortedExams.map((_, eIdx) => (
                                                    /* FIX 1: Changed 'text-center' to 'text-left' 
                                                       This ensures the cell container aligns its content to the left margin.
                                                    */
                                                    <td key={eIdx} className="p-3 border-b border-border text-left">
                                                        {/* FIX 2: Removed 'mx-auto' (which centered the box layout block).
                   FIX 3: Changed 'justify-center' to 'justify-start' and added 'pl-3' 
                   to give the inner content a clean padding buffer from the border.
                */}
                                                        <div className="w-24 h-8 bg-mainBg border border-border/50 rounded flex items-center justify-start pl-3">
                                                            <span className="text-[10px] text-muted opacity-50 font-medium">Empty</span>
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}