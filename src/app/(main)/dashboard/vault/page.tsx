'use client';

import { Filter, PlusSquare, Fingerprint, ArrowLeftRight, FileText, Video } from 'lucide-react';
import {
    TrustScoreBanner,
    VaultFolderCard,
    EncryptedContentCard,
    AuditLogSidebar,
    VaultFolder,
    EncryptedFile,
    AuditLogEntry,
} from '@/components/vault';

// Mock data
const mockFolders: VaultFolder[] = [
    {
        id: '1',
        title: 'Identity Assets',
        icon: Fingerprint,
        fileCount: 8,
        size: '4.2 MB',
        protocol: 'AES-256 Protocol',
        status: 'encrypted',
    },
    {
        id: '2',
        title: 'Transaction Ledger',
        icon: ArrowLeftRight,
        fileCount: 124,
        size: '18 MB',
        protocol: 'Chain: Ethereum',
        status: 'locked',
    },
    {
        id: '3',
        title: 'Secure Contracts',
        icon: FileText,
        fileCount: 3,
        size: '120 KB',
        protocol: 'ZK-Proof Verified',
        status: 'encrypted',
    },
    {
        id: '4',
        title: 'Private Media',
        icon: Video,
        fileCount: 42,
        size: '1.4 GB',
        protocol: 'Biometric Only',
        status: 'encrypted',
    },
];

const mockFiles: EncryptedFile[] = [
    {
        id: '1',
        filename: 'Government_ID_Front.jpg',
        imageUrl:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuC_6M6FjSwE99BhmefJFobWUtCXU-m2FdBOHSS5TA7MnBqHNBCcz6oDUEWR1XDy6tFuvEWheJ6pn0jlVAOpK633Su1x6bzqGDrJmfDA3uCd6Q2-AT835m-OY0zNu6TJ9_1L_2JZOxmNlZ4NWqPxYhJlZmnsZ2bvHdf1gVdM3Z3XsCDcje4mGu-6AQHxWfKgOCNTItVc69TJdygXOV77ZvFnRRkv8K7O-T8HYu5I9atF9n_sE34Qqb3D8kLUoFSGbAKdwCtKBI7pdh4',
        hash: 'e3b0c442...98fc',
        type: 'sensitive',
    },
    {
        id: '2',
        filename: 'Contract_Final_v2.pdf',
        imageUrl:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuAs4z7kYpNFPcL4pl6HoteOX1VOLJMEVwQMOsn0GmoCE8vvWVuH5oSv6MfNiZ8cZA4ANwKQ8wadKzd-zg_C8gGsJAoauKF-dtJjzRh3d84uIlH9wh9zX9_tXOxPJMeqvN7wqiDPgepiA3Z2SC04DMZqlHHPutt3t3KKF2KYLTzOSmABilrNRLnG3eUYtiyXXSeuwu1ewCWZUUlfGfAbFm1unCLsArgu5ETlOlqaddIVf6ssWFMbHyWODGiaxJhoKMu2QvEWCdVuk8U',
        hash: 'a4f1d931...b72e',
        type: 'on-chain',
    },
    {
        id: '3',
        filename: 'Vault_Key_Backup.png',
        imageUrl:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuC8ZaJQ0aqZZj2I6k-avTYydjm_QNbKk_Nu5umrZ0EMcjn__3JhgdtUgKpUndym7Cng1vPLM10hXmo4jEICYG_4wIXjmWUZqV-bCiEvAgE0dXBfuDl0nOS8IcpxEv7RoHsL2tcVRdzxuDwANh44j_MKPUfuH53dkobgS3ee6i4o0TSDQuUxv66rVs2vep82Qb3gIBmJkTE04ull4yJV5FTFblWOycw6nscFoXdRhTfZoAzvaTHPIZ3YAFFEQ79Ycys8mHoVvZwuF9c',
        hash: '083a2c41...f610',
        type: 'biometric',
    },
];

const mockLogs: AuditLogEntry[] = [
    {
        id: '1',
        timestamp: '14:22:01',
        message: 'AUTHENTICATION_SUCCESS: User_Admin via Biometric_v2',
        type: 'info',
    },
    {
        id: '2',
        timestamp: '14:23:45',
        message: 'ENCRYPTION_KEY_ROTATED: Node_Alpha_Seven',
        type: 'info',
    },
    {
        id: '3',
        timestamp: '14:25:12',
        message: 'ATTEMPTED_ACCESS: IP: 192.168.1.1 (DENIED)',
        type: 'error',
    },
    {
        id: '4',
        timestamp: '14:26:02',
        message: 'VAULT_OPENED: "Identity Assets" by Alpha_7_User',
        type: 'info',
    },
    {
        id: '5',
        timestamp: '14:27:11',
        message: 'ZK_PROOF_GENERATED: session_id_8829-x',
        type: 'info',
    },
    {
        id: '6',
        timestamp: '14:28:44',
        message: 'METADATA_SCRUB_COMPLETE: 42 files cleaned',
        type: 'info',
    },
    {
        id: '7',
        timestamp: '14:30:00',
        message: 'NETWORK_HEARTBEAT: Latency 14ms (OPTIMAL)',
        type: 'info',
    },
    {
        id: '8',
        timestamp: '14:31:22',
        message: 'AES_STREAM_BUFFER_READY: media_node_3',
        type: 'info',
    },
    {
        id: '9',
        timestamp: '14:32:05',
        message: 'FILE_UPLOAD: Contract_Final_v2.pdf (ENCRYPTED)',
        type: 'info',
    },
    {
        id: '10',
        timestamp: '14:34:41',
        message: 'ON_CHAIN_SYNC: Block_Height_1829331',
        type: 'info',
    },
];

export default function VaultPage() {
    return (
        <div className="flex h-[calc(100vh-65px)]">
            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Trust Score Banner */}
                <TrustScoreBanner />

                {/* Vault Folders Section */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-[22px] font-bold tracking-tight">Vault Folders</h2>
                        <div className="flex gap-2">
                            <button className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded text-xs border border-border flex items-center gap-2 transition-all">
                                <Filter className="size-4" /> Filter
                            </button>
                            <button className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded text-xs border border-border flex items-center gap-2 transition-all">
                                <PlusSquare className="size-4" /> Create New
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {mockFolders.map((folder) => (
                            <VaultFolderCard key={folder.id} folder={folder} />
                        ))}
                    </div>
                </div>

                {/* Recent Encrypted Content */}
                <div className="pb-12">
                    <h2 className="text-[22px] font-bold tracking-tight mb-6">
                        Recent Private Content
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {mockFiles.map((file) => (
                            <EncryptedContentCard key={file.id} file={file} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Audit Log Sidebar */}
            <AuditLogSidebar logs={mockLogs} />
        </div>
    );
}
