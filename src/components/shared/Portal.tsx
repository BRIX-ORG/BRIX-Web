'use client';

import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
    children: React.ReactNode;
}

const emptySubscribe = () => () => {};

export function Portal({ children }: PortalProps) {
    const isClient = useSyncExternalStore(
        emptySubscribe,
        () => true,
        () => false,
    );

    return isClient ? createPortal(children, document.body) : null;
}
