// import React, { useState, useEffect, useMemo } from 'react';
// import { Button } from '../../shared/ui/Button'; // Adjust path
// import { Input } from '../../shared/ui/Input'; // Adjust path
// import { SearchSelect } from '../../shared/ui/SearchSelect'; // Adjust path
// import { Toggle } from '../../shared/ui/Toggle'; // Adjust path


// interface IMarkSubject {
//     _id?: string;
//     subject: string;
//     marksObtained: number;
//     maxMarks: number;
//     minPassingMarks: number;
//     grade?: string;
// }

// interface MarkReportSingleProps {
//     mode: 'view' | 'edit' | 'create';
//     initialData?: any;
//     onSubmit: (data: any) => void;
//     isSubmitting: boolean;
//     isEditable: boolean;
//     onEdit: () => void;
//     onCancel: () => void;
// }

// export default function MarkReportSingle({
//     mode,
//     initialData,
//     onSubmit,
//     isSubmitting,
//     isEditable,
//     onEdit,
//     onCancel
// }: MarkReportSingleProps) {
//     // --- Form State ---
//     const [formData, setFormData] = useState({
//         academicYear: '',
//         classId: '',
//         sectionId: '',
//         studentId: '',
//         remarks: '',
//         isAbsent: false,
//     });

//     const [subjects, setSubjects] = useState<IMarkSubject[]>([]);

//     // --- Populate State on Mount or InitialData Change ---
//     useEffect(() => {
//         if (initialData && mode !== 'create') {
//             setFormData({
//                 academicYear: initialData.academicYear || '',
//                 classId: initialData.classId?._id || '',
//                 sectionId: initialData.sectionId?._id || '',
//                 studentId: initialData.studentId?._id || '',
//                 remarks: initialData.remarks || '',
//                 isAbsent: initialData.isAbsent || false,
//             });
//             setSubjects(initialData.subjects || []);
//         } else if (mode === 'create') {
//             // Default empty subject row for quick start
//             setSubjects([{ subject: '', marksObtained: 0, maxMarks: 100, minPassingMarks: 35, grade: '' }]);
//         }
//     }, [initialData, mode]);

//     // --- Subject Array Handlers ---
//     const handleAddSubject = () => {
//         setSubjects([...subjects, { subject: '', marksObtained: 0, maxMarks: 100, minPassingMarks: 35, grade: '' }]);
//     };

//     const handleRemoveSubject = (index: number) => {
//         setSubjects(subjects.filter((_, i) => i !== index));
//     };

//     const handleSubjectChange = (index: number, field: keyof IMarkSubject, value: any) => {
//         const newSubjects = [...subjects];
//         newSubjects[index] = { ...newSubjects[index], [field]: value };
//         setSubjects(newSubjects);
//     };

//     // --- Submit Handler ---
//     const handleFormSubmit = (e: React.FormEvent) => {
//         e.preventDefault();
//         onSubmit({ ...formData, subjects });
//     };

//     // --- Derived Calculations ---
//     const summary = useMemo(() => {
//         let obtained = 0;
//         let totalMax = 0;
//         let isFailed = false;

//         subjects.forEach(sub => {
//             obtained += Number(sub.marksObtained) || 0;
//             totalMax += Number(sub.maxMarks) || 0;
//             if (Number(sub.marksObtained) < Number(sub.minPassingMarks)) {
//                 isFailed = true;
//             }
//         });

//         const percentage = totalMax > 0 ? ((obtained / totalMax) * 100).toFixed(2) : '0.00';
//         return { obtained, totalMax, percentage, status: isFailed ? 'FAIL' : 'PASS' };
//     }, [subjects]);

//     // --- Mock Data Options (Replace with your actual React Query hooks) ---
//     // const { data: classes } = useGetClasses();
//     const mockOptions = [{ label: 'Loading from API...', value: 'mock' }]; 
//     const isViewMode = mode === 'view';

//     return (
//         <div className="w-full h-full flex flex-col bg-mainBg overflow-y-auto custom-scrollbar animate-in fade-in duration-300">
//             <form onSubmit={handleFormSubmit} className="max-w-6xl w-full mx-auto p-4 md:p-6 space-y-6">
                
//                 {/* --- HEADER --- */}
//                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//                     <div>
//                         <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
//                             <i className={`fas ${isViewMode ? 'fa-file-certificate text-primary' : 'fa-edit text-warning'}`}></i>
//                             {isViewMode ? 'Academic Mark Report' : mode === 'edit' ? 'Edit Mark Report' : 'Create Mark Report'}
//                         </h2>
//                         {isViewMode && initialData?.recordedBy && (
//                             <p className="text-xs text-muted mt-1">
//                                 Recorded by: <span className="font-medium text-foreground">{initialData.recordedBy.userName}</span>
//                             </p>
//                         )}
//                     </div>
                    
//                     {/* Action Buttons */}
//                     <div className="flex items-center gap-3">
//                         <Button type="button" variant="outline" onClick={onCancel}>
//                             {isViewMode ? 'Go Back' : 'Cancel'}
//                         </Button>
//                         {isViewMode && isEditable && (
//                             <Button type="button" variant="primary" onClick={onEdit} leftIcon="fas fa-pen">
//                                 Edit Report
//                             </Button>
//                         )}
//                         {!isViewMode && (
//                             <Button type="submit" variant="primary" isLoading={isSubmitting} leftIcon="fas fa-save">
//                                 Save Report
//                             </Button>
//                         )}
//                     </div>
//                 </div>

//                 {/* --- WARNING BANNER (If Absent) --- */}
//                 {(formData.isAbsent || (isViewMode && initialData?.isAbsent)) && (
//                     <div className="bg-danger/10 border border-danger/20 text-danger px-5 py-4 rounded-xl flex items-center gap-3">
//                         <i className="fas fa-user-times text-xl"></i>
//                         <div>
//                             <p className="font-bold text-sm">Student Marked Absent</p>
//                             <p className="text-xs mt-0.5 opacity-80">This student was absent during this evaluation period. Marks will not be calculated towards final aggregates.</p>
//                         </div>
//                     </div>
//                 )}

//                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
//                     {/* --- LEFT COLUMN: Meta Data --- */}
//                     <div className="lg:col-span-1 space-y-6">
//                         <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-5">
//                             <h3 className="text-sm font-bold text-foreground uppercase tracking-wider border-b border-border pb-3">Student Details</h3>
                            
//                             {isViewMode ? (
//                                 <div className="space-y-4">
//                                     <div className="flex items-center gap-4">
//                                         <div className="w-14 h-14 rounded-full bg-primary-soft text-primary flex items-center justify-center font-bold text-xl border border-primary/20">
//                                             {initialData?.studentId?.studentName?.charAt(0) || 'S'}
//                                         </div>
//                                         <div>
//                                             <p className="font-bold text-foreground text-lg">{initialData?.studentId?.studentName || 'N/A'}</p>
//                                             <p className="text-xs font-semibold text-muted">SR ID: {initialData?.studentId?.srId || 'N/A'}</p>
//                                         </div>
//                                     </div>
//                                     <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
//                                         <div>
//                                             <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Class</p>
//                                             <p className="text-sm font-semibold text-foreground mt-0.5">{initialData?.classId?.name || 'N/A'}</p>
//                                         </div>
//                                         <div>
//                                             <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Section</p>
//                                             <p className="text-sm font-semibold text-foreground mt-0.5">{initialData?.sectionId?.name || 'N/A'}</p>
//                                         </div>
//                                         <div className="col-span-2">
//                                             <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Academic Year</p>
//                                             <p className="text-sm font-semibold text-foreground mt-0.5">{initialData?.academicYear || 'N/A'}</p>
//                                         </div>
//                                     </div>
//                                 </div>
//                             ) : (
//                                 <div className="space-y-4">
//                                     <Input 
//                                         id="academicYear" label="Academic Year" placeholder="e.g. 2025-2026"
//                                         value={formData.academicYear} 
//                                         onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })} 
//                                     />
//                                     <SearchSelect 
//                                         label="Select Class" options={mockOptions} // Replace with actual class options
//                                         value={formData.classId} onChange={(opt) => setFormData({ ...formData, classId: String(opt.value) })}
//                                     />
//                                     <SearchSelect 
//                                         label="Select Section" options={mockOptions} // Replace with actual section options
//                                         value={formData.sectionId} onChange={(opt) => setFormData({ ...formData, sectionId: String(opt.value) })}
//                                     />
//                                     <SearchSelect 
//                                         label="Select Student" options={mockOptions} // Replace with actual student options
//                                         value={formData.studentId} onChange={(opt) => setFormData({ ...formData, studentId: String(opt.value) })}
//                                     />
                                    
//                                     <div className="pt-4 border-t border-border">
//                                         <Toggle 
//                                             checked={formData.isAbsent} 
//                                             onChange={(val) => setFormData({ ...formData, isAbsent: val })}
//                                             label="Mark as Absent"
//                                             description="Student did not attend this evaluation."
//                                         />
//                                     </div>
//                                 </div>
//                             )}
//                         </div>

//                         {/* Summary Widget (View Mode) */}
//                         {isViewMode && !formData.isAbsent && (
//                             <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm">
//                                 <h3 className="text-sm font-bold text-foreground uppercase tracking-wider border-b border-border pb-3 mb-4">Performance Summary</h3>
//                                 <div className="grid grid-cols-2 gap-4">
//                                     <div>
//                                         <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Total Score</p>
//                                         <p className="text-xl font-black text-foreground mt-1">{summary.obtained} <span className="text-sm text-muted">/ {summary.totalMax}</span></p>
//                                     </div>
//                                     <div>
//                                         <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Percentage</p>
//                                         <p className="text-xl font-black text-primary mt-1">{summary.percentage}%</p>
//                                     </div>
//                                     <div className="col-span-2 mt-2">
//                                         <p className="text-[10px] text-muted font-bold uppercase tracking-wider mb-2">Final Status</p>
//                                         <span className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-widest border flex items-center justify-center gap-2 ${
//                                             summary.status === 'FAIL' ? 'bg-danger/10 text-danger border-danger/20' : 'bg-success/10 text-success border-success/20'
//                                         }`}>
//                                             <i className={`fas ${summary.status === 'FAIL' ? 'fa-times-circle' : 'fa-check-circle'}`}></i>
//                                             {summary.status}
//                                         </span>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}
//                     </div>

//                     {/* --- RIGHT COLUMN: Subjects & Remarks --- */}
//                     <div className="lg:col-span-2 space-y-6">
                        
//                         {/* Subjects Grid */}
//                         <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
//                             <div className="p-5 border-b border-border bg-sub-header/50 flex justify-between items-center">
//                                 <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Subject Evaluations</h3>
//                                 {!isViewMode && (
//                                     <Button type="button" variant="outline" onClick={handleAddSubject} className="text-xs py-1.5 px-3">
//                                         <i className="fas fa-plus mr-1.5"></i> Add Subject
//                                     </Button>
//                                 )}
//                             </div>
                            
//                             <div className="overflow-x-auto custom-scrollbar p-1">
//                                 <table className="w-full text-left border-collapse min-w-[40rem]">
//                                     <thead>
//                                         <tr className="text-[11px] font-bold text-muted uppercase tracking-wider border-b border-border">
//                                             <th className="p-4 w-1/3">Subject Name</th>
//                                             <th className="p-4 w-24 text-center">Marks</th>
//                                             <th className="p-4 w-24 text-center">Passing</th>
//                                             <th className="p-4 w-24 text-center">Max</th>
//                                             <th className="p-4 w-24 text-center">Grade</th>
//                                             {!isViewMode && <th className="p-4 w-16 text-center">Act</th>}
//                                         </tr>
//                                     </thead>
//                                     <tbody className="divide-y divide-border/50">
//                                         {subjects.length === 0 ? (
//                                             <tr>
//                                                 <td colSpan={isViewMode ? 5 : 6} className="p-8 text-center text-muted text-sm">
//                                                     No subjects added yet.
//                                                 </td>
//                                             </tr>
//                                         ) : subjects.map((sub, idx) => (
//                                             <tr key={idx} className={isViewMode ? "hover:bg-sub-header/30 transition-colors" : ""}>
//                                                 {isViewMode ? (
//                                                     <>
//                                                         <td className="p-4 font-semibold text-foreground">{sub.subject}</td>
//                                                         <td className={`p-4 text-center font-bold ${Number(sub.marksObtained) < Number(sub.minPassingMarks) ? 'text-danger' : 'text-foreground'}`}>
//                                                             {sub.marksObtained}
//                                                         </td>
//                                                         <td className="p-4 text-center text-muted font-medium">{sub.minPassingMarks}</td>
//                                                         <td className="p-4 text-center text-muted font-medium">{sub.maxMarks}</td>
//                                                         <td className="p-4 text-center font-bold text-primary">{sub.grade || '--'}</td>
//                                                     </>
//                                                 ) : (
//                                                     <>
//                                                         <td className="p-2"><Input id={`sub-${idx}`} value={sub.subject} onChange={(e) => handleSubjectChange(idx, 'subject', e.target.value)} required placeholder="e.g. Mathematics" /></td>
//                                                         <td className="p-2"><Input id={`obt-${idx}`} type="number" min="0" value={sub.marksObtained} onChange={(e) => handleSubjectChange(idx, 'marksObtained', e.target.value)} required /></td>
//                                                         <td className="p-2"><Input id={`min-${idx}`} type="number" min="0" value={sub.minPassingMarks} onChange={(e) => handleSubjectChange(idx, 'minPassingMarks', e.target.value)} required /></td>
//                                                         <td className="p-2"><Input id={`max-${idx}`} type="number" min="1" value={sub.maxMarks} onChange={(e) => handleSubjectChange(idx, 'maxMarks', e.target.value)} required /></td>
//                                                         <td className="p-2"><Input id={`grd-${idx}`} value={sub.grade} onChange={(e) => handleSubjectChange(idx, 'grade', e.target.value)} placeholder="A+" /></td>
//                                                         <td className="p-2 text-center">
//                                                             <button type="button" onClick={() => handleRemoveSubject(idx)} className="w-8 h-8 rounded-lg bg-danger/10 text-danger hover:bg-danger hover:text-white transition-colors flex items-center justify-center">
//                                                                 <i className="fas fa-trash-alt text-xs"></i>
//                                                             </button>
//                                                         </td>
//                                                     </>
//                                                 )}
//                                             </tr>
//                                         ))}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         </div>

//                         {/* Remarks Section */}
//                         <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm">
//                             <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 border-b border-border pb-3">Teacher Remarks & Evaluation</h3>
//                             {isViewMode ? (
//                                 <div className="bg-background rounded-xl p-4 border border-border text-sm text-foreground leading-relaxed whitespace-pre-wrap">
//                                     {formData.remarks || <span className="text-muted italic">No remarks provided for this evaluation.</span>}
//                                 </div>
//                             ) : (
//                                 <div>
//                                     <textarea 
//                                         className="w-full bg-background border border-border rounded-xl p-4 text-sm text-foreground focus:ring-2 focus:ring-primary/50 outline-none resize-none custom-scrollbar"
//                                         rows={4}
//                                         placeholder="Enter detailed evaluation remarks, areas of improvement, or general feedback..."
//                                         value={formData.remarks}
//                                         onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
//                                     />
//                                 </div>
//                             )}
//                         </div>

//                     </div>
//                 </div>
//             </form>
//         </div>
//     );
// }



import React, { useState, useEffect } from 'react';
import { Button } from '../../shared/ui/Button'; // Adjust path
import { Input } from '../../shared/ui/Input'; // Adjust path
import { SearchSelect } from '../../shared/ui/SearchSelect'; // Adjust path
import { Toggle } from '../../shared/ui/Toggle'; // Adjust path

export interface IMarkSubject {
    _id?: string;
    subject: string;
    minPassingMarks: number;
    marksObtained?: number; // Legacy fallback
    quarterly?: number | string;
    midTerm?: number | string;
    halfYearly?: number | string;
    annual?: number | string;
}

interface MarkReportSingleProps {
    mode: 'view' | 'edit' | 'create';
    initialData?: any;
    onSubmit: (data: any) => void;
    isSubmitting: boolean;
    isEditable: boolean;
    onEdit: () => void;
    onCancel: () => void;
}

export default function MarkReportSingle({
    mode,
    initialData,
    onSubmit,
    isSubmitting,
    isEditable,
    onEdit,
    onCancel
}: MarkReportSingleProps) {
    // --- Form State ---
    const [formData, setFormData] = useState({
        academicYear: '',
        classId: '',
        sectionId: '',
        studentId: '',
        remarks: '',
        isAbsent: false,
    });

    const [subjects, setSubjects] = useState<IMarkSubject[]>([]);

    // --- Populate State on Mount or InitialData Change ---
    useEffect(() => {
        if (initialData && mode !== 'create') {
            setFormData({
                academicYear: initialData.academicYear || '',
                classId: initialData.classId?._id || '',
                sectionId: initialData.sectionId?._id || '',
                studentId: initialData.studentId?._id || '',
                remarks: initialData.remarks || '',
                isAbsent: initialData.isAbsent || false,
            });
            
            // Map legacy marksObtained to quarterly if new fields don't exist yet
            const mappedSubjects = (initialData.subjects || []).map((sub: any) => ({
                ...sub,
                quarterly: sub.quarterly ?? sub.marksObtained ?? ''
            }));
            setSubjects(mappedSubjects);
            
        } else if (mode === 'create') {
            setSubjects([{ subject: '', minPassingMarks: 35, quarterly: '', midTerm: '', halfYearly: '', annual: '' }]);
        }
    }, [initialData, mode]);

    // --- Subject Array Handlers ---
    const handleAddSubject = () => {
        setSubjects([...subjects, { subject: '', minPassingMarks: 35, quarterly: '', midTerm: '', halfYearly: '', annual: '' }]);
    };

    const handleRemoveSubject = (index: number) => {
        setSubjects(subjects.filter((_, i) => i !== index));
    };

    const handleSubjectChange = (index: number, field: keyof IMarkSubject, value: any) => {
        const newSubjects = [...subjects];
        newSubjects[index] = { ...newSubjects[index], [field]: value };
        setSubjects(newSubjects);
    };

    // --- Submit Handler ---
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Ensure quarterly maps to marksObtained for backend backward compatibility
        const payloadSubjects = subjects.map(sub => ({
            ...sub,
            marksObtained: sub.quarterly // Temporary bridge until backend schema is fully updated
        }));
        onSubmit({ ...formData, subjects: payloadSubjects });
    };

    // --- Mock Data Options (Replace with your actual React Query hooks) ---
    const mockOptions = [{ label: 'Loading from API...', value: 'mock' }]; 
    const isViewMode = mode === 'view';

    return (
        <div className="w-full h-full flex flex-col bg-mainBg overflow-y-auto custom-scrollbar animate-in fade-in duration-300">
            <form onSubmit={handleFormSubmit} className="max-w-6xl w-full mx-auto p-4 md:p-6 space-y-6">
                
                {/* --- HEADER --- */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                            <i className={`fas ${isViewMode ? 'fa-file-certificate text-primary' : 'fa-edit text-warning'}`}></i>
                            {isViewMode ? 'Academic Mark Report' : mode === 'edit' ? 'Edit Mark Report' : 'Create Mark Report'}
                        </h2>
                        {isViewMode && initialData?.recordedBy && (
                            <p className="text-xs text-muted mt-1">
                                Recorded by: <span className="font-medium text-foreground">{initialData.recordedBy.userName}</span>
                            </p>
                        )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        <Button type="button" variant="outline" onClick={onCancel}>
                            {isViewMode ? 'Go Back' : 'Cancel'}
                        </Button>
                        {isViewMode && isEditable && (
                            <Button type="button" variant="primary" onClick={onEdit} leftIcon="fas fa-pen">
                                Edit Report
                            </Button>
                        )}
                        {!isViewMode && (
                            <Button type="submit" variant="primary" isLoading={isSubmitting} leftIcon="fas fa-save">
                                Save Report
                            </Button>
                        )}
                    </div>
                </div>

                {/* --- WARNING BANNER (If Absent) --- */}
                {(formData.isAbsent || (isViewMode && initialData?.isAbsent)) && (
                    <div className="bg-danger/10 border border-danger/20 text-danger px-5 py-4 rounded-xl flex items-center gap-3">
                        <i className="fas fa-user-times text-xl"></i>
                        <div>
                            <p className="font-bold text-sm">Student Marked Absent</p>
                            <p className="text-xs mt-0.5 opacity-80">This student was absent during this evaluation period. Marks will not be calculated towards final aggregates.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* --- LEFT COLUMN: Meta Data --- */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-5">
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider border-b border-border pb-3">Student Details</h3>
                            
                            {isViewMode ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-full bg-primary-soft text-primary flex items-center justify-center font-bold text-xl border border-primary/20">
                                            {initialData?.studentId?.studentName?.charAt(0) || 'S'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground text-lg">{initialData?.studentId?.studentName || 'N/A'}</p>
                                            <p className="text-xs font-semibold text-muted">SR ID: {initialData?.studentId?.srId || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                                        <div>
                                            <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Class</p>
                                            <p className="text-sm font-semibold text-foreground mt-0.5">{initialData?.classId?.name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Section</p>
                                            <p className="text-sm font-semibold text-foreground mt-0.5">{initialData?.sectionId?.name || 'N/A'}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Academic Year</p>
                                            <p className="text-sm font-semibold text-foreground mt-0.5">{initialData?.academicYear || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <Input 
                                        id="academicYear" label="Academic Year" placeholder="e.g. 2025-2026"
                                        value={formData.academicYear} 
                                        onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })} 
                                    />
                                    <SearchSelect 
                                        label="Select Class" options={mockOptions} 
                                        value={formData.classId} onChange={(opt) => setFormData({ ...formData, classId: String(opt.value) })}
                                    />
                                    <SearchSelect 
                                        label="Select Section" options={mockOptions} 
                                        value={formData.sectionId} onChange={(opt) => setFormData({ ...formData, sectionId: String(opt.value) })}
                                    />
                                    <SearchSelect 
                                        label="Select Student" options={mockOptions} 
                                        value={formData.studentId} onChange={(opt) => setFormData({ ...formData, studentId: String(opt.value) })}
                                    />
                                    
                                    <div className="pt-4 border-t border-border">
                                        <Toggle 
                                            checked={formData.isAbsent} 
                                            onChange={(val) => setFormData({ ...formData, isAbsent: val })}
                                            label="Mark as Absent"
                                            description="Student did not attend this evaluation."
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Remarks Section */}
                        <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm">
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 border-b border-border pb-3">Teacher Remarks & Evaluation</h3>
                            {isViewMode ? (
                                <div className="bg-background rounded-xl p-4 border border-border text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                    {formData.remarks || <span className="text-muted italic">No remarks provided for this evaluation.</span>}
                                </div>
                            ) : (
                                <div>
                                    <textarea 
                                        className="w-full bg-background border border-border rounded-xl p-4 text-sm text-foreground focus:ring-2 focus:ring-primary/50 outline-none resize-none custom-scrollbar"
                                        rows={4}
                                        placeholder="Enter detailed evaluation remarks, areas of improvement, or general feedback..."
                                        value={formData.remarks}
                                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- RIGHT COLUMN: Matrix Grid --- */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
                            <div className="p-5 border-b border-border bg-sub-header/50 flex justify-between items-center">
                                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Academic Matrix</h3>
                                {!isViewMode && (
                                    <Button type="button" variant="outline" onClick={handleAddSubject} className="text-xs py-1.5 px-3">
                                        <i className="fas fa-plus mr-1.5"></i> Add Subject
                                    </Button>
                                )}
                            </div>
                            
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse min-w-[40rem]">
                                    <thead>
                                        <tr className="text-[11px] font-bold text-muted uppercase tracking-wider border-b border-border">
                                            <th className="p-4 border-r border-border/50">Subject</th>
                                            {!isViewMode && <th className="p-4 w-20 text-center">Pass Threshold</th>}
                                            <th className="p-4 w-24 text-center">Quarterly</th>
                                            <th className="p-4 w-24 text-center">Mid Term</th>
                                            <th className="p-4 w-24 text-center">Half Yearly</th>
                                            <th className="p-4 w-24 text-center">Annual</th>
                                            {!isViewMode && <th className="p-4 w-16 text-center">Act</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {subjects.length === 0 ? (
                                            <tr>
                                                <td colSpan={isViewMode ? 5 : 7} className="p-8 text-center text-muted text-sm">
                                                    No subjects added yet.
                                                </td>
                                            </tr>
                                        ) : subjects.map((sub, idx) => {
                                            const passThreshold = sub.minPassingMarks || 35;

                                            const getMarkColor = (mark: number | string | undefined) => {
                                                if (mark === null || mark === undefined || mark === '') return 'text-muted/40';
                                                return Number(mark) < passThreshold ? 'text-danger font-bold' : 'text-foreground font-semibold';
                                            };

                                            return (
                                                <tr key={idx} className={isViewMode ? "hover:bg-sub-header/30 transition-colors" : ""}>
                                                    {isViewMode ? (
                                                        <>
                                                            <td className="p-4 font-semibold text-foreground border-r border-border/50">{sub.subject}</td>
                                                            <td className={`p-4 text-center text-base ${getMarkColor(sub.quarterly)}`}>{sub.quarterly || '--'}</td>
                                                            <td className={`p-4 text-center text-base ${getMarkColor(sub.midTerm)}`}>{sub.midTerm || '--'}</td>
                                                            <td className={`p-4 text-center text-base ${getMarkColor(sub.halfYearly)}`}>{sub.halfYearly || '--'}</td>
                                                            <td className={`p-4 text-center text-base ${getMarkColor(sub.annual)}`}>{sub.annual || '--'}</td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td className="p-2 border-r border-border/50"><Input id={`sub-${idx}`} value={sub.subject} onChange={(e) => handleSubjectChange(idx, 'subject', e.target.value)} required placeholder="Subject Name" /></td>
                                                            <td className="p-2"><Input id={`min-${idx}`} type="number" min="0" value={sub.minPassingMarks} onChange={(e) => handleSubjectChange(idx, 'minPassingMarks', Number(e.target.value))} required /></td>
                                                            <td className="p-2"><Input id={`q-${idx}`} type="number" min="0" value={sub.quarterly} onChange={(e) => handleSubjectChange(idx, 'quarterly', e.target.value)} /></td>
                                                            <td className="p-2"><Input id={`m-${idx}`} type="number" min="0" value={sub.midTerm} onChange={(e) => handleSubjectChange(idx, 'midTerm', e.target.value)} /></td>
                                                            <td className="p-2"><Input id={`h-${idx}`} type="number" min="0" value={sub.halfYearly} onChange={(e) => handleSubjectChange(idx, 'halfYearly', e.target.value)} /></td>
                                                            <td className="p-2"><Input id={`a-${idx}`} type="number" min="0" value={sub.annual} onChange={(e) => handleSubjectChange(idx, 'annual', e.target.value)} /></td>
                                                            <td className="p-2 text-center">
                                                                <button type="button" onClick={() => handleRemoveSubject(idx)} className="w-8 h-8 rounded-lg bg-danger/10 text-danger hover:bg-danger hover:text-white transition-colors flex items-center justify-center mx-auto">
                                                                    <i className="fas fa-trash-alt text-xs"></i>
                                                                </button>
                                                            </td>
                                                        </>
                                                    )}
                                                </tr>
                                            );
                                        })}

                                        {/* --- Overall Status Footer Row --- */}
                                        <tr className="bg-sub-header/20 border-t-2 border-border">
                                            <td className="p-4 font-bold text-muted uppercase tracking-wider border-r border-border/50 text-right text-[11px]" colSpan={isViewMode ? 1 : 2}>
                                                Overall Result
                                            </td>
                                            {['quarterly', 'midTerm', 'halfYearly', 'annual'].map((examKey, idx) => {
                                                let hasData = false;
                                                let isFail = false;

                                                subjects.forEach((sub: any) => {
                                                    const passThreshold = sub.minPassingMarks || 35;
                                                    const mark = sub[examKey];
                                                    
                                                    if (mark !== null && mark !== undefined && mark !== '') {
                                                        hasData = true;
                                                        if (Number(mark) < passThreshold) {
                                                            isFail = true;
                                                        }
                                                    }
                                                });

                                                if (!hasData) {
                                                    return <td key={idx} className="p-4 text-center font-medium text-muted/40">--</td>;
                                                }

                                                return (
                                                    <td key={idx} className="p-4 text-center">
                                                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                                                            isFail ? 'bg-danger/10 text-danger border-danger/20' : 'bg-success/10 text-success border-success/20'
                                                        }`}>
                                                            {isFail ? 'Fail' : 'Pass'}
                                                        </span>
                                                    </td>
                                                );
                                            })}
                                            {!isViewMode && <td className="p-4"></td>}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </div>
            </form>
        </div>
    );
}