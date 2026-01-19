const milestones = [
    {
        quarter: 'Q1 2026',
        status: 'COMPLETED',
        title: 'Protocol Genesis',
        description: 'Deployment of the immutable storage layer and metadata hashing core.',
        color: 'secondary',
        completed: true,
    },
    {
        quarter: 'Q3 2026',
        status: 'IN PROGRESS',
        title: 'Global Mesh Mapping',
        description: 'Launching the real-time map interface and artist verification hub.',
        color: 'primary',
        completed: false,
    },
    {
        quarter: 'Q1 2027',
        status: 'PLANNED',
        title: 'Decentralized Rendering',
        description: 'Implementation of P2P image processing and distribution nodes.',
        color: 'muted',
        completed: false,
    },
];

export function RoadmapSection() {
    return (
        <section id="roadmap" className="py-24 bg-background border-t border-border">
            <div className="max-w-4xl mx-auto px-6">
                {/* Section Header */}
                <h2 className="font-display text-4xl font-bold uppercase mb-16 text-center">
                    Development <span className="text-primary">Timeline</span>
                </h2>

                {/* Timeline */}
                <div className="relative border-l border-border ml-4 space-y-16">
                    {milestones.map((milestone) => (
                        <div key={milestone.title} className="relative pl-8">
                            {/* Dot */}
                            <div
                                className={`absolute -left-1.5 top-0 size-3 rounded-full ${
                                    milestone.color === 'secondary'
                                        ? 'bg-secondary shadow-[0_0_10px_#BC00FF]'
                                        : milestone.color === 'primary'
                                          ? 'bg-primary shadow-[0_0_10px_#00eeff]'
                                          : 'border border-muted-foreground bg-background'
                                }`}
                            ></div>

                            {/* Content */}
                            <span
                                className={`font-mono text-[10px] uppercase tracking-widest mb-2 block ${
                                    milestone.color === 'secondary'
                                        ? 'text-secondary/60'
                                        : milestone.color === 'primary'
                                          ? 'text-primary/60'
                                          : 'text-muted-foreground'
                                }`}
                            >
                                {milestone.quarter} - {milestone.status}
                            </span>
                            <h3 className="font-display text-xl font-bold uppercase mb-2">
                                {milestone.title}
                            </h3>
                            <p className="font-body text-muted-foreground text-sm">
                                {milestone.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
