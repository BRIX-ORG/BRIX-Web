import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types/api.types';
import type {
    Wallet,
    WalletNonceResponse,
    LinkWalletRequest,
    LinkWalletResponse,
} from '@/types/wallet.types';

/**
 * Get a random nonce message to sign for wallet linking
 */
export function useGetWalletNonce() {
    return useQuery({
        queryKey: ['wallet', 'nonce'],
        queryFn: async () => {
            const response =
                await apiClient.get<ApiResponse<WalletNonceResponse>>('/api/wallets/nonce');
            return response.data.data;
        },
        staleTime: 1000 * 60, // 1 minute
    });
}

/**
 * Get all linked wallets for the current user
 */
export function useGetWallets() {
    return useQuery({
        queryKey: ['wallets'],
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<Wallet[]>>('/api/wallets');
            return response.data.data;
        },
    });
}

/**
 * Verify signature and link a new wallet address
 */
export function useLinkWallet() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: LinkWalletRequest) => {
            const response = await apiClient.post<ApiResponse<LinkWalletResponse>>(
                '/api/wallets/link',
                data,
            );
            return response.data.data;
        },
        onSuccess: () => {
            // Invalidate wallets list to refetch
            queryClient.invalidateQueries({ queryKey: ['wallets'] });
        },
    });
}

/**
 * Unlink a wallet address
 */
export function useUnlinkWallet() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (walletId: string) => {
            await apiClient.delete(`/api/wallets/${walletId}`);
        },
        onSuccess: () => {
            // Invalidate wallets list to refetch
            queryClient.invalidateQueries({ queryKey: ['wallets'] });
        },
    });
}
