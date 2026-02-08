'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { queryClient } from '@/lib/query-client';

interface QueryProviderProps {
    children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
    return (
        <SessionProvider
            refetchInterval={5 * 60} // Refetch session every 5 minutes
            refetchOnWindowFocus={false} // Don't refetch on window focus
        >
            <QueryClientProvider client={queryClient}>
                {children}
                {process.env.NODE_ENV === 'development' && (
                    <ReactQueryDevtools initialIsOpen={false} />
                )}
            </QueryClientProvider>
        </SessionProvider>
    );
}
