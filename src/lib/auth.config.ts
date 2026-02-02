import type { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { JWT } from 'next-auth/jwt';
import type { Session } from 'next-auth';
import type { LoginRequest, AuthResponseData, User } from '@/types/auth.types';

// Helper: Gọi API login với email/password
async function authenticateWithCredentials(
    identifier: string,
    password: string,
): Promise<AuthResponseData | null> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, password } as LoginRequest),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[Auth] Login failed:', response.status, errorData);
            return null;
        }

        const data = await response.json();
        console.log('[Auth] Login successful for:', identifier);
        return data.data as AuthResponseData;
    } catch (error) {
        console.error('[Auth] Login error:', error);
        return null;
    }
}

// Helper: Gọi API Google auth với Firebase idToken
async function authenticateWithGoogle(idToken: string): Promise<AuthResponseData> {
    console.log('[Auth] Calling Google auth API with idToken...');

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
    });

    const responseData = await response.json().catch(() => ({}));
    console.log('[Auth] Google auth response status:', response.status);

    if (!response.ok) {
        // Extract error message from backend response
        const errorMessage =
            responseData.message || responseData.error || 'Google authentication failed';
        console.error('[Auth] Google auth failed:', response.status, errorMessage);
        throw new Error(errorMessage);
    }

    // Check if data has the expected structure
    if (!responseData.data) {
        console.error('[Auth] Google auth response missing data field:', responseData);
        throw new Error('Invalid response from server');
    }

    console.log('[Auth] Google auth successful for user:', responseData.data.user?.email);
    return responseData.data as AuthResponseData;
}

// Helper: Convert AuthResponseData to NextAuth user object
function toNextAuthUser(data: AuthResponseData) {
    const { user, accessToken, accessTokenExpiresAt, refreshToken, refreshTokenExpiresAt } = data;

    if (!user || !accessToken) {
        console.error('[Auth] Invalid auth data - missing user or accessToken');
        throw new Error('Invalid auth response data');
    }

    return {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        background: user.background,
        address: user.address,
        shortDescription: user.shortDescription,
        trustScore: user.trustScore,
        role: user.role,
        provider: user.provider,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        accessToken,
        accessTokenExpiresAt,
        refreshToken,
        refreshTokenExpiresAt,
    };
}

export const authConfig: NextAuthConfig = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                identifier: { label: 'Email or Username', type: 'text' },
                password: { label: 'Password', type: 'password' },
                idToken: { label: 'Firebase ID Token', type: 'text' },
            },
            async authorize(credentials) {
                // Google Firebase auth (idToken provided)
                if (credentials?.idToken) {
                    console.log('[Auth] Attempting Google auth...');
                    try {
                        const authData = await authenticateWithGoogle(
                            credentials.idToken as string,
                        );
                        return toNextAuthUser(authData);
                    } catch (error) {
                        // Re-throw with the original error message
                        const message =
                            error instanceof Error ? error.message : 'Google authentication failed';
                        console.error('[Auth] Google auth error:', message);
                        throw new Error(message);
                    }
                }
                // Local auth (identifier + password provided)
                else if (credentials?.identifier && credentials?.password) {
                    console.log('[Auth] Attempting local auth for:', credentials.identifier);
                    const authData = await authenticateWithCredentials(
                        credentials.identifier as string,
                        credentials.password as string,
                    );

                    if (!authData) {
                        throw new Error('Invalid credentials');
                    }

                    return toNextAuthUser(authData);
                }

                console.error('[Auth] No valid credentials provided');
                throw new Error('No credentials provided');
            },
        }),
    ],
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async jwt({ token, user, trigger, session }): Promise<JWT> {
            // Initial sign in - store tokens from backend
            if (user) {
                const authUser = user as User & {
                    accessToken: string;
                    accessTokenExpiresAt: number;
                    refreshToken: string;
                    refreshTokenExpiresAt: number;
                };

                token.user = {
                    id: authUser.id,
                    username: authUser.username,
                    fullName: authUser.fullName,
                    email: authUser.email,
                    phone: authUser.phone,
                    avatar: authUser.avatar,
                    background: authUser.background,
                    address: authUser.address,
                    shortDescription: authUser.shortDescription,
                    trustScore: authUser.trustScore,
                    role: authUser.role,
                    provider: authUser.provider,
                    isVerified: authUser.isVerified,
                    createdAt: authUser.createdAt,
                    updatedAt: authUser.updatedAt,
                };
                token.accessToken = authUser.accessToken;
                token.accessTokenExpiresAt = authUser.accessTokenExpiresAt;
                token.refreshToken = authUser.refreshToken;
                token.refreshTokenExpiresAt = authUser.refreshTokenExpiresAt;
            }

            // Handle manual session updates (e.g., after refresh or user profile update)
            if (trigger === 'update' && session) {
                if (session.accessToken) token.accessToken = session.accessToken;
                if (session.accessTokenExpiresAt)
                    token.accessTokenExpiresAt = session.accessTokenExpiresAt;
                if (session.refreshToken) token.refreshToken = session.refreshToken;
                if (session.refreshTokenExpiresAt)
                    token.refreshTokenExpiresAt = session.refreshTokenExpiresAt;
                if (session.user) token.user = session.user;
            }

            return token;
        },
        async session({ session, token }): Promise<Session> {
            // Expose token data to client session
            if (token && token.user) {
                session.user = {
                    ...session.user,
                    ...token.user,
                };
                session.accessToken = token.accessToken;
                session.accessTokenExpiresAt = token.accessTokenExpiresAt;
                session.refreshToken = token.refreshToken;
                session.refreshTokenExpiresAt = token.refreshTokenExpiresAt;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login', // Custom login page
        error: '/login', // Redirect errors to login page
    },
    debug: process.env.NODE_ENV === 'development', // Enable debug logs in development
    secret: process.env.NEXTAUTH_SECRET,
};
