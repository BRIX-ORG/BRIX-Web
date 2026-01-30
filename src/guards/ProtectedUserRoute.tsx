'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface ProtectedUserRouteProps {
    children: React.ReactNode;
}

/**
 * Protected route guard for USER role
 * Redirects to login if not authenticated or if role is not USER
 */
export function ProtectedUserRoute({ children }: ProtectedUserRouteProps) {
    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'loading') return;

        if (!session || session.user.role !== 'USER') {
            router.push('/login');
        }
    }, [session, status, router]);

    if (status === 'loading' || !session || session.user.role !== 'USER') {
        return null;
    }

    return <>{children}</>;
}
