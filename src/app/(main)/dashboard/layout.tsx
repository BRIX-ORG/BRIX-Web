'use client';

import { useState } from 'react';
import { DashboardSidebar, DashboardHeader } from '@/components/dashboard';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar */}
            <DashboardSidebar
                isOpen={isMobileOpen}
                onClose={() => setIsMobileOpen(false)}
                isCollapsed={isCollapsed}
                toggleCollapse={() => setIsCollapsed(!isCollapsed)}
            />

            {/* Main Content - adjust margin for sidebar */}
            <div
                className={cn(
                    'flex-1 flex flex-col overflow-hidden transition-all duration-300',
                    isCollapsed ? 'lg:ml-20' : 'lg:ml-64',
                )}
            >
                {/* Header with mobile menu toggle */}
                <DashboardHeader onMenuClick={() => setIsMobileOpen(true)} />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}
