// Wallet linked to user account
export interface Wallet {
    id: string;
    address: string;
    createdAt: string;
}

// Response from GET /api/wallets/nonce
export interface WalletNonceResponse {
    nonce: string;
}

// Request body for POST /api/wallets/link
export interface LinkWalletRequest {
    address: string;
    signature: string;
    message: string;
}

// Response from POST /api/wallets/link
export interface LinkWalletResponse {
    id: string;
    address: string;
    createdAt: string;
}
