import {
    Header,
    HeroSection,
    FeaturesSection,
    MapSection,
    ArtistHub,
    RoadmapSection,
    Footer,
    LightningBackground,
} from '@/components/landing';

export default function Home() {
    return (
        <>
            {/* Lightning Background Effect */}
            <LightningBackground />

            <Header />

            <main>
                <HeroSection />
                <FeaturesSection />
                <MapSection />
                <ArtistHub />
                <RoadmapSection />
            </main>

            <Footer />
        </>
    );
}
