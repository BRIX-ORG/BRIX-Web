import { AuthVisualPanel } from '@/components/auth';
import { GuestRoute } from '@/guards';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <GuestRoute>
            <div className="flex min-h-screen w-full flex-row">
                {/* Left Side: Visual Canvas */}
                <AuthVisualPanel />

                {/* Right Side: Form Panel */}
                {children}
            </div>
        </GuestRoute>
    );
}
