import React from 'react';
import Image from 'next/image';

interface ReflectiveCardProps {
    blurStrength?: number;
    color?: string;
    metalness?: number;
    roughness?: number;
    overlayColor?: string;
    displacementStrength?: number;
    noiseScale?: number;
    specularConstant?: number;
    grayscale?: number;
    glassDistortion?: number;
    className?: string;
    style?: React.CSSProperties;
    imageSrc?: string;
    children?: React.ReactNode;
}

const ReflectiveCard: React.FC<ReflectiveCardProps> = ({
    blurStrength = 12,
    color = 'white',
    metalness = 1,
    roughness = 0.4,
    overlayColor = 'rgba(255, 255, 255, 0.1)',
    displacementStrength = 20,
    noiseScale = 1,
    specularConstant = 1.2,
    grayscale = 1,
    glassDistortion = 0,
    className = '',
    style = {},
    imageSrc,
    children,
}) => {
    const baseFrequency = 0.03 / Math.max(0.1, noiseScale);
    const saturation = 1 - Math.max(0, Math.min(1, grayscale));

    const cssVariables = {
        '--blur-strength': `${blurStrength}px`,
        '--metalness': metalness,
        '--roughness': roughness,
        '--overlay-color': overlayColor,
        '--text-color': color,
        '--saturation': saturation,
    } as React.CSSProperties;

    // Default cyber grid pattern if no image is provided or loading fails
    const fallbackImage =
        'data:image/svg+xml,%3Csvg%20width%3D%27100%27%20height%3D%27100%27%20viewBox%3D%270%200%20100%20100%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cpath%20d%3D%27M0%200h100v100H0z%27%20fill%3D%27%23050505%27%2F%3E%3Cpath%20d%3D%27M0%200h100v100H0z%27%20fill%3D%27url(%23grid)%27%2F%3E%3Cdefs%3E%3Cpattern%20id%3D%27grid%27%20width%3D%2710%27%20height%3D%2710%27%20patternUnits%3D%27userSpaceOnUse%27%3E%3Cpath%20d%3D%27M10%200H0v10%27%20fill%3D%27none%27%20stroke%3D%27rgba(0%2C238%2C255%2C0.2)%27%20stroke-width%3D%270.5%27%2F%3E%3C%2Fpattern%3E%3C%2Fdefs%3E%3C%2Fsvg%3E';

    return (
        <div
            className={`relative w-full max-w-[400px] aspect-[2/3] rounded-[24px] overflow-hidden bg-[#0A0A0A] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05)_inset] isolate font-sans ${className}`}
            style={{ ...style, ...cssVariables }}
        >
            <svg className="absolute w-0 h-0 pointer-events-none opacity-0" aria-hidden="true">
                <defs>
                    <filter id="metallic-displacement" x="-50%" y="-50%" width="200%" height="200%">
                        <feTurbulence
                            type="turbulence"
                            baseFrequency={baseFrequency}
                            numOctaves="2"
                            result="noise"
                        />
                        <feColorMatrix in="noise" type="luminanceToAlpha" result="noiseAlpha" />
                        <feDisplacementMap
                            in="SourceGraphic"
                            in2="noise"
                            scale={displacementStrength}
                            xChannelSelector="R"
                            yChannelSelector="G"
                            result="rippled"
                        />
                        <feSpecularLighting
                            in="noiseAlpha"
                            surfaceScale={displacementStrength}
                            specularConstant={specularConstant}
                            specularExponent="20"
                            lightingColor="#ffffff"
                            result="light"
                        >
                            <fePointLight x="0" y="0" z="300" />
                        </feSpecularLighting>
                        <feComposite in="light" in2="rippled" operator="in" result="light-effect" />
                        <feBlend
                            in="light-effect"
                            in2="rippled"
                            mode="screen"
                            result="metallic-result"
                        />
                        <feColorMatrix
                            in="SourceAlpha"
                            type="matrix"
                            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
                            result="solidAlpha"
                        />
                        <feMorphology
                            in="solidAlpha"
                            operator="erode"
                            radius="45"
                            result="erodedAlpha"
                        />
                        <feGaussianBlur in="erodedAlpha" stdDeviation="15" result="blurredMap" />
                        <feComponentTransfer in="blurredMap" result="glassMap">
                            <feFuncA type="linear" slope="0.5" intercept="0" />
                        </feComponentTransfer>
                        <feDisplacementMap
                            in="metallic-result"
                            in2="glassMap"
                            scale={glassDistortion}
                            xChannelSelector="A"
                            yChannelSelector="A"
                            result="final"
                        />
                    </filter>
                </defs>
            </svg>

            {/* Base Image Layer for Reflection effect */}
            {imageSrc ? (
                <Image
                    src={imageSrc}
                    alt="Reflection source"
                    fill
                    className="absolute top-0 left-0 w-full h-full object-cover scale-[1.15] z-0 opacity-80"
                    style={{
                        filter: 'saturate(var(--saturation, 0)) contrast(130%) brightness(100%) blur(var(--blur-strength, 12px)) url(#metallic-displacement)',
                    }}
                />
            ) : (
                <div
                    className="absolute top-0 left-0 w-full h-full object-cover scale-[1.15] z-0 opacity-80"
                    style={{
                        backgroundImage: `url("${fallbackImage}")`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'saturate(var(--saturation, 0)) contrast(130%) brightness(100%) blur(var(--blur-strength, 12px)) url(#metallic-displacement)',
                    }}
                />
            )}

            {/* Noise & Lighting Overlays */}
            <div className="absolute inset-0 z-10 opacity-[var(--roughness,0.4)] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%270%200%20200%20200%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cfilter%20id%3D%27noiseFilter%27%3E%3CfeTurbulence%20type%3D%27fractalNoise%27%20baseFrequency%3D%270.8%27%20numOctaves%3D%273%27%20stitchTiles%3D%27stitch%27%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%27100%25%27%20height%3D%27100%25%27%20filter%3D%27url(%23noiseFilter)%27%2F%3E%3C%2Fsvg%3E')] mix-blend-overlay" />

            <div className="absolute inset-0 z-20 bg-[linear-gradient(135deg,rgba(255,255,255,0.25)_0%,rgba(255,255,255,0.05)_40%,rgba(255,255,255,0)_50%,rgba(255,255,255,0.05)_60%,rgba(255,255,255,0.15)_100%)] pointer-events-none mix-blend-overlay opacity-[var(--metalness,1)]" />

            <div className="absolute inset-0 rounded-[24px] p-[1px] bg-[linear-gradient(135deg,rgba(0,238,255,0.4)_0%,rgba(255,255,255,0.1)_50%,rgba(188,0,255,0.4)_100%)] [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [mask-composite:exclude] z-20 pointer-events-none" />

            {/* Main Content Area */}
            <div className="relative z-30 h-full flex flex-col justify-between text-[var(--text-color,white)] bg-[var(--overlay-color,rgba(0,0,0,0.4))]">
                {children}
            </div>
        </div>
    );
};

export default ReflectiveCard;
