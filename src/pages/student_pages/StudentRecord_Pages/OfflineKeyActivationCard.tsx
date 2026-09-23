import React, { useState } from 'react';
import { useActivateUnlockCode } from '../../../api_services/student_api/studentRecordApi'; // Adjust path
import { toast } from '../../../shared/ui/ToastContext';
import { AVAILABLE_MODULES } from '../../../constants/constants';
import { Button } from '../../../shared/ui/Button';

interface OfflineActivationModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentId: string;
    unlockedModules?: string[];
    // --- New Audit Props ---
    lastActivationCode?: string | null;
    lastActivationCodeGeneratedAt?: string | Date | null;
    lastActivatedBy?: string | null;
}

export default function OfflineKeyActivationCard({ 
    isOpen, 
    onClose, 
    studentId, 
    unlockedModules = [],
    lastActivationCode,
    lastActivationCodeGeneratedAt,
    lastActivatedBy
}: OfflineActivationModalProps) {
    const [activationCode, setActivationCode] = useState('');
    const activateMutation = useActivateUnlockCode();

    if (!isOpen) return null;

    const handleActivate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!activationCode.trim()) {
            toast.error("Please enter a valid activation code.");
            return;
        } 

        try {
            await activateMutation.mutateAsync({
                code: activationCode.trim(),
                studentId: studentId
            });
            toast.success("Modules activated successfully!");
            setActivationCode(''); // Clear on success
            onClose(); // Close the modal automatically
        } catch (error: any) {
            toast.error(error.message || "Failed to activate modules.");
        }
    };

    // Helper to format the audit date nicely
    const formatDateTime = (dateVal?: string | Date | null) => {
        if (!dateVal) return 'N/A';
        return new Date(dateVal).toLocaleString('en-IN', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Modal Container */}
            <div className="bg-surface w-full max-w-lg max-h-[90vh] rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-start justify-between px-6 py-5 border-b border-border bg-background/50 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-soft text-primary flex items-center justify-center border border-primary/20 shrink-0">
                            <i className="fas fa-shield-alt text-lg"></i>
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground text-lg">Offline Activation</h3>
                            <p className="text-xs text-muted mt-0.5">Unlock desktop features for this student.</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={activateMutation.isPending}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:bg-border/50 hover:text-foreground transition-colors"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Body (Scrollable if content gets too tall) */}
                <div className="px-6 py-5 space-y-3 overflow-y-auto custom-scrollbar">

                    {/* Active Modules Display */}
                    <div className="bg-background p-4 rounded-xl border border-border">
                        <span className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2 block">
                            Currently Active Modules
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                            {unlockedModules.length === 0 ? (
                                <span className="text-xs font-medium text-muted">No modules currently unlocked.</span>
                            ) : (
                                unlockedModules.map(modValue => {
                                    const modLabel = AVAILABLE_MODULES.find(m => m.value === modValue)?.label || modValue;
                                    return (
                                        <span
                                            key={modValue}
                                            className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide bg-primary-soft text-primary border border-primary/20 shadow-sm flex items-center gap-1.5"
                                        >
                                            <i className="fas fa-check text-[9px] opacity-70"></i>
                                            {modLabel}
                                        </span>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* 🌟 NEW: Audit Trail / Last Activation Info */}
                    {lastActivationCode && (
                        <div className="bg-background p-4 rounded-xl border border-border flex flex-col gap-3">
                            <span className="text-[10px] font-bold text-muted uppercase tracking-wider block flex items-center gap-1.5">
                                <i className="fas fa-history"></i> Last Activation Record
                            </span>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-surface p-3 rounded-lg border border-border/50">
                                <div>
                                    <p className="text-[10px] text-muted uppercase font-bold mb-1">Generated By</p>
                                    <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
                                        <i className="fas fa-user-circle text-primary/70"></i>
                                        {lastActivatedBy || 'System / Admin'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted uppercase font-bold mb-1">Date & Time</p>
                                    <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
                                        <i className="fas fa-clock text-primary/70"></i>
                                        {formatDateTime(lastActivationCodeGeneratedAt)}
                                    </p>
                                </div>
                            </div>
                            
                            <div>
                                <p className="text-[10px] text-muted uppercase font-bold mb-1">Used Code</p>
                                <div className="bg-surface border border-border/70 rounded-lg p-2.5 text-[10px] font-mono text-muted break-all shadow-inner max-h-16 overflow-y-auto custom-scrollbar">
                                    {lastActivationCode}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Input Form */}
                    <form id="activation-form" onSubmit={handleActivate} className="space-y-3 pt-2">
                        <label className="text-sm font-bold text-foreground ml-1">
                            Enter New Activation Code <span className="text-status-danger">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute left-3 top-3.5 text-muted">
                                <i className="fas fa-key"></i>
                            </div>
                            <textarea
                                value={activationCode}
                                onChange={(e) => setActivationCode(e.target.value)}
                                disabled={activateMutation.isPending}
                                placeholder="Paste the exact DG... activation code here"
                                className="w-full bg-background border border-border text-foreground rounded-xl pl-9 pr-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-inner min-h-[90px] resize-y custom-scrollbar"
                                required
                            />
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-background/50 border-t border-border flex items-center justify-end gap-3 shrink-0">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={activateMutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        form="activation-form"
                        type="submit"
                        variant="primary"
                        isLoading={activateMutation.isPending}
                        leftIcon="fas fa-unlock"
                    >
                        Verify & Activate
                    </Button>
                </div>

            </div>
        </div>
    );
}