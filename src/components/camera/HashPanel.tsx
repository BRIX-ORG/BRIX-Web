import { DataStream } from './DataStream';

interface HashPanelProps {
    hash?: string;
}

const HASH_DATA_STREAM = [
    '0x4A2...F3E1',
    'BLOCK_SIG_VERIFIED',
    'STREAMING_BLOCK_042',
    'METADATA_ENCRYPTED',
    'TXID: 9942-AX01-BRIX',
    '0x7B9...A2C4',
    'NODE_CONFIRMED: 12',
    'LATENCY: 14MS',
    'PROTOCOL_REV: 4.2',
    '0x1D4...E990',
    'BRIX_PROTOCOL_ACTIVE',
];

export function HashPanel({ hash }: HashPanelProps) {
    const displayHash = hash ? `${hash.slice(0, 8)}...${hash.slice(-4)}` : '8f3c2...e9a1';

    return (
        <div className="flex flex-col gap-4 items-end text-right">
            {/* Hash Data Box */}
            <div className="border-r-2 border-primary pr-4 py-2 bg-background/60 backdrop-blur-md">
                <div className="text-[10px] uppercase opacity-50 mb-1 tracking-widest font-bold">
                    Authenticity_Hash
                </div>
                <div className="text-[10px] break-all text-primary font-mono">
                    SHA-256: {displayHash}
                </div>
            </div>

            {/* Data Stream */}
            <DataStream lines={HASH_DATA_STREAM} />
        </div>
    );
}
