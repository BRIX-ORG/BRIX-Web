import { BrixBrandLogo } from '@/components/shared';

export function AuthVisualPanel() {
    return (
        <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden bg-background border-r border-border">
            {/* Background Image with gradient overlay */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center opacity-80"
                style={{
                    backgroundImage: `linear-gradient(to right, rgba(5,5,5,0.2), rgba(5,5,5,0.8)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuADzEclK4O-I-e-oJb5D9Xj8aiKwMdWfJtSPgEMYhax0red5i5_45P0OezUqXGtRh0hWhmZUs2aev4E5Fr0ALGTH-koBToYZxYxjjedFHTvxDk86KiS-SiXNbGBGTctYKSVAqHmRNZvFJjGlqQw5I0kE1rb9cG4pcJVxoKtVZKNMibqG54dXM08dNNxQd3Az3uQui2PnXVMzsQg4u-N7Z0nIfML5aEmlnbvfHSnfRLlqrV6-X-O6QDFEWw_Qbokcnn1gvyFWH_Q4As')`,
                }}
            />

            {/* Floating Tech Elements Layer */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                {/* Status indicator */}
                <div className="absolute top-20 left-20 border border-primary/20 p-4 backdrop-blur-sm">
                    <p className="text-[10px] font-mono text-primary uppercase tracking-[0.3em]">
                        System_Status: Online
                    </p>
                    <div className="w-32 h-1 bg-primary/20 mt-2">
                        <div className="w-2/3 h-full bg-primary" />
                    </div>
                </div>

                {/* Bottom decorative line */}
                <div className="absolute bottom-40 right-10 flex flex-col items-end gap-2 opacity-40">
                    <div className="h-px w-40 bg-linear-to-l from-primary to-transparent" />
                    <p className="text-[8px] font-mono tracking-widest uppercase">
                        BRIX_INFRASTRUCTURE_V4.2
                    </p>
                </div>
            </div>

            {/* Header Branding */}
            <div className="absolute top-10 left-10 z-20 flex items-center gap-3">
                <BrixBrandLogo href="/" size="md" animated />
            </div>
        </div>
    );
}
