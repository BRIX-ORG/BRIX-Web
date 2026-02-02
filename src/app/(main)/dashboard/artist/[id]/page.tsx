'use client';

import { MasonryItem } from '@/components/react-bits/Masonry';
import {
    ArtistHeroSection,
    ArtistStatsGrid,
    ArtistSidebar,
    ArtistGallery,
    ArtistData,
    ArtistStats,
    ActivityItem,
    Collaborator,
} from '@/components/artist';

// Mock artist data
const mockArtist: ArtistData = {
    id: '1',
    username: 'KØRE_ARCHITECT',
    tagline: 'Multi-Disciplinary Digital Sovereign / Neo-Tokyo',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7hUY-LJv7KTYIn8fYeXcMOocN_oSpwUlVOOsyi-ACH1EzEcLeVhW4JjGzIS8W6ilDjyHtZKiNcN7b0RgiwQQqKCdejqNzMDlN7bekLkTTVYumiBcUJOv5pRy3w2B5E__p17P0wckdaZ8oCeGx9nJ77c739GwWfa9LCMgRplSMcWFsTfULU_5p48U2sWYN7EntrDJZOnooh4m3q6QtF7R75-EXQtihVQhfunA8T63-VVMPVe7HC868e1rKfIdLno6i2c0Si_cGMPM',
    trustScore: 99.8,
    verifiedAt: '2026-01-01T00:00:00Z',
};

const mockStats: ArtistStats = {
    digitalAssets: 42804,
    assetsGrowth: '+12.4%',
    validated: 1209,
    rank: 14,
    rankPercentile: 'Top 1%',
};

const mockActivity: ActivityItem[] = [
    {
        id: '1',
        type: 'mint',
        code: 'MINTED_0X2938',
        description: 'Asset "Neon_Void_04" deployed to BRIX layer 2.',
        time: '2m ago',
    },
    {
        id: '2',
        type: 'transfer',
        code: 'TRANSFER_READY',
        description: 'Licensing rights transferred to @VEX_CORP.',
        time: '45m ago',
    },
    {
        id: '3',
        type: 'verify',
        code: 'VERIFICATION_PASS',
        description: 'New geolocation data verified for Batch #19.',
        time: '4h ago',
    },
];

const mockCollaborators: Collaborator[] = [
    {
        id: '1',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmpbJr-QlPxxuUXNCyLIUyhXUQ8ObxVcYqkYfZcXtOXQzPLTOVi6DBWFhy6ervSMYdEmIVfjqEWsAfokKTByq1SIZHmj3CpVb9yNyPDUEbZrVvweWIBszheuWqKuakMBPgymj79vBmwsncbHMwRfAK2TkqeOzDNMv14boDE7Ak0q8cytihNxEMuXW2K0g-TfCSCOA1G_v2kGoN0fNDpeatU2c71J2cvLUMyQmmCXhPp3UljWmpNeHGPnk14R_bTfYbBJ3j5tYpezk',
    },
    {
        id: '2',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiyi48Jffadf83toRypWMb1yJi98KAKsT0mffL_gH0i5lWIDwTopjGLY50bif9QAAL5scXaUGpNd5i7im__6Rkc8SwH2FO_tlYfFjXPh6dgTOriImhmbu7-pKfKM_OC0vyZEs9qc1rA11il7WjhA1wlyItxiy8gppRGo_15DtD1i4h-bOZKSa7BjBUbiv9Yatl7RezRh0NFIQsRCPGY-pxoFaAzM_HcwAjywQ-uRQW0U7G7bH9hY44n-45xFbFLq7fJTDAWeiUnJw',
    },
    {
        id: '3',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDe_2Vnro3ql-Pvo1gMggR83DrE31FUdZXesRbs03i6qO1ZI_LmxDS8c7aFNclIFBvfHtBTE28fsyw2oXkDTztjD6-S_2Z-JdiDshNJP631LyN__j6fbRzt6JVG47ciHeiyxs2e7IUWdeGD1n-DKNU3MUaF13G7qFRQuZnWP_AAKv3jc8OygM40k3hf9WBKjbAbr9AbgP_kT_CN0i_Xl72bRrya7eN3fucni7W9UWOq1BRb9oet_V82j8k0_0fNwDasSXeXS4PIhRQ',
    },
];

const mockGalleryItems: MasonryItem[] = [
    {
        id: '1',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAB1dXgysOdt3XiIJT4u4XJMyFbZtlctLZ5uKMLpeowAgRV_12MIkC0X90dFkMJXPpjOAgWTMiBbuvNJ1tUn2N4DVds3TE5BVg2e_rckoRU8wkATUr0OOcTX5g1TXnzeq2OvY_WwFwP4GmqUaQbblL8OjBNL7VGuzsODAATeJX76dQZxTkDgSzq0byojEZHB8Cd4V7SsR0oGJ9Zu0dx1WcuCH-bRgbxNXfzh-7bUVkyxlWNHkcOLKLCkTYWDF7_T0F68r8NP1GQPU4',
        url: '#',
        height: 700,
        title: 'Genesis_01',
        description: 'Featured cinematic cyberpunk urban photograph.',
        hash: '0x7F83B...1FC53',
        lat: '35.6895° N',
        lng: '139.6917° E',
        timestamp: '23:11 UTC',
    },
    {
        id: '2',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARnC3ET5jD5RUt99CtTV_7PwAKlV50pdLVHCnaLOUrn-HhMDX71Ai5Q9RCJfJFNadN0BX_0nZ2orbXOu_VynnnQS-Wbc9GuxJriDXjrLnOPRwtxB80bfS9M2Wp5mMi83vT9tphWgUIjd1M2CNwYeNNjiiB-Kwl_R4LDC9sMKRBZvAmNloHgxXpvYulfEHLBceSK3gn8Ptttt36cz8UaH3fEooQERTJwHjVNeSY-K-bLA3lVcMTzf1u3AOU-CPuqKrDfWIcVQgYPR8',
        url: '#',
        height: 650,
        title: 'Neon_Sign_V02',
        description: 'Vertical neon sign photography. Node 772 deployed.',
        hash: '0x4A92C...F7D21',
        lat: '37.7749° N',
        lng: '122.4194° W',
        timestamp: '08:22 UTC',
    },
    {
        id: '3',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzep5jeFokCax4ZMC4k5jtACqsJVAvyyhJx_YVLTR_zafGfMCU7epfEzHBhPtS3wiiwd2vAGTflyi1JlAhGKb3e5U0qjkzzjMAxOJNqm0zFPqyKlvfrOUn4HARKy-U-FlXQrV7E7aTiVZnV0B2iY1wHp4wgR4vXXDtOcp72hcrrhhDOY1fW4rQl2eGuukUaydVGEwSs4AM0wR0pfowQ3-DoEqnOpdYv5YXFYzuxQmz68Z2BxS7NOh76xnuNPciNGJR_amanc32JOo',
        url: '#',
        height: 680,
        title: 'Digital_City_03',
        description: 'Atmospheric digital cityscape. Data certified.',
        hash: '0x44928...E3F91',
        lat: '51.5074° N',
        lng: '0.1278° W',
        timestamp: '14:45 UTC',
    },
    {
        id: '4',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDx8R3Dzux8XK-XULkF_feDkebpKYGenlzpk_fuEzA-HmRV9_7G5y6VHCOlm47j-Jqfp_Iua1g37g4Sg6TRxsj6dzxvStMCXl4XjYdF4LpMUT2_oWM1X0pst_7dB0EfKznsplzsfelMxkVHmtgQwBmwbNH1U0__StCeVjmTv5MqF80fReU-SU92hmIzwtsSDRJOs59GrGsf95iL4De9Itz8oULBSuW3IxRwYVuFvKdH5n8ZmjqD9KuRqjKT1WN8TfkVnrgjZSjDvSg',
        url: '#',
        height: 620,
        title: 'Night_Street_04',
        description: 'Long exposure night street. Licensed under BRIX v4.',
        hash: '0x8C3D1...A2B47',
        lat: '48.8566° N',
        lng: '2.3522° E',
        timestamp: '02:17 UTC',
    },
    {
        id: '5',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqbotvS3VJ0f_owkl4BqHJyKs9vFmULYpLBDVCL0_7Skz2MTFSdMLz4vrnjgBrfNvg0Yq6XIpKi_FeRhtc_bOUUzdegbB0kEXM53-1VzGG1ZeMAB25VAgsKn4smhVf5VM98h8Xm2_Iv-dqml4mlfcarEl1gC21vcZAE3Nt4R9vXY_G3n8Jv-mAhyX9LNIeKgeTLmcmUXt359wp9zrOFWdCZT1BYNMEGxAz53JHim9NBJBheZL1V7egBHQ127tgNdr8sPQKTMs00T4',
        url: '#',
        height: 660,
        title: 'Grid_Texture_05',
        description: 'Abstract digital grid texture. Block 881922 verified.',
        hash: '0xD7F29...5E8C3',
        lat: '37.5665° N',
        lng: '126.9780° E',
        timestamp: '19:33 UTC',
    },
    {
        id: '6',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGwb_kLLtWNTDCTuQ4bTANWDEGf9B-C4cGojBJcBo0yk9GAXWcx6wJGuYjDo1zTOT-jbIjPmchXJD7z-2v-9vbyXbk6uokanYlsQg7LHYtmo1GS_d5YjPOgafOc2qTlxcEosfqUXcUDXGeK89bVrctZraYbML-xjTwHp_Lp2fHGxatNdDDqLYrXTvIItcQS1hnnXb6eTw_DAB9eGr3FTZE8NIXpLxKTksvp3VkTshj4o5camdS69uPp2sJVLlpyplu_XbRdQt0BcQ',
        url: '#',
        height: 700,
        title: 'Void_Structure_06',
        description: 'Neo-structuralist architecture captured.',
        hash: '0xA1B2C...3D4E5',
        lat: '34.0522° N',
        lng: '118.2437° W',
        timestamp: '11:08 UTC',
    },
];

export default function ArtistProfilePage() {
    return (
        <div className="relative p-8 max-w-[1440px] mx-auto space-y-8">
            <ArtistHeroSection artist={mockArtist} />

            <ArtistStatsGrid stats={mockStats} />

            <div className="grid grid-cols-12 gap-8">
                <ArtistSidebar
                    activities={mockActivity}
                    collaborators={mockCollaborators}
                    additionalCollaboratorsCount={12}
                />

                <ArtistGallery items={mockGalleryItems} />
            </div>
        </div>
    );
}
