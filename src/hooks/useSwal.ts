'use client';

import Swal, { SweetAlertOptions, SweetAlertResult } from 'sweetalert2';
import { useCallback } from 'react';

// Default BRIX dark theme options
const defaultSwalOptions = {
    background: '#0a0a0a',
    color: '#ffffff',
    confirmButtonColor: '#00eeff',
    cancelButtonColor: '#666666',
    customClass: {
        popup: 'swal-brix-popup',
        title: 'swal-brix-title',
        confirmButton: 'swal-brix-confirm',
        cancelButton: 'swal-brix-cancel',
    },
};

export function useSwal() {
    const fire = useCallback((options: SweetAlertOptions): Promise<SweetAlertResult<unknown>> => {
        return Swal.fire({ ...defaultSwalOptions, ...options } as SweetAlertOptions);
    }, []);

    const showLoading = useCallback((title: string = 'Processing...') => {
        return Swal.fire({
            ...defaultSwalOptions,
            title,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            },
        } as SweetAlertOptions);
    }, []);

    const close = useCallback(() => {
        Swal.close();
    }, []);

    const success = useCallback((title: string, text?: string) => {
        return Swal.fire({
            ...defaultSwalOptions,
            icon: 'success',
            title,
            text,
            confirmButtonText: 'OK',
        } as SweetAlertOptions);
    }, []);

    const error = useCallback((title: string, text?: string) => {
        return Swal.fire({
            ...defaultSwalOptions,
            icon: 'error',
            title,
            text,
            confirmButtonText: 'OK',
        } as SweetAlertOptions);
    }, []);

    const warning = useCallback((title: string, text?: string) => {
        return Swal.fire({
            ...defaultSwalOptions,
            icon: 'warning',
            title,
            text,
            confirmButtonText: 'OK',
        } as SweetAlertOptions);
    }, []);

    const info = useCallback((title: string, text?: string) => {
        return Swal.fire({
            ...defaultSwalOptions,
            icon: 'info',
            title,
            text,
            confirmButtonText: 'OK',
        } as SweetAlertOptions);
    }, []);

    const confirm = useCallback(
        (options: {
            title: string;
            text?: string;
            confirmButtonText?: string;
            cancelButtonText?: string;
            icon?: 'warning' | 'error' | 'success' | 'info' | 'question';
        }) => {
            return Swal.fire({
                ...defaultSwalOptions,
                icon: options.icon || 'question',
                title: options.title,
                text: options.text,
                showCancelButton: true,
                confirmButtonText: options.confirmButtonText || 'Confirm',
                cancelButtonText: options.cancelButtonText || 'Cancel',
            } as SweetAlertOptions);
        },
        [],
    );

    return {
        fire,
        showLoading,
        close,
        success,
        error,
        warning,
        info,
        confirm,
        Swal, // Export raw Swal for advanced usage
    };
}
