'use client';

import { useState } from 'react';
import { TimeFilter, RisingArtists, GlobalActivityWidget, Artist } from '@/components/trending';
import Masonry from '@/components/react-bits/Masonry';

// Mock data for artists - more artists for CircularGallery
const mockArtists: Artist[] = [
    {
        id: '1',
        username: '@NEO_GRID',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB55g0L31d9b7ePrI8JIbXMvkeUIhE2iv8HPzxvPKSrvIKZ6Bg_yZS8im53HnQNSTW6_zALnS8JpW8LVUi2lnbMgWm6MwgHVRwqc_uQp2cxe2hwNQhhOHMgWtS6IAQnvAk_YM2DeiCcbUl7IP7woMdfUADd3Xz2PyVWyS5MGsb9o8ZAOXXBMgO8kPqXG0c1A8HfEJF3OJrCJE_9u5hj8jJwwIC9UMjyt92gVv3Nolz4GrK5qsbUksnoBFxDDCfirr2XLwntfd4Xh6Q',
        brixCount: '42.8k',
        verifiedAt: '2026-01-01T00:00:00Z',
    },
    {
        id: '2',
        username: '@LYNX_V01D',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJxKJrh3u0-YnRtrDlh1l2FZflJjDXUi-CjAzxncmZ8plH9rRGr9dBNMgEK10AF5g8VJSm6oqnKxE3ntw1agdmmNLSztGaTQ9zMJB4A8_qYVdg9YcomK-TlAXlMKR7tjoHJb2krA3CJkkGBxDYJUojg5iU2L8QVc1933MREokFis7zyrY1PwEb_KSbFGL2hCYhan5w8LjSCmY4WVGDPMsgHIJKQsETg5kCk4Ig_Z22wBYkuXCQbwT4o3T0fHtmFVsJW4Cv72c3Bcg',
        brixCount: '38.1k',
        isRising: true,
    },
    {
        id: '3',
        username: '@PHASE_SHFT',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASs5BtUwn3h-4ZazZp4l78z1g3FPVHp4WAgtfjk1r8_6omvqZs4w07hWm7aaS3EahtoJ8CA1Aae6Gw3ZL7mwwMiIhM8HSbRLyBMAXlSsjHQB-jWxnBd2-YMbfJsrQ-chuocA1_kt07Uqcafwb9v-tgMy6zizbcqIaB2b-U1Imcd6ax_RdMSIR49kNqTjy_4fmEmxx_Npyqx2Y1TazZiX-MwwDGsZ67wN7vyEHrMVo_NjsdB4dO9l9Y2zw2H3c1p4dcUr34ZBFkSqQ',
        brixCount: '31.5k',
    },
    {
        id: '4',
        username: '@CYBER_SYNTH',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQEk-fgTJeJWkJOpQ7CYIEhIIz7BTSiqVRRkOhOmzQHJt9xzcQ-9esEpabJMTfAozAnScGXRH8xExk1sFomwrC7tOdDDYMdkKk5Vq0ZO_N12m8RdHt8UOPnWzbc1L7ikr26foL6gbkxhzPz2O1Q_WbfiB8L15fUrrFUx3VWME78AZ0FhGwbrm0DxVjhdOVzy_TJgqh6rP_ICxDzSGQ7tbCfzRzC7MgxfubkBS5mAvVBq5hcjtLcXHhGRaeXBMDVEnAofJO1_52lvA',
        brixCount: '29.2k',
    },
    {
        id: '5',
        username: '@MIRA_V',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUbd6IQvp4mFo7rOrv-hI_GU9549QyJbYoG7_75UkYf8Kh9oqraq-30BPHfdX7NvQpbjY-wc1XFQtcbLq_YMDUXDMB1N_IWUrCm89fO7iEQvxQ_LYPJqAEMV4djOmBKdFHM-BpSBxwNKTQEqvhLLzs1I5wL6IYwbyU8zR25bnruKGIekDnV3SGWd6ohArCZaY7nNENRlS2rsRLJ9TOpNUZGpIA8x5ZAVdngbyJ_JCSu3MYgWOFp6tf39KkMI9ssl-eTN92F67bgQA',
        brixCount: '24.7k',
        verifiedAt: '2026-01-01T00:00:00Z',
    },
    {
        id: '6',
        username: '@NEON_DRIFTER',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIm21OR215emlg5aAsy_pA1wk3ev_Lz_GuU7rdXrAImNX7jMzl686cc2Vp6maE2Je1dhD6SgiaS2FELXU7fxHgF8QYBa5-y0on4GPolUvPJHacwxhRs0tQL4s0DuRnw0Hyo24OVjfDYOlyAgtAe3cm7iYxFfrzAwWL2ELPA2T_rLeAgXAfFtK73uZ39c-tJ5w5_9m5esJerEQxnJ__cl9Xht18BJbJRSu7vlOVe1lom1aoR-c1_az5MmGcWM4PXw8hqapD363EzZI',
        brixCount: '22.1k',
        isRising: true,
    },
    {
        id: '7',
        username: '@GLITCH_WAVE',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-udIvopAatUn7kZR1sTprT2fquuNO3ccYx9kI_2SIdBpsOdy2UGv2jxYanjcO9ugAB7n0HoTTtCIXfDzLKk6Lyrvb6Elz3yaWpCPBiwjT316p-DwLYTOSIruikNNCgwFaYkOId3Sh7YrFwH-UBCpFhx2t5hXTxTAEaYsFh4h7EzAQc6SLTt3dY51IBBVNEUync7y6Hx80SybLEHiIx-G4pTPCGKfzn9SzFDJJvx0BnV5mQ82pEpQsk0Ogw4xrsSVN0qk9K0tL0X8',
        brixCount: '19.8k',
        verifiedAt: '2026-01-01T00:00:00Z',
    },
    {
        id: '8',
        username: '@PIXEL_PUNK',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGwb_kLLtWNTDCTuQ4bTANWDEGf9B-C4cGojBJcBo0yk9GAXWcx6wJGuYjDo1zTOT-jbIjPmchXJD7z-2v-9vbyXbk6uokanYlsQg7LHYtmo1GS_d5YjPOgafOc2qTlxcEosfqUXcUDXGeK89bVrctZraYbML-xjTwHp_Lp2fHGxatNdDDqLYrXTvIItcQS1hnnXb6eTw_DAB9eGr3FTZE8NIXpLxKTksvp3VkTshj4o5camdS69uPp2sJVLlpyplu_XbRdQt0BcQ',
        brixCount: '17.5k',
    },
    {
        id: '9',
        username: '@VORTEX_X',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvxvnKrF2vido9b2g8aeEyxwzptA2_gAdcnvu55LNQPB7174qthj14efvFfALb8k_3vJon0HyZPhSbksEKcj4_AVLyDV2MLi5JqiIDPC5T5MLj7LIHAvRNhF7y_d5NVlqoYXhKYQ8-sl-jHmf-IL_TaGVBGqDUJBHPKeRVwN7eW5Xuh0iE8bmqD0Qog8H-ZFRl-9XsgwTgWt7Gfn7QaI9EREnK6FwXn9xfTAgPSnjQl7xKFvD3XMfWxoN75CbZFhkc2yOJ3d7wf-Y',
        brixCount: '15.3k',
        isRising: true,
    },
    {
        id: '10',
        username: '@NEURAL_FLUX',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCq36qhqzhcuyr4VJxUwtFUGw1nURMI3JTHdHb-vjc8xT0IYyq9kl98XOrj_bQbwibT2swhiYAerXdQjN91kMd8KjG9Y6AY-DfsMCX7ESRcYgRNgeDz2Q8xXDwagJ2AkBuOdvHz7YWFtTQOifQM4o82JqreNyeIjtgC2dyq6WZi7qQ7cxfBhYBeD2o1W-uZfgjgQTro2E2r-dlp2a0fuwmuT4ZSXg-Psw6l9xhQSDCmikSpdkotyB2ETrYZNFWTf9zWnABParoeTME',
        brixCount: '14.1k',
    },
    {
        id: '11',
        username: '@ECHO_PRIME',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAThnX_c4LGf6NxdVHKl-0sT8gbunorSYUKehqFwJVdk9u63-xmanJzFnT9ck67zqeaErhNys23nVncUQHdnZGzXlUMjPjs_sLFQp8rQQCJNeFGcu8wl2idUnHCOI4i9AfynrmnbHktdGM4cWPPyRdlnLET5o4M98EmZKmItnyptba_LPZJMUQKK0VkgXLZUk5we6j_V_NOWq_w-I6DC3wCCzbkJvkIxrieH9YoSLLOLNiJ9wp2DAaXM9RMxFrWUH3GnFNLc6HC8Nk',
        brixCount: '12.9k',
        verifiedAt: '2026-01-01T00:00:00Z',
    },
    {
        id: '12',
        username: '@SYNTH_ZERO',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXkLmCdnEdW8THC8iPGG7Ca2WOZyALbrt9qyvha-uBqyujD3xV7Ca5oV9GcgqsOItRJwTJa2U1hdqH2XVo09gsGhAkxIUpS5ibofulSazKL4wjgeQZkB3JD3CLN7WLsxnazBK262BoJHpL4HR-eZitQ-8ALgXGo0GRc4JphiUwxvhxgwaXIHHe_idUOTQ3cQ0_YNI2GARri0LeRNcTJJbBg8Ml3Qga_wgvuBz0v8xXBbNQ6-TNUxVwNUiSyhH29MXjp2WGccyYotM',
        brixCount: '11.2k',
        isRising: true,
    },
];

// Mock data for Masonry items
const mockMasonryItems = [
    {
        id: '1',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGwb_kLLtWNTDCTuQ4bTANWDEGf9B-C4cGojBJcBo0yk9GAXWcx6wJGuYjDo1zTOT-jbIjPmchXJD7z-2v-9vbyXbk6uokanYlsQg7LHYtmo1GS_d5YjPOgafOc2qTlxcEosfqUXcUDXGeK89bVrctZraYbML-xjTwHp_Lp2fHGxatNdDDqLYrXTvIItcQS1hnnXb6eTw_DAB9eGr3FTZE8NIXpLxKTksvp3VkTshj4o5camdS69uPp2sJVLlpyplu_XbRdQt0BcQ',
        url: '#',
        height: 700,
        title: 'Neo-Structuralist V01',
        description: 'Captured via verified optical sensor. No post-processing detected.',
        hash: '0xA1B2C...3D4E',
        lat: '37.7749° N',
        lng: '122.4194° W',
        timestamp: '14:22 UTC',
    },
    {
        id: '2',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvxvnKrF2vido9b2g8aeEyxwzptA2_gAdcnvu55LNQPB7174qthj14efvFfALb8k_3vJon0HyZPhSbksEKcj4_AVLyDV2MLi5JqiIDPC5T5MLj7LIHAvRNhF7y_d5NVlqoYXhKYQ8-sl-jHmf-IL_TaGVBGqDUJBHPKeRVwN7eW5Xuh0iE8bmqD0Qog8H-ZFRl-9XsgwTgWt7Gfn7QaI9EREnK6FwXn9xfTAgPSnjQl7xKFvD3XMfWxoN75CbZFhkc2yOJ3d7wf-Y',
        url: '#',
        height: 650,
        title: 'Neon Streets',
        description: 'Urban architecture verified. Geometry consistent with location.',
        hash: '0xE5F6G...7H8I',
        lat: '35.6895° N',
        lng: '139.6917° E',
        timestamp: '09:15 UTC',
    },
    {
        id: '3',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCq36qhqzhcuyr4VJxUwtFUGw1nURMI3JTHdHb-vjc8xT0IYyq9kl98XOrj_bQbwibT2swhiYAerXdQjN91kMd8KjG9Y6AY-DfsMCX7ESRcYgRNgeDz2Q8xXDwagJ2AkBuOdvHz7YWFtTQOifQM4o82JqreNyeIjtgC2dyq6WZi7qQ7cxfBhYBeD2o1W-uZfgjgQTro2E2r-dlp2a0fuwmuT4ZSXg-Psw6l9xhQSDCmikSpdkotyB2ETrYZNFWTf9zWnABParoeTME',
        url: '#',
        height: 680,
        title: 'Abstract Geometry',
        description: 'Verified authentic. Zero manipulation detected in pixel analysis.',
        hash: '0xJ9K0L...1M2N',
        lat: '51.5074° N',
        lng: '0.1278° W',
        timestamp: '18:42 UTC',
    },
    {
        id: '4',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAThnX_c4LGf6NxdVHKl-0sT8gbunorSYUKehqFwJVdk9u63-xmanJzFnT9ck67zqeaErhNys23nVncUQHdnZGzXlUMjPjs_sLFQp8rQQCJNeFGcu8wl2idUnHCOI4i9AfynrmnbHktdGM4cWPPyRdlnLET5o4M98EmZKmItnyptba_LPZJMUQKK0VkgXLZUk5we6j_V_NOWq_w-I6DC3wCCzbkJvkIxrieH9YoSLLOLNiJ9wp2DAaXM9RMxFrWUH3GnFNLc6HC8Nk',
        url: '#',
        height: 620,
        title: 'Orbital Drift',
        description: 'Space station capture. ISS verified optical source.',
        hash: '0xO3P4Q...5R6S',
        lat: '28.5729° N',
        lng: '80.6490° W',
        timestamp: '22:01 UTC',
    },
    {
        id: '5',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXkLmCdnEdW8THC8iPGG7Ca2WOZyALbrt9qyvha-uBqyujD3xV7Ca5oV9GcgqsOItRJwTJa2U1hdqH2XVo09gsGhAkxIUpS5ibofulSazKL4wjgeQZkB3JD3CLN7WLsxnazBK262BoJHpL4HR-eZitQ-8ALgXGo0GRc4JphiUwxvhxgwaXIHHe_idUOTQ3cQ0_YNI2GARri0LeRNcTJJbBg8Ml3Qga_wgvuBz0v8xXBbNQ6-TNUxVwNUiSyhH29MXjp2WGccyYotM',
        url: '#',
        height: 660,
        title: 'Mechanical Core',
        description: 'Industrial sector verified. Authentic mechanical composition.',
        hash: '0xT7U8V...9W0X',
        lat: '52.5200° N',
        lng: '13.4050° E',
        timestamp: '11:33 UTC',
    },
    {
        id: '6',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCu7Ns7gutaaAiGyNp5hwOZ7e0E0oYn2ZiyvHHJ9tiAHlI0WOaAck-q6jkLnDF7SL4PxqZuB5BW_OIfwyz8DfIQK_42BBTvnTiFzqSPMPI7Q_EbVSr9PfP6epFrTQ7zDwcUECJVcMBLWKw6IFgHqIV8gbsVOOroqhNC8DgnN_6h4li3djPrfRlkK1e3ICVz1x7UQJvRnjvlKXb0yxvTt7_DOuBjXH_bQSYpCFggspUhro-MiLoXrD1vBkmahl2qMIiksvRIgtADIN0',
        url: '#',
        height: 700,
        title: 'Light Trails',
        description: 'Long exposure verified. Motion blur analysis confirmed.',
        hash: '0xY1Z2A...3B4C',
        lat: '48.8566° N',
        lng: '2.3522° E',
        timestamp: '03:17 UTC',
    },
    {
        id: '7',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIm21OR215emlg5aAsy_pA1wk3ev_Lz_GuU7rdXrAImNX7jMzl686cc2Vp6maE2Je1dhD6SgiaS2FELXU7fxHgF8QYBa5-y0on4GPolUvPJHacwxhRs0tQL4s0DuRnw0Hyo24OVjfDYOlyAgtAe3cm7iYxFfrzAwWL2ELPA2T_rLeAgXAfFtK73uZ39c-tJ5w5_9m5esJerEQxnJ__cl9Xht18BJbJRSu7vlOVe1lom1aoR-c1_az5MmGcWM4PXw8hqapD363EzZI',
        url: '#',
        height: 670,
        title: 'Cyber Grid',
        description: 'Digital architecture verified. Pattern integrity confirmed.',
        hash: '0xD5E6F...7G8H',
        lat: '37.5665° N',
        lng: '126.9780° E',
        timestamp: '16:45 UTC',
    },
    {
        id: '8',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-udIvopAatUn7kZR1sTprT2fquuNO3ccYx9kI_2SIdBpsOdy2UGv2jxYanjcO9ugAB7n0HoTTtCIXfDzLKk6Lyrvb6Elz3yaWpCPBiwjT316p-DwLYTOSIruikNNCgwFaYkOId3Sh7YrFwH-UBCpFhx2t5hXTxTAEaYsFh4h7EzAQc6SLTt3dY51IBBVNEUync7y6Hx80SybLEHiIx-G4pTPCGKfzn9SzFDJJvx0BnV5mQ82pEpQsk0Ogw4xrsSVN0qk9K0tL0X8',
        url: '#',
        height: 640,
        title: 'Neural Pulse',
        description: 'AI visualization verified. Neural network output authentic.',
        hash: '0xI9J0K...1L2M',
        lat: '34.0522° N',
        lng: '118.2437° W',
        timestamp: '20:08 UTC',
    },
];

export default function TrendingPage() {
    const [timeFilter, setTimeFilter] = useState<'24h' | '7d' | 'all'>('24h');

    return (
        <div className="relative p-8 max-w-[1440px] mx-auto">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                <div>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter neon-glow-text">
                        GLOBAL PULSE
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-md text-sm md:text-base leading-relaxed">
                        The architectural heartbeat of the network. Real-time visual verification
                        and high-density artistic expression.
                    </p>
                </div>
                <TimeFilter value={timeFilter} onChange={setTimeFilter} />
            </div>

            {/* Rising Artists */}
            <RisingArtists artists={mockArtists} />

            {/* Masonry Grid */}
            <section className="mb-12">
                <h3 className="flex items-center gap-2 text-lg font-bold text-foreground uppercase tracking-widest mb-6">
                    <span className="size-2 rounded-full bg-primary animate-pulse" />
                    Trending Content
                </h3>
                <div className="h-[800px]">
                    <Masonry
                        items={mockMasonryItems}
                        animateFrom="bottom"
                        scaleOnHover
                        hoverScale={0.98}
                        blurToFocus
                    />
                </div>
            </section>

            {/* Global Activity Widget */}
            <GlobalActivityWidget />
        </div>
    );
}
