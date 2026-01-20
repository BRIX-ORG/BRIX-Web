import Image from 'next/image';
import { TrustScoreCircle } from './TrustScoreCircle';

interface UserInfoSidebarProps {
    userName?: string;
    trustScore?: number;
    totalBricks?: number;
    linkDuration?: string;
    mutualNodes?: number;
    sharedMedia?: string[];
}

export function UserInfoSidebar({
    trustScore = 75,
    totalBricks = 142,
    linkDuration = '342D',
    mutualNodes = 18,
    sharedMedia = [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDSpqf5xidFr1CwD_Qt52baIsBXBfTszjQUWiTGjZ9lUqoz5XqF2zs1txZvPZezTi9GfwkaUzL0Fm5XCnbjMJXWGinrS4grBzYtZEZmHrDhjVr5rmJ2dIVyO_-g7SzzOGHCQcYY7DRQDjjXqy96cjlG41W2vnkvbamnU7rcQjqO5nCCunbL870uL7VxxPYWVuUCib_Q0VSS1mx7CeyEvpWAry8QWSCNhTpxSg2zAGun8l6zDXC68GvdWIH9J4OH1F5VFF4WJS91Yxc',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBhqI5yn_9tJwOV_C2V2J7tMm3QH2L9x0BQchM5VXnbRSZ6CiCrVf5rsKo0tuEcysCta56NZ3-ROgVMtqtH6eW5XX3WPIG9L7k3pTm1A2yaEp7eLygWATAOFk7-RHKsSiQhpch9Rafp31XDZS8qTgw1NbBkEfrOYJ5R5gs7T6JHoCEy1CWGH40oQGjMwAuQxVxUKomFj2Vymr7axrkapU5aT2ySsGNP7I3YSQ6e-tTQpTyYVg87Kz5Cl9BxNkTUeEGLTMWG7wRwhEQ',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBwF-_FpH4HAlEUtcx3huR5lvs5peG3_aUu8XX8otNFbNNl9H_QUIQr2Z7MOcs62avACMTkhdawr9K_RFGT_ZXDfmbVUD-_YexGk2sAwWGqt0yxB4RqAiVJlJ5dTSl11QfjEoHI7sGp_c3PHZapOXLduueaebt8uFiLKCTyX6DpyuwFAGiV9S_O6Vhe_ofWsZQom3UsOX81hZ5C6ddDT-JOiDEo8VbiP-K0lvR4MuWQjw16ZweOVDWE05ftXwzg62bbpsvxtfa9jHY',
    ],
}: UserInfoSidebarProps) {
    return (
        <aside className="w-80 border-l border-border bg-background flex flex-col p-6 overflow-y-auto">
            <h3 className="text-[10px] font-black tracking-[0.3em] text-primary/60 uppercase mb-8">
                RELATIONSHIP_METADATA
            </h3>

            {/* Trust Score */}
            <div className="mb-10">
                <TrustScoreCircle score={trustScore} />
                <p className="text-[11px] text-muted-foreground text-center mt-6 leading-relaxed italic">
                    &quot;High-level interaction history. Link integrity verified through{' '}
                    {totalBricks > 10 ? totalBricks : 'multiple'} shared bricks.&quot;
                </p>
            </div>

            <div className="space-y-6">
                {/* Connection Stats */}
                <div className="border-t border-border pt-6">
                    <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest mb-4">
                        Connection Stats
                    </p>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">
                                Total Bricks Shared
                            </span>
                            <span className="text-sm font-bold font-mono">{totalBricks}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">Link Duration</span>
                            <span className="text-sm font-bold font-mono">{linkDuration}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">Mutual Nodes</span>
                            <span className="text-sm font-bold font-mono">{mutualNodes}</span>
                        </div>
                    </div>
                </div>

                {/* Shared Media */}
                <div className="border-t border-border pt-6">
                    <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest mb-4">
                        Shared Media
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                        {sharedMedia.slice(0, 3).map((url, i) => (
                            <div
                                key={i}
                                className="aspect-square bg-muted rounded border border-border overflow-hidden hover:border-primary cursor-pointer transition-all"
                            >
                                <Image
                                    src={url}
                                    alt={`Shared media ${i + 1}`}
                                    width={80}
                                    height={80}
                                    className="w-full h-full object-cover grayscale hover:grayscale-0"
                                />
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-4 text-[10px] font-bold text-primary uppercase hover:underline">
                        View All {totalBricks} Bricks
                    </button>
                </div>
            </div>

            {/* Terminate Button */}
            <button className="mt-auto w-full py-3 border border-destructive/30 bg-destructive/5 text-destructive text-[10px] font-black uppercase tracking-[0.2em] hover:bg-destructive/20 transition-all">
                TERMINATE_CONNECTION
            </button>
        </aside>
    );
}
