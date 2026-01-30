import type { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { JWT } from 'next-auth/jwt';
import type { Session } from 'next-auth';
import type { LoginRequest, LoginResponse, User } from '@/types/auth.types';

export const authConfig: NextAuthConfig = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                identifier: { label: 'Email or Username', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.identifier || !credentials?.password) {
                    return null;
                }

                try {
                    // Call backend API to authenticate
                    const response = await fetch(
                        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                identifier: credentials.identifier,
                                password: credentials.password,
                            } as LoginRequest),
                        },
                    );

                    if (!response.ok) {
                        return null;
                    }

                    const data = (await response.json()) as LoginResponse;

                    if (!data.data) {
                        return null;
                    }

                    const {
                        user,
                        accessToken,
                        accessTokenExpiresAt,
                        refreshToken,
                        refreshTokenExpiresAt,
                    } = data.data;

                    // Return user object that will be saved in JWT
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
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt,
                        accessToken,
                        accessTokenExpiresAt,
                        refreshToken,
                        refreshTokenExpiresAt,
                    };
                } catch (error) {
                    console.error('Auth error:', error);
                    return null;
                }
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
        signIn: '/auth/login', // Custom login page
    },
    secret: process.env.NEXTAUTH_SECRET,
};
