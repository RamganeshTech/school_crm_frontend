import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useResetPassword } from '../../api_services/auth_api/authApi'; // Adjust path
import { Button } from '../../shared/ui/Button'; // Adjust path
import { Input } from '../../shared/ui/Input'; // Adjust path
import { toast } from '../../shared/ui/ToastContext'; // Adjust path
import { DOMAIN_NAME } from '../../constants/constants';

export default function ResetPasswordMain() {
    const { id, token } = useParams<{ id: string; token: string }>();
    const navigate = useNavigate();
    
    // Form State
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // UI State for toggling password visibility
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Mutation Hook
    const resetPasswordMutation = useResetPassword();

    const handleResetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Client-Side Validation
        if (!newPassword || !confirmPassword) {
            toast.warning("Both password fields are required.");
            return;
        }

        if (newPassword.length < 6) {
            toast.warning("Password must be at least 6 characters long.");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match. Please try again.");
            return;
        }

        if (!id || !token) {
            toast.error("Invalid reset link. Please request a new one.");
            return;
        }

        // 2. Execute Backend Request
        try {
            const response = await resetPasswordMutation.mutateAsync({ 
                id, 
                token, 
                newPassword, 
                confirmPassword 
            });
            
            toast.success(response.message || "Password successfully reset!");
            
            // Clear form and redirect to login
            setNewPassword('');
            setConfirmPassword('');
            
            // Brief delay so the user can read the success toast before redirecting
            setTimeout(() => {
                navigate('/login');
            }, 1500);

        } catch (error: any) {
            toast.error(error.message || "Failed to reset password.");
        }
    };

    return (
        <div className="min-h-screen w-full bg-background flex flex-col">
            
            {/* --- HEADER --- */}
            <header className="w-full bg-surface border-b border-border px-6 py-4 flex items-center justify-center sm:justify-start shrink-0 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <i className="fas fa-school text-xl"></i>
                    </div>
                    <h1 className="text-xl font-bold text-foreground tracking-wide uppercase hidden sm:block">
                        {DOMAIN_NAME}
                    </h1>
                </div>
            </header>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300">
                <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-xl overflow-hidden">
                    
                    {/* Card Header */}
                    <div className="px-8 py-8 sm:py-10 text-center border-b border-border bg-background/50">
                        <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-success/20">
                            <i className="fas fa-lock-open"></i>
                        </div>
                        <h2 className="text-2xl font-bold text-foreground">Set New Password</h2>
                        <p className="text-sm text-muted mt-2 leading-relaxed">
                            Your new password must be different from previously used passwords and at least 6 characters long.
                        </p>
                    </div>

                    {/* Form Section */}
                    <form onSubmit={handleResetSubmit} className="p-6 sm:p-8 space-y-5">
                        
                        {/* New Password Input */}
                        <Input
                            label="New Password"
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            disabled={resetPasswordMutation.isPending}
                            rightIcon={showNewPassword ? "fas fa-eye-slash" : "fas fa-eye"}
                            onRightIconClick={() => setShowNewPassword(!showNewPassword)}
                        />

                        {/* Confirm Password Input */}
                        <Input
                            label="Confirm New Password"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={resetPasswordMutation.isPending}
                            rightIcon={showConfirmPassword ? "fas fa-eye-slash" : "fas fa-eye"}
                            onRightIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        />

                        {/* Password Match Indicator (Optional UI Polish) */}
                        {confirmPassword.length > 0 && (
                            <div className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${newPassword === confirmPassword ? 'text-success' : 'text-danger'}`}>
                                <i className={`fas ${newPassword === confirmPassword ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                                {newPassword === confirmPassword ? 'Passwords Match' : 'Passwords Do Not Match'}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="pt-2">
                            <Button 
                                type="submit" 
                                variant="primary" 
                                className="w-full py-2.5 text-base"
                                isLoading={resetPasswordMutation.isPending}
                            >
                                Reset Password
                            </Button>
                        </div>

                    </form>

                </div>
            </main>

        </div>
    );
}