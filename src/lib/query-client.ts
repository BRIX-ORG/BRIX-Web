import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Stale time: How long until data is considered stale
            staleTime: 1000 * 60 * 5, // 5 minutes

            // Cache time: How long unused data stays in cache
            gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)

            // Retry configuration
            retry: (failureCount, error: unknown) => {
                // Don't retry on 4xx errors (client errors)
                const status = (error as { response?: { status?: number } })?.response?.status;
                if (status && status >= 400 && status < 500) {
                    return false;
                }
                // Retry up to 3 times for other errors
                return failureCount < 3;
            },

            // Refetch options
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            refetchOnMount: true,
        },
        mutations: {
            // Retry once for mutations
            retry: 1,
        },
    },
});
