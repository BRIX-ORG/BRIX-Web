import Image from 'next/image';

export interface BrickData {
    id: string;
    imageUrl: string;
    latitude: string;
    longitude: string;
    fileRef: string;
    altitude: string;
    caption?: string;
    senderName?: string;
    senderAvatar?: string;
}

interface BrickMessageProps {
    brick: BrickData;
}

export function BrickMessage({ brick }: BrickMessageProps) {
    return (
        <div className="flex items-end gap-3 max-w-[85%]">
            {/* Avatar */}
            {brick.senderAvatar && (
                <Image
                    src={brick.senderAvatar}
                    alt={`Avatar for ${brick.senderName}`}
                    width={32}
                    height={32}
                    className="size-8 rounded bg-muted shrink-0 object-cover"
                />
            )}

            <div className="flex flex-col gap-1">
                {/* Sender Label */}
                {brick.senderName && (
                    <p className="text-[10px] font-bold text-muted-foreground ml-1">
                        {brick.senderName.toUpperCase()} · BRICK_SHARE
                    </p>
                )}

                {/* Brick Container */}
                <div className="group relative overflow-hidden bg-muted border border-border p-2 rounded-sm max-w-md">
                    {/* Image */}
                    <Image
                        src={brick.imageUrl}
                        alt="Shared brick image"
                        width={400}
                        height={225}
                        className="w-full aspect-video object-cover rounded-sm grayscale group-hover:grayscale-0 transition-all duration-500"
                    />

                    {/* GPS Metadata Overlay */}
                    <div className="mt-3 grid grid-cols-2 gap-2 p-3 bg-black/80 font-mono text-[9px] border border-border/50">
                        <div>
                            <p className="text-primary/60">LAT_COORDINATE</p>
                            <p className="text-foreground">{brick.latitude}</p>
                        </div>
                        <div>
                            <p className="text-primary/60">LONG_COORDINATE</p>
                            <p className="text-foreground">{brick.longitude}</p>
                        </div>
                        <div>
                            <p className="text-primary/60">FILE_REF</p>
                            <p className="text-foreground">{brick.fileRef}</p>
                        </div>
                        <div>
                            <p className="text-primary/60">ALTITUDE</p>
                            <p className="text-foreground">{brick.altitude}</p>
                        </div>
                    </div>

                    {/* Neon Corners */}
                    <div className="absolute top-2 left-2 size-4 border-l-2 border-t-2 border-primary" />
                    <div className="absolute bottom-2 right-2 size-4 border-r-2 border-b-2 border-primary" />
                </div>

                {/* Caption */}
                {brick.caption && (
                    <div className="bg-muted/80 border border-border p-4 rounded-sm text-sm mt-2">
                        {brick.caption}
                    </div>
                )}
            </div>
        </div>
    );
}
