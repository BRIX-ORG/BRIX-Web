'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import CircularGallery, { GalleryItem } from '@/components/react-bits/CircularGallery';
import { useGetTopAuthors } from '@/hooks/apis/brick.api';
import { useGetTopUsers } from '@/hooks/apis/user.api';
import { getAvatarUrl, getCloudinaryAvatar } from '@/utils/cloudinary';

export function RisingArtists() {
    const t = useTranslations('trending');
    const tSearch = useTranslations('search');
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'authors' | 'users'>('authors');

    const { data: authorsData, isLoading: isLoadingAuthors } = useGetTopAuthors(12);
    const { data: usersData, isLoading: isLoadingUsers } = useGetTopUsers(12);

    const galleryItems: GalleryItem[] = useMemo(() => {
        if (activeTab === 'authors' && authorsData?.pages[0]?.data) {
            return authorsData.pages[0].data.map((author) => ({
                image: getCloudinaryAvatar(getAvatarUrl(author.avatar, author.gender)),
                text: `${author.username} • ${author.totalVotes} ${tSearch('card.brick')}`,
                url: `/dashboard/artist/${author.username}`,
            }));
        }
        if (activeTab === 'users' && usersData?.pages[0]?.data) {
            return usersData.pages[0].data.map((user) => ({
                image: getCloudinaryAvatar(getAvatarUrl(user.avatar, user.gender)),
                text: `${user.username} • ${user.totalFollowers} ${t('risingArtists.flws')}`,
                url: `/dashboard/artist/${user.username}`,
            }));
        }
        return [];
    }, [activeTab, authorsData, usersData, t, tSearch]);

    const handleItemClick = (item: GalleryItem) => {
        if (item.url) {
            router.push(item.url);
        }
    };

    const isLoading = activeTab === 'authors' ? isLoadingAuthors : isLoadingUsers;

    return (
        <section className="mb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 px-2 gap-4 border-b border-primary/10">
                <h3 className="flex items-center gap-2 text-lg font-bold text-foreground tracking-widest shrink-0 uppercase mb-4 md:mb-0 md:pb-4 border-b-2 border-transparent">
                    <span className="size-2 rounded-full bg-primary animate-pulse" />
                    {t('risingArtists.title')}
                </h3>

                <div className="flex items-center gap-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
                    <button
                        type="button"
                        onClick={() => setActiveTab('authors')}
                        className={`pb-4 border-b-2 text-sm font-bold uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer ${
                            activeTab === 'authors'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Star className="size-4" />
                        {t('risingArtists.authors')}
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('users')}
                        className={`pb-4 border-b-2 text-sm font-bold uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer ${
                            activeTab === 'users'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Users className="size-4" />
                        {t('risingArtists.users')}
                    </button>
                </div>
            </div>

            <div className="h-80 -mx-8 relative">
                {isLoading ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                        <div className="w-48 h-48 rounded-xl bg-primary/20 animate-pulse" />
                        <div className="w-32 h-6 bg-primary/20 animate-pulse rounded" />
                    </div>
                ) : galleryItems.length > 0 ? (
                    <CircularGallery
                        items={galleryItems}
                        bend={2}
                        textColor="#00eeff"
                        borderRadius={0.5}
                        font="bold 16px 'Space Grotesk', sans-serif"
                        scrollSpeed={1.5}
                        scrollEase={0.06}
                        onItemClick={handleItemClick}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        {t('risingArtists.empty')}
                    </div>
                )}
            </div>
        </section>
    );
}
