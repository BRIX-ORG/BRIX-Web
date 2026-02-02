'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Mail, ArrowRight, Loader2, RefreshCw, CheckCircle, LogOut } from 'lucide-react';
import { useSendEmailVerification, useVerifyEmail } from '@/hooks/apis/auth.api';
import { useSwal } from '@/hooks/useSwal';
import { useToast } from '@/hooks/useToast';
import { OTPInput } from '@/components/auth/OTPInput';

export default function VerifyEmailPage() {
    const router = useRouter();
    const { data: session, status, update } = useSession();
    const { success: toastSuccess, error: toastError } = useToast();
    const swal = useSwal();

    const [otp, setOtp] = useState('');
    const [secondsLeft, setSecondsLeft] = useState(0);
    const [hasSentInitial, setHasSentInitial] = useState(false);

    const sendVerificationMutation = useSendEmailVerification();
    const verifyEmailMutation = useVerifyEmail();

    // Redirect if not logged in or already verified
    useEffect(() => {
        if (status === 'loading') return;

        if (!session) {
            router.push('/login');
            return;
        }

        // Already verified - redirect to dashboard
        if (session.user.verifiedAt) {
            router.push('/dashboard');
            return;
        }

        // Google users are auto-verified
        if (session.user.provider === 'GOOGLE') {
            router.push('/dashboard');
            return;
        }
    }, [session, status, router]);

    // Countdown timer
    useEffect(() => {
        if (secondsLeft <= 0) return;
        const timer = setInterval(() => setSecondsLeft((prev) => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [secondsLeft]);

    const mm = `0${Math.floor(secondsLeft / 60)}`.slice(-2);
    const ss = `0${secondsLeft % 60}`.slice(-2);

    // Send verification email
    const handleSendVerification = async () => {
        if (!session?.user.email) return;

        try {
            swal.showLoading('Sending verification code...');
            await sendVerificationMutation.mutateAsync({ email: session.user.email });
            swal.close();

            setSecondsLeft(300); // 5 minutes
            setHasSentInitial(true);
            toastSuccess('Verification code sent to your email!');
        } catch (err) {
            swal.close();
            const errorMessage =
                err instanceof Error ? err.message : 'Failed to send verification email';
            toastError(errorMessage);
        }
    };

    // Verify OTP
    const handleVerifyOtp = async () => {
        if (otp.length !== 6 || !session?.user.email) return;

        try {
            swal.showLoading('Verifying code...');
            await verifyEmailMutation.mutateAsync({
                email: session.user.email,
                otp,
            });
            swal.close();

            // Update session to reflect verified status
            await update({ user: { ...session.user, verifiedAt: new Date().toISOString() } });

            await swal.success('Email Verified!', 'Your email has been verified successfully.');
            router.push('/dashboard');
        } catch (err) {
            swal.close();
            const errorMessage =
                err instanceof Error ? err.message : 'Invalid or expired verification code';
            await swal.error('Verification Failed', errorMessage);
            setOtp('');
        }
    };

    // Logout
    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push('/login');
    };

    // Loading state
    if (status === 'loading' || !session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex cyber-grid items-center justify-center px-4">
            <div className="w-full max-w-md space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center size-20 rounded-full bg-primary/10 border border-primary/20">
                        <Mail className="size-10 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Verify Your Email</h1>
                    <p className="text-muted-foreground text-sm">
                        We need to verify your email address to continue.
                    </p>
                    <p className="text-primary font-mono font-bold">{session.user.email}</p>
                </div>

                {/* Card */}
                <div className="bg-card border border-border rounded-lg p-6 space-y-6">
                    {!hasSentInitial ? (
                        // Initial state - send verification email
                        <div className="space-y-6">
                            <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground text-center">
                                    Click the button below to receive a 6-digit verification code at
                                    your email address.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleSendVerification}
                                disabled={sendVerificationMutation.isPending}
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {sendVerificationMutation.isPending ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <>
                                        <span>Send Verification Code</span>
                                        <ArrowRight className="size-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        // OTP input state
                        <div className="space-y-6">
                            <div className="text-center">
                                <p className="text-muted-foreground text-sm mb-2">
                                    Enter the 6-digit code sent to your email
                                </p>
                            </div>

                            <OTPInput
                                value={otp}
                                onChange={setOtp}
                                disabled={verifyEmailMutation.isPending}
                            />

                            <button
                                type="button"
                                onClick={handleVerifyOtp}
                                disabled={otp.length !== 6 || verifyEmailMutation.isPending}
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {verifyEmailMutation.isPending ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle className="size-4" />
                                        <span>Verify Email</span>
                                    </>
                                )}
                            </button>

                            {/* Resend & Timer */}
                            <div className="text-center space-y-3">
                                <p className="text-sm text-muted-foreground">
                                    Didn&apos;t receive the code?{' '}
                                    <button
                                        type="button"
                                        onClick={handleSendVerification}
                                        disabled={
                                            sendVerificationMutation.isPending || secondsLeft > 0
                                        }
                                        className="text-primary hover:underline disabled:text-muted-foreground disabled:no-underline inline-flex items-center gap-1"
                                    >
                                        <RefreshCw
                                            className={`size-3 ${sendVerificationMutation.isPending ? 'animate-spin' : ''}`}
                                        />
                                        Resend
                                    </button>
                                </p>
                                {secondsLeft > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                        Code expires in{' '}
                                        <span className="text-primary font-mono font-bold">
                                            {mm}:{ss}
                                        </span>
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Logout option */}
                <div className="flex justify-center">
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="text-muted-foreground hover:text-destructive text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <LogOut className="size-4" />
                        Sign out and use a different account
                    </button>
                </div>
            </div>
        </div>
    );
}
