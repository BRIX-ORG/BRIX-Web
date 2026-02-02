'use client';

import { toast, ToastOptions, Id } from 'react-toastify';
import { useCallback } from 'react';

// Default toast options matching BRIX dark theme
const defaultOptions: ToastOptions = {
    position: 'top-right',
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: 'dark',
};

export function useToast() {
    const success = useCallback((message: string, options?: ToastOptions) => {
        return toast.success(message, { ...defaultOptions, ...options });
    }, []);

    const error = useCallback((message: string, options?: ToastOptions) => {
        return toast.error(message, { ...defaultOptions, ...options });
    }, []);

    const info = useCallback((message: string, options?: ToastOptions) => {
        return toast.info(message, { ...defaultOptions, ...options });
    }, []);

    const warning = useCallback((message: string, options?: ToastOptions) => {
        return toast.warning(message, { ...defaultOptions, ...options });
    }, []);

    const loading = useCallback((message: string, options?: ToastOptions) => {
        return toast.loading(message, { ...defaultOptions, ...options });
    }, []);

    const dismiss = useCallback((toastId?: Id) => {
        toast.dismiss(toastId);
    }, []);

    const update = useCallback(
        (
            toastId: Id,
            options: ToastOptions & {
                render?: string;
                type?: 'success' | 'error' | 'info' | 'warning';
            },
        ) => {
            toast.update(toastId, { ...options, isLoading: false });
        },
        [],
    );

    const promise = useCallback(
        <T>(
            promiseOrFunc: Promise<T> | (() => Promise<T>),
            messages: {
                pending: string;
                success: string;
                error: string;
            },
            options?: ToastOptions,
        ) => {
            return toast.promise(promiseOrFunc, messages, { ...defaultOptions, ...options });
        },
        [],
    );

    return {
        success,
        error,
        info,
        warning,
        loading,
        dismiss,
        update,
        promise,
        toast, // Export raw toast for advanced usage
    };
}
