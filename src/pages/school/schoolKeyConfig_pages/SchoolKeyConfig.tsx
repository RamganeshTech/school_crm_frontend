import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../../../shared/ui/Card'; // Adjust path
// import { Input } from '../../../shared/ui/Input'; // Adjust path
import { Button } from '../../../shared/ui/Button'; // Adjust path
import { toast } from '../../../shared/ui/ToastContext'; // Adjust path
import { useGetSchoolPublicKey, useUpsertSchoolPublicKey } from '../../../api_services/schoolConfig_api/schoolKeyApi';

interface SchoolKeyConfigProps {
    schoolId: string;
}

export default function SchoolKeyConfig({ schoolId }: SchoolKeyConfigProps) {
    const [publicKeyValue, setPublicKeyValue] = useState('');
    
    // --- API Hooks ---
    const { data: keyData, isLoading: isFetching } = useGetSchoolPublicKey(schoolId);
    const upsertKeyMutation = useUpsertSchoolPublicKey();

    // Sync fetched data to local state
    useEffect(() => {
        if (keyData?.publicKey) {
            setPublicKeyValue(keyData.publicKey);
        }
    }, [keyData]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!publicKeyValue.trim()) {
            toast.error("Public key cannot be empty.");
            return;
        }

        try {
            await upsertKeyMutation.mutateAsync({
                schoolId,
                publicKey: publicKeyValue.trim(),
            });
            toast.success("School Public Key updated successfully!");
        } catch (error: any) {
            toast.error(error.message || "Failed to update public key.");
        }
    };

    if (isFetching) {
        return (
            <div className="w-full h-40 flex items-center justify-center">
                <i className="fas fa-circle-notch fa-spin text-primary text-2xl"></i>
            </div>
        );
    }

    return (
        <Card className="h-full shadow-sm border-border/60 !w-full">
            <CardHeader 
                title="System Security Key" 
                subtitle="Manage the cryptographic public key used for offline-to-online data synchronization." 
            />
            <CardContent>
                <div className="bg-brand-soft border border-border-soft p-4 rounded-xl mb-6 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center shrink-0 border border-border shadow-sm text-primary">
                        <i className="fas fa-shield-alt text-lg"></i>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
                            Active Sync Key 
                            {keyData?.isActive && (
                                <span className="px-2 py-0.5 bg-status-success/10 text-status-success border border-status-success/20 rounded-md text-[10px] uppercase font-bold tracking-wider">
                                    Active
                                </span>
                            )}
                        </h3>
                        <p className="text-xs text-muted leading-relaxed">
                            This key is strictly required for the local Electron desktop application to authenticate and securely synchronize attendance and grading data with this cloud dashboard. 
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-foreground ml-1">
                            Public Key String <span className="text-status-danger">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute left-3 top-3 text-muted">
                                <i className="fas fa-key"></i>
                            </div>
                            <textarea
                                value={publicKeyValue}
                                onChange={(e) => setPublicKeyValue(e.target.value)}
                                disabled={upsertKeyMutation.isPending}
                                placeholder="Paste the generated public key here (e.g., -----BEGIN PUBLIC KEY----- ...)"
                                className="w-full min-h-[120px] bg-surface border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all custom-scrollbar resize-y"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-border/50">
                        <Button 
                            type="submit" 
                            variant="primary" 
                            isLoading={upsertKeyMutation.isPending} 
                            leftIcon="fas fa-save"
                        >
                            {keyData ? "Rotate Key" : "Register Key"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}