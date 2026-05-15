import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthData } from '../../hooks/useAuthData';
import { useGetClasses } from '../../api_services/schoolConfig_api/classApi';
import { useGetFeeStructureByClass, useSetFeeStructure } from '../../api_services/feeStructure_api/feeStructureApi';
import { toast } from '../../shared/ui/ToastContext';
import { Input, Label } from '../../shared/ui/Input';
import { Button } from '../../shared/ui/Button';

export default function FeeStructureSingle() {
    const { classId } = useParams();
    const navigate = useNavigate();
    const { schoolId } = useAuthData();

    // --- Queries ---
    const { data: classesData } = useGetClasses(schoolId!);
    const { data: feeStructures, isLoading } = useGetFeeStructureByClass(schoolId!, classId);
    const setFeeMutation = useSetFeeStructure();

    // --- Class Name Helper ---
    const className = useMemo(() => {
        return classesData?.find((c: any) => c._id === classId)?.name || 'Unknown Class';
    }, [classesData, classId]);

    // --- UI State ---
    // Toggle between editing New Student vs Old Student fees
    const [activeTab, setActiveTab] = useState<'new' | 'old'>('new');

    const [feeData, setFeeData] = useState({
        admissionFee: '',
        firstTermAmt: '',
        secondTermAmt: '',
        busFirstTermAmt: '',
        busSecondTermAmt: ''
    });

    // --- Sync Data when switching tabs or loading ---
    useEffect(() => {
        if (feeStructures) {
            const targetData = feeStructures.find((f: any) => f.type === activeTab);
            if (targetData && targetData.feeHead) {
                setFeeData({
                    admissionFee: targetData.feeHead.admissionFee?.toString() || '',
                    firstTermAmt: targetData.feeHead.firstTermAmt?.toString() || '',
                    secondTermAmt: targetData.feeHead.secondTermAmt?.toString() || '',
                    busFirstTermAmt: targetData.feeHead.busFirstTermAmt?.toString() || '',
                    busSecondTermAmt: targetData.feeHead.busSecondTermAmt?.toString() || ''
                });
            } else {
                // Reset if no data exists for this type yet
                setFeeData({ admissionFee: '', firstTermAmt: '', secondTermAmt: '', busFirstTermAmt: '', busSecondTermAmt: '' });
            }
        }
    }, [feeStructures, activeTab]);

    // --- Handlers ---
    const handleInputChange = (field: string, value: string) => {
        // Only allow numbers
        if (value === '' || /^\d+$/.test(value)) {
            setFeeData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await setFeeMutation.mutateAsync({
                schoolId: schoolId!,
                classId: classId!,
                type: activeTab,
                feeHead: {
                    admissionFee: Number(feeData.admissionFee) || 0,
                    firstTermAmt: Number(feeData.firstTermAmt) || 0,
                    secondTermAmt: Number(feeData.secondTermAmt) || 0,
                    busFirstTermAmt: Number(feeData.busFirstTermAmt) || 0,
                    busSecondTermAmt: Number(feeData.busSecondTermAmt) || 0
                }
            });
            toast.success(`Fee structure for ${activeTab.toUpperCase()} students saved!`);
        } catch (error: any) {
            toast.error(error.message || "Failed to save fee structure");
        }
    };

    // Auto-calculate preview total
    const previewTotal = 
        (Number(feeData.admissionFee) || 0) + 
        (Number(feeData.firstTermAmt) || 0) + 
        (Number(feeData.secondTermAmt) || 0) + 
        (Number(feeData.busFirstTermAmt) || 0) + 
        (Number(feeData.busSecondTermAmt) || 0);

    return (
        <div className="w-full h-full flex flex-col bg-background overflow-hidden">
            
            {/* --- Header --- */}
            <header className="shrink-0 px-6 py-5 border-b border-border flex items-center justify-between bg-surface z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-border text-muted hover:bg-sub-header transition-colors cursor-pointer"
                    >
                        <i className="fas fa-arrow-left text-sm"></i>
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">Manage Fees: Class {className}</h1>
                        <p className="text-xs font-semibold text-muted mt-0.5 tracking-wide uppercase">
                            Configure master limits and templates
                        </p>
                    </div>
                </div>
            </header>

            {/* --- Main Content --- */}
            <main className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                <div className="max-w-4xl mx-auto">

                    {/* Tab Navigation (Uniform Design) */}
                    <div className="flex bg-surface p-1 rounded-xl border border-border shadow-sm mb-6 w-full max-w-md">
                        <button 
                            onClick={() => setActiveTab('new')}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                                activeTab === 'new' ? 'bg-primary-soft text-primary shadow-sm' : 'text-muted hover:bg-sub-header'
                            }`}
                        >
                            <i className="fas fa-user-plus mr-2"></i> NEW Students
                        </button>
                        <button 
                            onClick={() => setActiveTab('old')}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                                activeTab === 'old' ? 'bg-primary-soft text-primary shadow-sm' : 'text-muted hover:bg-sub-header'
                            }`}
                        >
                            <i className="fas fa-user-graduate mr-2"></i> OLD Students
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-20"><i className="fas fa-circle-notch fa-spin text-primary text-3xl"></i></div>
                    ) : (
                        <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row">
                            
                            {/* FORM SECTION */}
                            <form onSubmit={handleSubmit} className="flex-1 p-6 md:p-8 border-b md:border-b-0 md:border-r border-border">
                                <h3 className="text-lg font-bold text-foreground mb-6">
                                    Define {activeTab.toUpperCase()} Student Heads
                                </h3>

                                <div className="space-y-5">
                                    <Input 
                                        label="Admission Fee (₹)" 
                                        value={feeData.admissionFee} 
                                        onChange={(e) => handleInputChange('admissionFee', e.target.value)} 
                                        placeholder="0"
                                    />
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input 
                                            label="First Term Fee (₹)" 
                                            value={feeData.firstTermAmt} 
                                            onChange={(e) => handleInputChange('firstTermAmt', e.target.value)} 
                                            placeholder="0"
                                        />
                                        <Input 
                                            label="Second Term Fee (₹)" 
                                            value={feeData.secondTermAmt} 
                                            onChange={(e) => handleInputChange('secondTermAmt', e.target.value)} 
                                            placeholder="0"
                                        />
                                    </div>

                                    <div className="pt-4 border-t border-border">
                                        <Label className="mb-3 block text-muted">Bus Transportation Fees</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input 
                                                label="Bus First Term (₹)" 
                                                value={feeData.busFirstTermAmt} 
                                                onChange={(e) => handleInputChange('busFirstTermAmt', e.target.value)} 
                                                placeholder="0"
                                            />
                                            <Input 
                                                label="Bus Second Term (₹)" 
                                                value={feeData.busSecondTermAmt} 
                                                onChange={(e) => handleInputChange('busSecondTermAmt', e.target.value)} 
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <Button 
                                        type="submit" 
                                        variant="primary" 
                                        className="w-full py-3.5 cursor-pointer"
                                        isLoading={setFeeMutation.isPending}
                                    >
                                        Save {activeTab.toUpperCase()} Configuration
                                    </Button>
                                </div>
                            </form>

                            {/* PREVIEW SUMMARY SECTION */}
                            <div className="w-full md:w-1/3 bg-sub-header p-6 md:p-8 flex flex-col">
                                <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-6">Live Preview</h3>
                                
                                <div className="flex-1 space-y-4 text-sm">
                                    <div className="flex justify-between text-muted">
                                        <span>Admission</span>
                                        <span className="font-bold text-foreground">₹{Number(feeData.admissionFee || 0).toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between text-muted">
                                        <span>First Term</span>
                                        <span className="font-bold text-foreground">₹{Number(feeData.firstTermAmt || 0).toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between text-muted">
                                        <span>Second Term</span>
                                        <span className="font-bold text-foreground">₹{Number(feeData.secondTermAmt || 0).toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between text-muted pt-3 border-t border-border">
                                        <span>Bus T1</span>
                                        <span className="font-bold text-foreground">₹{Number(feeData.busFirstTermAmt || 0).toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between text-muted">
                                        <span>Bus T2</span>
                                        <span className="font-bold text-foreground">₹{Number(feeData.busSecondTermAmt || 0).toLocaleString('en-IN')}</span>
                                    </div>
                                </div>

                                <div className="mt-6 pt-5 border-t-2 border-dashed border-border">
                                    <p className="text-[10px] text-muted font-bold uppercase tracking-widest mb-1">Calculated Total</p>
                                    <p className="text-3xl font-black text-primary">
                                        ₹{previewTotal.toLocaleString('en-IN')}
                                    </p>
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}