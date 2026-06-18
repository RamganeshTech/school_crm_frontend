import  { useState } from 'react';
import { useGetClassFeeDues } from '../../api_services/financeApi/financeApi';
import { SearchSelect } from '../../shared/ui/SearchSelect';
import { useGetAllClassesWithSections, type ClassWithSections } from '../../api_services/teacher_api/teacherApi';

// Helper to format currency beautifully (e.g., ₹ 50,000)
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
};

export default function ClassFeeDuesAnalytics({ schoolId, academicYear }: { schoolId: string, academicYear: string }) {
    // --- Local State for Filters ---
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [selectedSectionId, setSelectedSectionId] = useState<string>('');

    // --- Queries ---
    const { data: classesData } = useGetAllClassesWithSections({ schoolId });
    const classes: ClassWithSections[] = classesData || [];
    const selectedClass = classes.find(c => c._id === selectedClassId);

    // Fetch Dues Data
    const { data: classDues, isLoading, isError } = useGetClassFeeDues({
        schoolId,
        academicYear,
        classId: selectedClassId || undefined,
        sectionId: selectedSectionId || undefined
    });

    if (isLoading) {
        return (
            <div className="w-full h-64 flex flex-col items-center justify-center text-muted animate-pulse border border-border rounded-xl bg-surface">
                <i className="fas fa-spinner fa-spin text-2xl mb-3 text-primary"></i>
                <p className="text-sm font-bold tracking-wider uppercase">Loading Financial Data...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="w-full p-6 flex flex-col items-center justify-center text-danger border border-danger/30 bg-danger/5 rounded-xl">
                <i className="fas fa-exclamation-triangle text-3xl mb-2"></i>
                <h3 className="text-lg font-bold">Failed to load fee dues</h3>
                <p className="text-sm opacity-80">Please check your connection or permissions.</p>
            </div>
        );
    }

    const totalSchoolPending = classDues?.reduce((acc: number, curr: any) => acc + (curr.classTotalDue || 0), 0) || 0;

    return (
        <div className="flex flex-col gap-6 w-full animate-in fade-in">

            {/* --- PREMIUM HEADER & FILTER PANEL --- */}
            <div className="bg-surface border border-border rounded-xl p-5 shadow-sm flex flex-col gap-5">

                {/* Top Row: Title & Total */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                            <i className="fas fa-users-slash text-danger"></i>
                            Student Defaulter Analytics
                        </h2>
                        <p className="text-sm text-muted mt-1">Class-wise breakdown of specific student dues.</p>
                    </div>
                    <div className="text-left md:text-right">
                        <p className="text-[10px] font-bold text-muted uppercase tracking-wider mb-0.5">Total Outstanding</p>
                        <p className="text-2xl md:text-3xl font-bold text-danger">{formatCurrency(totalSchoolPending)}</p>
                    </div>
                </div>

                {/* Bottom Row: Dynamic Filters */}
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border">
                    <span className="text-sm font-bold text-muted mr-2"><i className="fas fa-filter mr-1"></i> Filter:</span>

                    {/* Class Dropdown */}
                    <div className="w-[140px] md:w-[180px]">
                        <SearchSelect
                            label=""
                            placeholder="All Classes"
                            options={[{ label: "All Classes", value: "" }, ...classes.map(c => ({ label: c.name, value: c._id }))]}
                            value={selectedClassId}
                            onChange={(opt: any) => {
                                setSelectedClassId(opt?.value || '');
                                setSelectedSectionId('');
                            }}
                        />
                    </div>

                    {/* Section Dropdown */}
                    {selectedClass?.hasSections && selectedClass.sections && selectedClass.sections.length > 0 && (
                        <div className="w-[140px] md:w-[180px] animate-in fade-in slide-in-from-left-2">
                            <SearchSelect
                                label=""
                                placeholder="All Sections"
                                options={[{ label: "All Sections", value: "" }, ...selectedClass.sections.map((s: any) => ({ label: s.name, value: s._id }))]}
                                value={selectedSectionId}
                                onChange={(opt: any) => setSelectedSectionId(opt?.value || '')}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* --- STUDENT LIST GRIDS --- */}
            {!classDues || classDues.length === 0 ? (
                <div className="w-full py-12 flex flex-col items-center justify-center text-muted border border-border rounded-xl bg-surface shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
                        <i className="fas fa-check-double text-2xl text-success"></i>
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Zero Pending Dues!</h3>
                    <p className="text-sm">No pending dues found for the selected criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    {classDues.map((group: any, index: number) => {
                        const displayClassName = group.className || 'Unknown Class';
                        const displaySection = group.sectionName ? ` - Section ${group.sectionName}` : '';
                        // const studentsCount = group.students?.length || 0;
                        const studentsCount = group.students?.filter((s: any) => s?.totalDue > 0).length || 0;

                        return (
                            <div key={index} className="bg-surface border border-border rounded-xl flex flex-col overflow-hidden shadow-sm hover:shadow transition-shadow duration-200">

                                {/* 🌟 CLEAN Header */}
                                <div className="px-5 py-3.5 border-b border-border flex justify-between items-center bg-background/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                                            <i className="fas fa-layer-group text-sm"></i>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-foreground">
                                                {displayClassName}{displaySection}
                                            </h3>
                                            <p className="text-[11px] text-muted font-medium mt-0.5">{studentsCount} Defaulter{studentsCount !== 1 ? 's' : ''}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-muted tracking-wider mb-0.5">Group Total</p>
                                        <p className="text-base font-bold text-danger">{formatCurrency(group.classTotalDue)}</p>
                                    </div>
                                </div>

                                {/* 🌟 CLEAN Student List */}
                                <div className="flex-1 bg-surface max-h-[300px] overflow-y-auto custom-scrollbar">
                                    <div className="flex flex-col">
                                        {/* {group.students?.map((student: any, idx: number) => ( */}
                                        {/* { */}
                                        {studentsCount === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-12 text-muted opacity-70">
                                                <i className="fas fa-check-circle text-3xl text-success mb-3"></i>
                                                <p className="text-sm font-bold text-foreground">No Pending Dues</p>
                                                <p className="text-xs mt-1">All students in this group have cleared their fees.</p>
                                            </div>
                                        ) : (
                                        group.students?.filter((student: any) => student.totalDue > 0).map((student: any, idx: number) => (
                                            <div
                                                key={idx}
                                                // Added border-b for separation, removed padding bloat
                                                className="flex items-center justify-between px-5 py-3 border-b border-border/50 last:border-b-0 hover:bg-background/50 transition-colors"
                                            >

                                                {/* Student Info */}
                                                <div className="flex items-center gap-3">
                                                    <div className="w-7 h-7 rounded-full bg-border flex items-center justify-center text-muted font-bold text-xs shrink-0">
                                                        {student.studentName?.charAt(0).toUpperCase() || 'U'}
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <p className="text-sm font-bold text-foreground truncate">
                                                            {student.studentName || 'Unknown Student'}
                                                        </p>
                                                        <p className="text-[11px] font-medium text-muted mt-0.5 truncate">
                                                            Roll: <span className="text-foreground">{student.rollNumber || 'N/A'}</span>
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Student Due Amount & Action */}
                                                <div className="flex items-center gap-4 shrink-0 pl-3">
                                                    <p className="text-sm font-bold text-danger">
                                                        {formatCurrency(student.totalDue)}
                                                    </p>
                                                    {/* <button 
                                                        className="w-7 h-7 rounded-full flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
                                                        title={`Notify ${student.studentName}`}
                                                    >
                                                        <i className="fas fa-bell text-xs"></i>
                                                    </button> */}
                                                </div>

                                            </div>
                                        ))
                                        )
                                    }
                                    </div>
                                </div>

                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}