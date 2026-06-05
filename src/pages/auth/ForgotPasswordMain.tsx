import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForgotPassword } from '../../api_services/auth_api/authApi'; // Adjust path
import { Button } from '../../shared/ui/Button'; // Adjust path
import { Input } from '../../shared/ui/Input'; // Adjust path
import { toast } from '../../shared/ui/ToastContext'; // Adjust path
import { DOMAIN_NAME } from '../../constants/constants';

export default function ForgotPasswordMain() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const forgotPasswordMutation = useForgotPassword();

    const handleRequestReset = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic frontend validation
        if (!email.trim()) {
            toast.warning("Please enter your registered email address.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("Please enter a valid email format.");
            return;
        }

        try {
            const res = await forgotPasswordMutation.mutateAsync({ email: email.trim().toLowerCase() });
            toast.success(res.message || "Reset link sent successfully!");
            setEmail(''); // Clear input on success
        } catch (error: any) {
            toast.error(error.message || "Failed to send reset request.");
        }
    };

    return (
        <div className="min-h-screen w-full bg-background flex flex-col">

            {/* --- HEADER --- */}
            <header className="w-full bg-surface border-b border-border px-6 py-4 flex items-center justify-between shrink-0 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <i className="fas fa-school text-xl"></i>
                    </div>
                    <h1 className="text-xl font-bold text-foreground tracking-wide uppercase">
                        {DOMAIN_NAME}
                    </h1>
                </div>

                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-background border border-border text-muted hover:text-foreground hover:bg-sub-header transition-colors"
                    title="Go Back"
                >
                    <i className="fas fa-arrow-left text-sm"></i>
                </button>
            </header>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300">
                <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-xl overflow-hidden">

                    {/* Card Header */}
                    <div className="px-8 py-8 sm:py-10 text-center border-b border-border bg-background/50">
                        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-primary/20">
                            <i className="fas fa-key"></i>
                        </div>
                        <h2 className="text-2xl font-bold text-foreground">Forgot Password?</h2>
                        <p className="text-sm text-muted mt-2 leading-relaxed">
                            No worries, we'll send you reset instructions. Please enter the email address associated with your account.
                        </p>
                    </div>

                    {/* Form Section */}
                    <form onSubmit={handleRequestReset} className="p-8 space-y-6">
                        <div className="space-y-1">
                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="e.g. name@school.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={forgotPasswordMutation.isPending}
                            />
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full py-2.5 text-base"
                            isLoading={forgotPasswordMutation.isPending}
                        >
                            Send Reset Link
                        </Button>

                        <div className="text-center pt-2">
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors flex items-center justify-center gap-2 mx-auto"
                            >
                                <i className="fas fa-arrow-left text-xs"></i> Back to Login
                            </button>
                        </div>
                    </form>

                </div>
            </main>

        </div>
    );
}