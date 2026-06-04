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
import { useRoleCheck } from '../../../hooks/useRoleCheck';

export default function MarkReportConfigMain() {
    const { schoolId } = useAuthData();
    const { data: schoolData } = useGetSchoolById(schoolId!);
    const { isCorrespondent, isAdmin, isPrincipal, isVicePrincipal } = useRoleCheck();


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

    const canModify = isCorrespondent || isAdmin || isPrincipal || isVicePrincipal;


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
                    {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                       
                        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-foreground uppercase tracking-wider text-sm">Subjects (Rows)</h3>
                               {canModify && <Button
                                    onClick={() => setSubjects([...subjects, { subjectName: '', subjectCode: '', order: subjects.length }])}
                                    className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-lg hover:bg-primary/20"
                                >
                                    <i className="fas fa-plus mr-1"></i> Add Subject
                                </Button>}
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
                                       {canModify &&  <button onClick={() => setSubjects(subjects.filter((_, i) => i !== idx))} className="text-danger p-1">
                                            <i className="fas fa-trash"></i>
                                        </button>}
                                    </div>
                                ))}
                            </div>
                        </div>

                       
                        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-foreground uppercase tracking-wider text-sm">Exams (Columns)</h3>
                               {canModify && <Button
                                    // onClick={() => setExams([...exams, { examName: '', maxMarks: 100, passingMarks: 35, order: exams.length }])}
                                    onClick={() => {
                                        // 1. Calculate the next order number based on the highest existing order number
                                        const maxOrder = exams.length > 0
                                            ? Math.max(...exams.map(e => Number(e.order) || 0))
                                            : -1; // Starts at -1 so the first exam added gets 0 (-1 + 1)

                                        const nextOrder = maxOrder + 1;

                                        // 2. Append the new exam structure safely
                                        setExams([
                                            ...exams,
                                            {
                                                examName: '',
                                                maxMarks: 100,
                                                passingMarks: 35,
                                                order: nextOrder // 🌟 Mathematically safe increment
                                            }
                                        ]);
                                    }}
                                    className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-lg hover:bg-primary/20"
                                >
                                    <i className="fas fa-plus mr-1"></i> Add Exam
                                </Button>}
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
                                           {canModify &&  <button onClick={() => setExams(exams.filter((_, i) => i !== idx))} className="text-danger p-1">
                                                <i className="fas fa-trash"></i>
                                            </button>}
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

                    </div> */}


                   
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* =========================================
                            1. SUBJECTS CONFIGURATION BOX
                        ========================================= */}
                        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="font-bold text-foreground uppercase tracking-wider text-sm flex items-center gap-2">
                                    <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                                        <i className="fas fa-book text-primary text-xs"></i>
                                    </div>
                                    Subjects (Rows)
                                </h3>
                                {!!canModify && (
                                    <Button
                                        onClick={() => setSubjects([...subjects, { subjectName: '', subjectCode: '', order: subjects.length }])}
                                        variant="outline"
                                        className="text-xs h-8 px-3 border-primary/20 text-primary hover:bg-primary/5 transition-colors"
                                    >
                                        <i className="fas fa-plus mr-1.5"></i> Add Subject
                                    </Button>
                                )}
                            </div>

                            <div className="space-y-3 max-h-[320px] overflow-y-auto custom-scrollbar pr-2">
                                {subjects.length === 0 && (
                                    <div className="py-8 flex flex-col items-center justify-center border border-dashed border-border rounded-xl bg-background/30 text-muted">
                                        <i className="fas fa-clipboard-list text-2xl mb-2 opacity-50"></i>
                                        <p className="text-xs font-medium">No subjects added.</p>
                                    </div>
                                )}
                                {subjects.map((sub, idx) => (
                                    // 🌟 CRISP UI: Clean surface background with a bold primary stripe on the left
                                    <div key={idx} className="flex items-center gap-3 bg-surface border border-border border-l-[4px] border-l-primary rounded-lg p-2.5 shadow-sm transition-all hover:shadow-md group">
                                        
                                        <Input
                                            placeholder="Subject Name"
                                            value={sub.subjectName}
                                            disabled={!canModify}
                                            onChange={(e) => {
                                                const newSubs = [...subjects];
                                                newSubs[idx].subjectName = e.target.value;
                                                setSubjects(newSubs);
                                            }}
                                            className="flex-1 text-sm bg-background"
                                        />
                                        
                                        <Input
                                            placeholder="Code"
                                            value={sub.subjectCode}
                                            disabled={!canModify}
                                            onChange={(e) => {
                                                const newSubs = [...subjects];
                                                newSubs[idx].subjectCode = e.target.value;
                                                setSubjects(newSubs);
                                            }}
                                            className="w-24 text-sm bg-background"
                                        />
                                        
                                        {/* 🌟 FIXED: Clean, distinct container for the Order input so it doesn't get squished */}
                                        <div className="flex items-center gap-2 bg-background border border-border rounded-md px-2.5 py-1">
                                            <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Order</span>
                                            <input
                                                type="number"
                                                min="0"
                                                value={sub.order ?? 0}
                                                disabled={!canModify}
                                                onChange={(e) => {
                                                    const newSubs = [...subjects];
                                                    newSubs[idx].order = handleOrderChange(e.target.value);
                                                    setSubjects(newSubs);
                                                }}
                                                className="w-8 text-sm text-center bg-transparent outline-none text-foreground font-semibold disabled:opacity-50"
                                            />
                                        </div>

                                        {!!canModify && (
                                            <button 
                                                onClick={() => setSubjects(subjects.filter((_, i) => i !== idx))} 
                                                className="text-danger/40 hover:text-danger w-7 h-7 rounded flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                                                title="Remove Subject"
                                            >
                                                <i className="fas fa-times text-sm"></i>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>


                        {/* =========================================
                            2. EXAMS CONFIGURATION BOX
                        ========================================= */}
                        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="font-bold text-foreground uppercase tracking-wider text-sm flex items-center gap-2">
                                    <div className="w-6 h-6 rounded bg-success/10 flex items-center justify-center">
                                        <i className="fas fa-file-signature text-success text-xs"></i>
                                    </div>
                                    Exams (Columns)
                                </h3>
                                {!!canModify && (
                                    <Button
                                        onClick={() => {
                                            const maxOrder = exams.length > 0 ? Math.max(...exams.map(e => Number(e.order) || 0)) : -1;
                                            setExams([...exams, { examName: '', maxMarks: 100, passingMarks: 35, order: maxOrder + 1 }]);
                                        }}
                                        variant="outline"
                                        className="text-xs h-8 px-3 border-success/20 text-success hover:bg-success/5 transition-colors"
                                    >
                                        <i className="fas fa-plus mr-1.5"></i> Add Exam
                                    </Button>
                                )}
                            </div>

                            <div className="space-y-3 max-h-[320px] overflow-y-auto custom-scrollbar pr-2">
                                {exams.length === 0 && (
                                    <div className="py-8 flex flex-col items-center justify-center border border-dashed border-border rounded-xl bg-background/30 text-muted">
                                        <i className="fas fa-folder-open text-2xl mb-2 opacity-50"></i>
                                        <p className="text-xs font-medium">No exams added.</p>
                                    </div>
                                )}
                                {exams.map((exam, idx) => (
                                    // 🌟 CRISP UI: Clean surface background with a bold success stripe on the left
                                    <div key={idx} className="flex flex-col gap-3 bg-surface border border-border border-l-[4px] border-l-success rounded-lg p-3 shadow-sm transition-all hover:shadow-md group">
                                        
                                        {/* Top Row: Name & Order */}
                                        <div className="flex items-center gap-3">
                                            <Input
                                                placeholder="Exam Name (e.g. Mid Term)"
                                                value={exam.examName}
                                                disabled={!canModify}
                                                onChange={(e) => {
                                                    const newExams = [...exams];
                                                    newExams[idx].examName = e.target.value;
                                                    setExams(newExams);
                                                }}
                                                className="flex-1 text-sm font-medium bg-background"
                                            />
                                            
                                            {/* 🌟 FIXED: Clean Order Box */}
                                            <div className="flex items-center gap-2 bg-background border border-border rounded-md px-2.5 py-1">
                                                <span className="text-[10px] text-muted font-bold uppercase tracking-wider">Order</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={exam.order ?? 0}
                                                    disabled={!canModify}
                                                    onChange={(e) => {
                                                        const newExams = [...exams];
                                                        newExams[idx].order = handleOrderChange(e.target.value);
                                                        setExams(newExams);
                                                    }}
                                                    className="w-8 text-sm text-center bg-transparent outline-none text-foreground font-semibold disabled:opacity-50"
                                                />
                                            </div>

                                            {!!canModify && (
                                                <button 
                                                    onClick={() => setExams(exams.filter((_, i) => i !== idx))} 
                                                    className="text-danger/40 hover:text-danger w-7 h-7 rounded flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Remove Exam"
                                                >
                                                    <i className="fas fa-times text-sm"></i>
                                                </button>
                                            )}
                                        </div>

                                        {/* 🌟 FIXED: Bottom Row - Marks Configuration in a distinct inner box */}
                                        <div className="flex items-center gap-6 px-3 py-2 bg-background/50 rounded border border-border/50">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] text-muted font-bold tracking-wider uppercase">Max Marks</span>
                                                <input 
                                                    type="number" 
                                                    min="0" 
                                                    value={exam.maxMarks} 
                                                    disabled={!canModify}
                                                    onChange={(e) => { 
                                                        const newExams = [...exams]; 
                                                        newExams[idx].maxMarks = handleOrderChange(e.target.value); 
                                                        setExams(newExams); 
                                                    }} 
                                                    className="w-12 text-sm font-bold text-center bg-transparent border-b border-border/50 focus:border-success outline-none pb-0.5 disabled:opacity-50" 
                                                />
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] text-muted font-bold tracking-wider uppercase">Pass Marks</span>
                                                <input 
                                                    type="number" 
                                                    min="0" 
                                                    value={exam.passingMarks} 
                                                    disabled={!canModify}
                                                    onChange={(e) => { 
                                                        const newExams = [...exams]; 
                                                        newExams[idx].passingMarks = handleOrderChange(e.target.value); 
                                                        setExams(newExams); 
                                                    }} 
                                                    className="w-12 text-sm font-bold text-center bg-transparent border-b border-border/50 focus:border-success outline-none pb-0.5 disabled:opacity-50" 
                                                />
                                            </div>
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
                           {canModify &&  <Button onClick={handleSave} disabled={isCreating || isUpdating} className="px-5 py-1.5 h-auto text-sm shadow-sm shadow-primary/20">
                                {isCreating || isUpdating ? <i className="fas fa-circle-notch fa-spin mr-2"></i> : <i className="fas fa-save mr-2"></i>}
                                {configData?._id ? "Update Configuration" : "Save Configuration"}
                            </Button>}
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