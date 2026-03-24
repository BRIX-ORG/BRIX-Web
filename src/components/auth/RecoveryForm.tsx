'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, ArrowRight, ChevronLeft, Lock, Loader2, RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    forgotPasswordSchema,
    ForgotPasswordFormData,
    resetPasswordSchema,
    ResetPasswordFormData,
} from '@/validations/auth';
import { useForgotPassword, useVerifyOtp, useResetPassword } from '@/hooks/apis/auth.api';
import { useAuthStore } from '@/stores/auth-store';
import { useSwal } from '@/hooks/useSwal';
import { useToast } from '@/hooks/useToast';
import { OTPInput } from '@/components/auth';
import { Input } from '@/components/ui';
import { useTranslations } from 'next-intl';

type RecoveryStep = 'email' | 'otp' | 'reset';

export function RecoveryForm() {
    const t = useTranslations('auth');
    const router = useRouter();
    const { success: toastSuccess, error: toastError } = useToast();
    const swal = useSwal();

    // Zustand store
    const {
        recoveryEmail,
        resetToken,
        recoveryStep,
        setRecoveryEmail,
        setResetToken,
        clearRecovery,
    } = useAuthStore();

    // Local state
    const [currentStep, setCurrentStep] = useState<RecoveryStep>('email');
    const [otp, setOtp] = useState('');
    const [secondsLeft, setSecondsLeft] = useState(300);
    const [isResending, setIsResending] = useState(false);

    // Mutations
    const forgotPasswordMutation = useForgotPassword();
    const verifyOtpMutation = useVerifyOtp();
    const resetPasswordMutation = useResetPassword();

    // Sync with store on mount
    useEffect(() => {
        if (recoveryStep && recoveryEmail) {
            setCurrentStep(recoveryStep);
        }
    }, [recoveryStep, recoveryEmail]);

    // Countdown timer for OTP
    useEffect(() => {
        if (currentStep !== 'otp' || secondsLeft <= 0) return;
        const timer = setInterval(() => setSecondsLeft((prev) => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [currentStep, secondsLeft]);

    // Email form
    const emailForm = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: recoveryEmail || '' },
    });

    // Reset password form
    const resetForm = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { newPassword: '', confirmPassword: '' },
    });

    const mm = `0${Math.floor(secondsLeft / 60)}`.slice(-2);
    const ss = `0${secondsLeft % 60}`.slice(-2);

    // Step 1: Request OTP
    const handleEmailSubmit = async (data: ForgotPasswordFormData) => {
        try {
            swal.showLoading(t('recoveryForm.emailStep.loading'));
            await forgotPasswordMutation.mutateAsync(data);
            swal.close();

            setRecoveryEmail(data.email);
            setCurrentStep('otp');
            setSecondsLeft(300);
            toastSuccess(t('recoveryForm.emailStep.success'));
        } catch (err) {
            swal.close();
            toastError(t('recoveryForm.emailStep.error'));
            console.error('Forgot password error:', err);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async () => {
        if (otp.length !== 6 || !recoveryEmail) return;

        try {
            swal.showLoading(t('recoveryForm.otpStep.loading'));
            const response = await verifyOtpMutation.mutateAsync({
                email: recoveryEmail,
                otp,
            });
            swal.close();

            if (response.data?.resetToken) {
                setResetToken(response.data.resetToken);
                setCurrentStep('reset');
                toastSuccess(t('recoveryForm.otpStep.success'));
            } else {
                throw new Error('Invalid response');
            }
        } catch (err) {
            swal.close();
            await swal.error(
                t('recoveryForm.otpStep.invalidCode'),
                t('recoveryForm.otpStep.invalidCodeDesc'),
            );
            setOtp('');
            console.error('Verify OTP error:', err);
        }
    };

    // Resend OTP
    const handleResendOtp = async () => {
        if (isResending || !recoveryEmail) return;
        setIsResending(true);

        try {
            swal.showLoading(t('recoveryForm.otpStep.resending'));
            await forgotPasswordMutation.mutateAsync({ email: recoveryEmail });
            swal.close();

            setSecondsLeft(300);
            setOtp('');
            toastSuccess(t('recoveryForm.otpStep.resendSuccess'));
        } catch (err) {
            swal.close();
            toastError(t('recoveryForm.otpStep.resendError'));
            console.error('Resend OTP error:', err);
        } finally {
            setIsResending(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (data: ResetPasswordFormData) => {
        if (!recoveryEmail || !resetToken) {
            toastError(t('recoveryForm.resetStep.sessionExpired'));
            handleBack();
            return;
        }

        try {
            swal.showLoading(t('recoveryForm.resetStep.loading'));
            await resetPasswordMutation.mutateAsync({
                email: recoveryEmail,
                resetToken,
                newPassword: data.newPassword,
            });
            swal.close();

            await swal.success(
                t('recoveryForm.resetStep.successTitle'),
                t('recoveryForm.resetStep.success'),
            );
            clearRecovery();
            router.push('/login');
        } catch (err) {
            swal.close();
            await swal.error(
                t('recoveryForm.resetStep.errorTitle'),
                t('recoveryForm.resetStep.error'),
            );
            console.error('Reset password error:', err);
        }
    };

    // Go back
    const handleBack = () => {
        if (currentStep === 'otp') {
            setCurrentStep('email');
        } else if (currentStep === 'reset') {
            setCurrentStep('otp');
        } else {
            clearRecovery();
            router.push('/login');
        }
    };

    // Step 1: Email Input
    if (currentStep === 'email') {
        return (
            <form className="space-y-6" onSubmit={emailForm.handleSubmit(handleEmailSubmit)}>
                <Input
                    label={t('recoveryForm.emailStep.label')}
                    type="email"
                    {...emailForm.register('email')}
                    disabled={forgotPasswordMutation.isPending}
                    leftIcon={<Mail className="size-5" />}
                    placeholder={t('recoveryForm.emailStep.placeholder')}
                    error={emailForm.formState.errors.email?.message}
                />

                <button
                    type="submit"
                    disabled={forgotPasswordMutation.isPending}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {forgotPasswordMutation.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <>
                            <span>{t('recoveryForm.emailStep.submit')}</span>
                            <ArrowRight className="size-4" />
                        </>
                    )}
                </button>

                <div className="flex justify-center">
                    <Link
                        href="/login"
                        className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors flex items-center gap-1 group"
                    >
                        <ChevronLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                        {t('recoveryForm.emailStep.back')}
                    </Link>
                </div>
            </form>
        );
    }

    // Step 2: OTP Input
    if (currentStep === 'otp') {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <p className="text-muted-foreground text-sm mb-2">
                        {t('recoveryForm.otpStep.instruction')}
                    </p>
                    <p className="text-primary font-mono font-bold">{recoveryEmail}</p>
                </div>

                <OTPInput value={otp} onChange={setOtp} disabled={verifyOtpMutation.isPending} />

                <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={otp.length !== 6 || verifyOtpMutation.isPending}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {verifyOtpMutation.isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <>
                            <span>{t('recoveryForm.otpStep.submit')}</span>
                            <ArrowRight className="size-4" />
                        </>
                    )}
                </button>

                <div className="text-center space-y-3">
                    <p className="text-sm text-muted-foreground">
                        {t('recoveryForm.otpStep.resendPrompt')}{' '}
                        <button
                            type="button"
                            onClick={handleResendOtp}
                            disabled={isResending || secondsLeft <= 0}
                            className="text-primary hover:underline disabled:text-muted-foreground disabled:no-underline inline-flex items-center gap-1"
                        >
                            <RefreshCw className={`size-3 ${isResending ? 'animate-spin' : ''}`} />
                            {t('recoveryForm.otpStep.resendAction')}
                        </button>
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {t('recoveryForm.otpStep.expiry')}{' '}
                        <span className="text-primary font-mono font-bold">
                            {mm}:{ss}
                        </span>
                    </p>
                </div>

                <div className="flex justify-center">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors flex items-center gap-1 group"
                    >
                        <ChevronLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                        {t('recoveryForm.otpStep.back')}
                    </button>
                </div>
            </div>
        );
    }

    // Step 3: Reset Password
    return (
        <form className="space-y-6" onSubmit={resetForm.handleSubmit(handleResetPassword)}>
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="text-xs text-primary font-mono flex items-center gap-2">
                    <span className="size-2 rounded-full bg-primary animate-pulse" />
                    {t('recoveryForm.resetStep.granted')}
                </p>
            </div>

            <Input
                label={t('recoveryForm.resetStep.newPassword.label')}
                type="password"
                {...resetForm.register('newPassword')}
                disabled={resetPasswordMutation.isPending}
                leftIcon={<Lock className="size-5" />}
                placeholder={t('recoveryForm.resetStep.newPassword.placeholder')}
                error={resetForm.formState.errors.newPassword?.message}
                showPasswordToggle
            />

            <Input
                label={t('recoveryForm.resetStep.confirmPassword.label')}
                type="password"
                {...resetForm.register('confirmPassword')}
                disabled={resetPasswordMutation.isPending}
                leftIcon={<Lock className="size-5" />}
                placeholder={t('recoveryForm.resetStep.confirmPassword.placeholder')}
                error={resetForm.formState.errors.confirmPassword?.message}
                showPasswordToggle
            />

            <button
                type="submit"
                disabled={resetPasswordMutation.isPending}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
                {resetPasswordMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                ) : (
                    <>
                        <span>{t('recoveryForm.resetStep.submit')}</span>
                        <ArrowRight className="size-4" />
                    </>
                )}
            </button>

            <div className="flex justify-center">
                <button
                    type="button"
                    onClick={handleBack}
                    className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors flex items-center gap-1 group"
                >
                    <ChevronLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
                    {t('recoveryForm.resetStep.back')}
                </button>
            </div>
        </form>
    );
}
