import Image from 'next/image';
import { Fingerprint, MapPin, Clock, ArrowRight, Shield } from 'lucide-react';
import ShinyText from '@/components/react-bits/ShinyText';

export function FeaturesSection() {
    return (
        <section id="concept" className="py-24 bg-background/50 relative border-y border-border">
            <div className="max-w-7xl mx-auto px-6">
                {/* Section Header */}
                <div className="mb-16">
                    <h2 className="font-display text-4xl font-bold uppercase tracking-tight mb-4">
                        Core <span className="text-primary">Architectures</span>
                    </h2>
                    <div className="h-1 w-20 bg-primary"></div>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Large Feature - Total Authenticity */}
                    <div className="md:col-span-2 bento-card p-8 flex flex-col justify-between group overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Shield className="size-32" strokeWidth={1} />
                        </div>
                        <div>
                            <div className="size-12 bg-primary/20 flex items-center justify-center mb-6">
                                <Fingerprint className="size-6 text-primary" />
                            </div>
                            <h3 className="font-display text-2xl font-bold uppercase mb-4">
                                <ShinyText
                                    text="Total Authenticity"
                                    speed={2.5}
                                    delay={0}
                                    color="#ffffff"
                                    shineColor="#00eeff"
                                    spread={120}
                                    direction="left"
                                />
                            </h3>
                            <p className="font-body text-muted-foreground max-w-md leading-relaxed">
                                Every image is an encrypted block on the chain. Our proprietary
                                hashing algorithm captures raw sensor data to ensure no pixel has
                                been modified since capture.
                            </p>
                        </div>
                        <a
                            href="#"
                            className="mt-8 flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-widest"
                        >
                            View Whitepaper <ArrowRight className="size-4" />
                        </a>
                    </div>

                    {/* Small Feature - GPS Verification */}
                    <div className="bento-card p-8 group border-t-4 border-t-primary/50">
                        <MapPin className="size-10 text-primary mb-6" strokeWidth={1.5} />
                        <h3 className="font-display text-xl font-bold uppercase mb-4">
                            <ShinyText
                                text="GPS Verification"
                                speed={2.5}
                                delay={0.3}
                                color="#ffffff"
                                shineColor="#00eeff"
                                spread={120}
                                direction="left"
                            />
                        </h3>
                        <p className="font-body text-sm text-muted-foreground leading-relaxed">
                            Integrated location metadata for every block. Precise geolocation
                            ensures context and provenance for journalism and art.
                        </p>
                    </div>

                    {/* Small Feature - Temporal Proof */}
                    <div className="bento-card p-8 group border-t-4 border-t-secondary/50">
                        <Clock className="size-10 text-secondary mb-6" strokeWidth={1.5} />
                        <h3 className="font-display text-xl font-bold uppercase mb-4">
                            <ShinyText
                                text="Temporal Proof"
                                speed={2.5}
                                delay={0.6}
                                color="#ffffff"
                                shineColor="#bc00ff"
                                spread={120}
                                direction="left"
                            />
                        </h3>
                        <p className="font-body text-sm text-muted-foreground leading-relaxed">
                            Immutable Unix timestamps anchored at the moment of capture. Time cannot
                            be falsified on the BRIX ledger.
                        </p>
                    </div>

                    {/* Large Feature with Image - The Concept */}
                    <div className="md:col-span-2 bento-card p-8 flex flex-col md:flex-row gap-8 items-center bg-linear-to-br from-primary/5 to-transparent">
                        <div className="w-full md:w-1/2 aspect-video relative rounded-sm overflow-hidden">
                            <Image
                                src="/images/FeaturesImage.png"
                                alt="Digital representation of encrypted data blocks"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-display text-2xl font-bold uppercase mb-4">
                                <ShinyText
                                    text="The Concept"
                                    speed={2.5}
                                    delay={0.9}
                                    color="#ffffff"
                                    shineColor="#bc00ff"
                                    spread={120}
                                    direction="left"
                                />
                            </h3>
                            <p className="font-body text-muted-foreground text-sm leading-relaxed mb-4">
                                Digital assets are no longer ephemeral. BRIX treats photography as
                                physical evidence, hard-coded into the digital fabric of the web.
                            </p>
                            <button className="text-xs font-mono uppercase tracking-widest p-2 border border-border hover:border-primary transition-colors">
                                Explorer Nodes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
