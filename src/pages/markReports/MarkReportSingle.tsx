import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';
import { SearchSelect } from '../../shared/ui/SearchSelect';
import { SideModal } from '../../shared/ui/SideModal';
import { useAuthData } from '../../hooks/useAuthData';
import { useGetMarkReportConfigByClass } from '../../api_services/markReport_api/markReportConfigApi';
import { useGetClasses } from '../../api_services/schoolConfig_api/classApi';
import { useGetSections } from '../../api_services/schoolConfig_api/sectionApi';
import { useGetAllStudents } from '../../api_services/student_api/studentMainApi';
import { toast } from '../../shared/ui/ToastContext'; // Make sure to import toast for feedback
import { getAcademicYears } from '../../utils/utils';
import { useRoleCheck } from '../../hooks/useRoleCheck';

interface MarkReportSingleProps {
    mode: 'view' | 'edit' | 'create';
    initialData?: any;
    currentAcademicYear: string
    onSubmit: (data: any) => void;
    isSubmitting: boolean;
    isEditable?: boolean; // Kept for interface compatibility but relying on 'mode'
    onEdit?: () => void;
    onCancel: () => void;
}

type MarksDictionary = Record<string, Record<string, number | null>>;

export default function MarkReportSingle({
    mode,
    initialData,
    currentAcademicYear,
    onSubmit,
    isSubmitting,
    isEditable,
    onEdit,
    onCancel
}: MarkReportSingleProps) {
    const { schoolId } = useAuthData();
    const isViewMode = mode === 'view';

    const { isCorrespondent, isAdmin, isTeacher } = useRoleCheck();

    const canModify = isCorrespondent || isAdmin || isTeacher


    const [formData, setFormData] = useState({
        academicYear: currentAcademicYear,
        classId: '',
        sectionId: '',
        studentId: '',
        remarks: '',
        isAbsent: false,
    });

    const [isUnSaved, setIsUnSaved] = useState(false);
    const [marksDict, setMarksDict] = useState<MarksDictionary>({});

    const [cellEditor, setCellEditor] = useState<{
        examName: string;
        subjectName: string;
        maxMarks: number;
        passingMarks: number;
        currentVal: string;
    } | null>(null);

    // ==========================================
    // LIVE API HOOKS & OPTIONS MAPPING
    // ==========================================

    const { data: classesData, isLoading: isClassesLoading } = useGetClasses(schoolId!);
    const classOptions = useMemo(() => {
        return classesData?.map((cls: any) => ({
            label: cls.name || cls.className,
            value: cls._id
        })) || [];
    }, [classesData]);

    const { data: sectionsData, isLoading: isSectionsLoading } = useGetSections({
        schoolId: schoolId!,
        classId: formData.classId
    });

    const sectionOptions = useMemo(() => {
        return sectionsData?.map((sec: any) => ({
            label: sec.name || sec.sectionName,
            value: sec._id
        })) || [];
    }, [sectionsData]);

    const { data: studentsResponse, isLoading: isStudentsLoading } = useGetAllStudents({
        schoolId: schoolId!,
        classId: formData.classId,
        sectionId: formData.sectionId,
        limit: 100
    });

    const studentOptions = useMemo(() => {
        const studentList = studentsResponse?.pages?.flat() || [];
        return studentList.map((stu: any) => ({
            label: stu?.studentName || stu?.name,
            value: stu._id
        }));
    }, [studentsResponse]);

    const { data: configData, isLoading: isConfigLoading } = useGetMarkReportConfigByClass({
        schoolId: schoolId!,
        academicYear: formData.academicYear,
        classId: formData.classId
    });

    const exams = useMemo(() => {
        return [...(configData?.exams || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
    }, [configData]);

    const subjects = useMemo(() => {
        return [...(configData?.subjects || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
    }, [configData]);

    // Helper to get the selected student's name dynamically
    const getStudentName = () => {
        if (initialData?.studentId?.studentName) return initialData.studentId.studentName;
        if (initialData?.studentId?.name) return initialData.studentId.name;
        const selected = studentOptions.find(opt => opt.value === formData.studentId);
        return selected ? selected.label : 'Select a student...';
    };

    // ==========================================
    // DATA HYDRATION (Unpacking)
    // ==========================================
    // ==========================================
    // DATA HYDRATION (Unpacking)
    // ==========================================
    useEffect(() => {
        if (initialData) {
            setFormData({
                academicYear: initialData.academicYear || '',
                classId: initialData.classId?._id || initialData.classId || '',
                sectionId: initialData.sectionId?._id || initialData.sectionId || '',
                studentId: initialData.studentId?._id || initialData.studentId || '',
                remarks: initialData.remarks || '',
                isAbsent: initialData.isAbsent || false,
            });
            setIsUnSaved(false); // 🌟 ADD THIS: Reset dirty flag
        }
    }, [initialData]);

    useEffect(() => {
        // Read directly from the proper examRecords array!
        if (initialData?.examRecords && Array.isArray(initialData.examRecords) && exams.length > 0) {
            const loadedDict: MarksDictionary = {};

            initialData.examRecords.forEach((exam: any) => {
                loadedDict[exam.examName] = {};
                exam.subjects.forEach((sub: any) => {
                    loadedDict[exam.examName][sub.subject] = sub.marksObtained;
                });
            });

            setMarksDict(loadedDict);
            setIsUnSaved(false); // 🌟 ADD THIS: Reset dirty flag
        }
    }, [initialData, exams]);

    // ==========================================
    // HANDLERS
    // ==========================================

    const handleFilterChange = (key: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [key]: value,
            ...(key === 'classId' ? { sectionId: '', studentId: '' } : {}),
            ...(key === 'sectionId' ? { studentId: '' } : {})
        }));
    };

    const openCellEditor = (exam: any, subject: any) => {
        if (isViewMode) return;
        if (formData.isAbsent) {
            toast?.error("Cannot enter marks while the student is marked Absent.");
            return;
        }

        const existingMark = marksDict[exam.examName]?.[subject.subjectName];
        setCellEditor({
            examName: exam.examName,
            subjectName: subject.subjectName,
            maxMarks: exam.maxMarks || 100,
            passingMarks: exam.passingMarks || 35,
            currentVal: existingMark !== undefined && existingMark !== null ? String(existingMark) : ''
        });
    };

    const saveCellMark = () => {
        if (!cellEditor) return;
        setMarksDict(prev => {
            const updated = { ...prev };
            if (!updated[cellEditor.examName]) updated[cellEditor.examName] = {};
            updated[cellEditor.examName][cellEditor.subjectName] =
                cellEditor.currentVal === '' ? null : Number(cellEditor.currentVal);
            return updated;
        });
        setCellEditor(null);
        setIsUnSaved(true); // 🌟 ADD THIS: Mark as dirty when a cell is saved
    };

    // ==========================================
    // DATA SUBMISSION (Packing)
    // ==========================================
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Compile the REAL matrix data (This keeps I Mid Term and II Mid Term safely separated!)
        const compiledExamRecords = exams.map(exam => {
            const examMarks = marksDict[exam.examName] || {};
            return {
                examName: exam.examName,
                isAbsent: false,
                remarks: "",
                subjects: subjects.map(sub => ({
                    subject: sub.subjectName,
                    // Send actual mark, or 0 if empty
                    marksObtained: examMarks[sub.subjectName] !== undefined && examMarks[sub.subjectName] !== null
                        ? examMarks[sub.subjectName]
                        : 0,
                    maxMarks: exam.maxMarks || 100,
                    minPassingMarks: exam.passingMarks || 35,
                }))
            };
        });

        // 2. Compile the legacy subjects array as a "Grand Total" to satisfy backend validation
        const aggregateSubjects = subjects.map(sub => {
            // let totalMarks = 0;
            // let totalMaxMarks = 0;

            let totalMarks: number | null = null;
            let totalMaxMarks: number | null = null;
            let hasEnteredMarks = false;

            // Add up the marks for this subject across ALL exams in the matrix
            exams.forEach(exam => {
                const mark = marksDict[exam.examName]?.[sub.subjectName];
                // if (mark !== undefined && mark !== null) {
                //     totalMarks += Number(mark);
                //     totalMaxMarks += (exam.maxMarks || 100);
                // }

                // Only add it if it's an actual number
                if (typeof mark === 'number' && mark !== undefined && mark !== null) {
                    hasEnteredMarks = true;
                    totalMarks = (totalMarks || 0) + mark;
                    totalMaxMarks = (totalMaxMarks || 0) + (exam.maxMarks || 100);
                }
            });

            return {
                subject: sub.subjectName,
                // marksObtained: totalMarks,     // Shows the sum instead of 0!
                marksObtained: hasEnteredMarks ? totalMarks : null,
                maxMarks: totalMaxMarks || 100,
                minPassingMarks: 35
            };
        });

        // 3. Submit BOTH to the backend!
        onSubmit({
            ...formData,
            markReportConfigId: configData?._id,
            examRecords: compiledExamRecords, // <--- CRITICAL: This was missing! It holds your actual grid.
            subjects: aggregateSubjects          // <--- This passes the validation.
        });
    };

    return (
        <div className="w-full h-full flex flex-col bg-mainBg overflow-hidden animate-in fade-in duration-300 relative">

            {/* --- SIDE MODAL FOR CELL EDITING --- */}
            <SideModal
                isOpen={!!cellEditor}
                onClose={() => setCellEditor(null)}
                title={`${cellEditor?.examName || 'Exam'} Marks`}
                width="w-full sm:w-[400px]"
            >
                {cellEditor && (
                    <div className="space-y-6">
                        <div className="bg-surface border border-border rounded-xl p-4 shadow-sm">
                            <h4 className="text-sm font-bold text-foreground mb-1">{cellEditor.subjectName}</h4>
                            <p className="text-xs text-muted mb-4">Enter the marks obtained by the student for this specific evaluation.</p>

                            <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">
                                Marks Obtained
                            </label>
                            <Input
                                autoFocus
                                type="number"
                                min="0"

                                max={cellEditor.maxMarks}
                                value={cellEditor.currentVal}
                                // onChange={(e) => setCellEditor({ ...cellEditor, currentVal: e.target.value })}
                                onChange={(e) => {
                                    const enteredVal = e.target.value;
                                    const maxLimit = Number(cellEditor.maxMarks);

                                    // 🌟 Allow empty input so users can hit backspace completely
                                    if (enteredVal === '') {
                                        setCellEditor({ ...cellEditor, currentVal: '' });
                                        return;
                                    }

                                    // Convert input to a numeric representation for evaluation
                                    const numericVal = Number(enteredVal);

                                    // 🌟 Enforce bounds check: Don't allow negative numbers or values exceeding maxMarks
                                    if (numericVal >= 0 && numericVal <= maxLimit) {
                                        setCellEditor({ ...cellEditor, currentVal: enteredVal });
                                    }
                                }}
                                placeholder={`Max: ${cellEditor.maxMarks}`}
                                className="text-lg py-3 font-bold"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        saveCellMark();
                                    }
                                }}
                            />

                            <div className="flex justify-between items-center text-[11px] text-muted mt-3 bg-mainBg p-3 rounded-lg border border-border">
                                <span>Max Marks: <strong className="text-foreground">{cellEditor.maxMarks}</strong></span>
                                <span>Pass Threshold: <strong className="text-warning">{cellEditor.passingMarks}</strong></span>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-border">
                            <Button variant="outline" onClick={() => setCellEditor(null)}>Cancel</Button>
                            <Button variant="primary" onClick={saveCellMark}>Update Mark</Button>
                        </div>
                    </div>
                )}
            </SideModal>

            <form onSubmit={handleFormSubmit} className="flex flex-col h-full w-full">

                {/* --- TOP HEADER & GLOBAL ACTIONS --- */}
                <div className="border-b border-border bg-surface shrink-0 z-10 shadow-sm">
                    <div className="p-4 md:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-     foreground flex items-center gap-3">
                                <i className={`fas ${isViewMode ? 'fa-file-certificate text-primary' : 'fa-edit text-primary'}`}></i>
                                {isViewMode ? 'Academic Mark Report' : mode === 'edit' ? 'Edit Mark Report' : 'Student Marking Panel'}
                            </h2>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* 🌟 ADD THIS: Static text indicator for unsaved changes */}
                            {isUnSaved && !isViewMode && (
                                <span className="text-xs font-bold text-warning px-2 tracking-wide">
                                    Unsaved Changes *
                                </span>
                            )}
                            <Button type="button" variant="outline" onClick={onCancel}>
                                {isViewMode ? 'Go Back' : 'Cancel'}
                            </Button>
                            {isViewMode && isEditable && onEdit && (
                                <Button type="button" variant="primary" onClick={onEdit} leftIcon="fas fa-pen">
                                    Edit Report
                                </Button>
                            )}
                            {(canModify && !isViewMode && formData.studentId) && (
                                <Button type="submit" variant="primary" isLoading={isSubmitting} leftIcon="fas fa-save">
                                    Save Report
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* CREATE MODE: Dropdown Filters */}
                    {mode === 'create' && (
                        <div className="bg-mainBg border-t border-border p-4 md:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* <Input
                                id="academicYear" label="Academic Year" placeholder="e.g. 2025-2026"
                                value={formData.academicYear}
                                onChange={(e) => handleFilterChange('academicYear', e.target.value)}
                            /> */}

                            <SearchSelect
                                label="Academic Years" // Removed label to keep the top bar clean like a search input
                                options={getAcademicYears()}
                                value={formData.academicYear}
                                onChange={(opt) => handleFilterChange('academicYear', String(opt.value))}
                                placeholder="Academic Year..."
                            />
                            <SearchSelect
                                label="Class" options={classOptions}
                                placeholder={isClassesLoading ? "Loading..." : "Select Class..."}
                                value={formData.classId} onChange={(opt) => handleFilterChange('classId', String(opt.value))}
                            />
                            <SearchSelect
                                label="Section" options={sectionOptions}
                                placeholder={isSectionsLoading ? "Loading..." : "Select Section..."}
                                value={formData.sectionId} onChange={(opt) => handleFilterChange('sectionId', String(opt.value))}
                            />
                            <SearchSelect
                                label="Student" options={studentOptions}
                                placeholder={isStudentsLoading ? "Loading..." : "Select Student..."}
                                value={formData.studentId} onChange={(opt) => handleFilterChange('studentId', String(opt.value))}
                            />
                        </div>
                    )}
                </div>

                {/* --- MAIN WORKSPACE --- */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 bg-mainBg">

                    {!formData.studentId ? (
                        <div className="h-full w-full flex flex-col items-center justify-center text-muted border-2 border-dashed border-border rounded-2xl">
                            <i className="fas fa-user-graduate text-5xl mb-4 opacity-50"></i>
                            <h3 className="text-lg font-bold text-foreground">No Student Selected</h3>
                            <p className="text-sm mt-1">Please select a class, section, and student from the header to begin.</p>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300 max-w-7xl mx-auto">

                            {/* COMPACT INFORMATION ROW */}
                            <div className="bg-surface border border-border rounded-xl p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div className="flex flex-wrap items-center gap-6 md:gap-8">
                                    <div>
                                        <p className="text-[10px] text-muted font-bold uppercase tracking-wider mb-0.5">Academic Year</p>
                                        <p className="text-sm font-semibold text-foreground">{formData.academicYear || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted font-bold uppercase tracking-wider mb-0.5">Student Name</p>
                                        <p className="text-sm font-bold text-primary">{getStudentName()}</p>
                                    </div>
                                    {/* <div className="border-l border-border pl-6 md:pl-8">
                                        <Toggle
                                            checked={formData.isAbsent}
                                            onChange={(val) => setFormData({ ...formData, isAbsent: val })}
                                            label="Mark Absent"
                                            disabled={isViewMode}
                                            // 1. Track: Add a border and ensure it doesn't wash out
                                            className="border border-border bg-sub-header peer-checked:bg-primary"

                                            // 2. Thumb: Add a border to make the circle pop against the background
                                            thumbClassName="border border-border"
                                        />
                                    </div> */}
                                </div>
                                {/* <div className="flex-1 w-full lg:max-w-md">
                                    <Input
                                        placeholder="Overall teacher remarks..."
                                        value={formData.remarks}
                                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                        disabled={isViewMode}
                                        className="bg-mainBg w-full"
                                    />
                                </div> */}
                            </div>

                            {/* THE MARKING MATRIX */}
                            <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
                                <div className="overflow-x-auto custom-scrollbar">
                                    {isConfigLoading ? (
                                        <div className="p-12 flex items-center justify-center">
                                            <i className="fas fa-circle-notch fa-spin text-primary text-3xl"></i>
                                        </div>
                                    ) : !configData || subjects.length === 0 ? (
                                        <div className="p-12 text-center text-danger">
                                            <i className="fas fa-exclamation-triangle text-3xl mb-3 opacity-50"></i>
                                            <p className="font-bold">Missing Configuration</p>
                                            <p className="text-sm opacity-80 mt-1">The report card template for this class has not been configured.</p>
                                        </div>
                                    ) : (
                                        <table className="w-full text-left border-collapse min-w-max">
                                            <thead>
                                                <tr className="text-[11px] font-bold text-muted uppercase tracking-wider border-b-2 border-border bg-mainBg">
                                                    <th className="p-4 border-r border-border/50 sticky left-0 z-10 bg-mainBg shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] w-64">
                                                        Subjects
                                                    </th>
                                                    {exams.map((exam, eIdx) => (
                                                        <th key={eIdx} className="p-4 border-r border-border/50 text-center min-w-[140px]">
                                                            <div className="font-bold text-foreground text-sm">{exam.examName}</div>
                                                            <div className="text-[10px] mt-1 font-normal opacity-70">
                                                                Max {exam.maxMarks} • Pass {exam.passingMarks}
                                                            </div>
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/50">
                                                {subjects.map((sub, sIdx) => (
                                                    <tr key={sIdx} className="hover:bg-sub-header/30 transition-colors group">
                                                        <td className="p-4 font-semibold text-foreground border-r border-border/50 sticky left-0 z-10 bg-surface group-hover:bg-sub-header/50 transition-colors shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                                            {sub.subjectName}
                                                            {sub.subjectCode && <span className="block text-[10px] text-muted font-normal mt-0.5">{sub.subjectCode}</span>}
                                                        </td>

                                                        {exams.map((exam, eIdx) => {
                                                            const mark = marksDict[exam.examName]?.[sub.subjectName];
                                                            const hasMark = mark !== undefined && mark !== null;
                                                            const isFail = hasMark && Number(mark) < (exam?.passingMarks || 35);

                                                            return (
                                                                <td
                                                                    key={eIdx}
                                                                    className={`p-3 border-r border-border/50 transition-colors ${formData.isAbsent || isViewMode
                                                                        ? 'bg-mainBg/30'
                                                                        : 'cursor-pointer hover:bg-primary/5'
                                                                        }`}
                                                                    onClick={() => openCellEditor(exam, sub)}
                                                                >
                                                                    {hasMark ? (
                                                                        <div className="flex flex-col items-center justify-center">
                                                                            <span className={`font-bold text-lg ${isFail ? 'text-danger' : 'text-foreground'}`}>
                                                                                {mark}
                                                                            </span>
                                                                            {/* {isFail && <span className="text-[9px] text-danger uppercase tracking-wider mt-0.5 font-bold">Fail</span>} */}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="w-full max-w-[80px] h-9 mx-auto bg-mainBg border border-border/50 border-dashed rounded flex items-center justify-center group-hover:border-primary/50 group-hover:bg-primary/5 transition-colors">
                                                                            <span className="text-[10px] text-muted opacity-50 group-hover:text-primary group-hover:opacity-100">Empty</span>
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
}