import React, { useEffect, useRef, useState } from "react";
import "./Landing.css";
import ConnectSpotifyButton from "../components/ConnectSpotifyButton";

type OrbData = {
    id: number;
    size: number;
    baseX: number;
    baseY: number;
    opacity: number;
    influence: number;
    noiseSeedX: number;
    noiseSeedY: number;
    swirlBias: number;
};

type PointerState = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    speed: number;
    active: boolean;
};

type OrbRuntime = {
    x: number;
    y: number;
    vx: number;
    vy: number;
};

const ORB_COUNT = 9;
const MAX_POINTER_SPEED = 1;
const MAX_ORB_PUSH = 1;
const spotifyLogo = "/Spotify_Full_Logo_RGB_White.png";
const githubUrl = "https://github.com/tanman0110";

function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
}

function createOrbs(): OrbData[] {
    return Array.from({ length: ORB_COUNT }, (_, index) => ({
        id: index,
        size: 260 + Math.random() * 260,
        baseX: 12 + Math.random() * 76,
        baseY: 14 + Math.random() * 72,
        opacity: 0.14 + Math.random() * 0.16,
        influence: 0.8 + Math.random() * 0.9,
        noiseSeedX: Math.random() * 1000,
        noiseSeedY: Math.random() * 1000,
        swirlBias: Math.random() > 0.5 ? 1 : -1,
    }));
}

function createOrbRuntime(orbs: OrbData[]): OrbRuntime[] {
    return orbs.map((orb) => ({
        x: orb.baseX,
        y: orb.baseY,
        vx: 0,
        vy: 0,
    }));
}

function layeredNoise(seed: number, t: number) {
    return (
        Math.sin(t * 0.43 + seed) * 0.9 +
        Math.sin(t * 0.81 + seed * 1.7) * 0.55 +
        Math.sin(t * 1.37 + seed * 0.63) * 0.25
    );
}

export default function Landing() {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const orbRefs = useRef<(HTMLDivElement | null)[]>([]);
    const lastMouseRef = useRef<{ x: number; y: number; t: number } | null>(
        null
    );
    const lastFrameRef = useRef<number | null>(null);

    const [orbs] = useState<OrbData[]>(() => createOrbs());

    const runtimeRef = useRef<OrbRuntime[]>(createOrbRuntime(orbs));

    const pointerRef = useRef<PointerState>({
        x: 50,
        y: 50,
        vx: 0,
        vy: 0,
        speed: 0,
        active: false,
    });

    const smoothPointerRef = useRef<PointerState>({
        x: 50,
        y: 50,
        vx: 0,
        vy: 0,
        speed: 0,
        active: false,
    });

    useEffect(() => {
        let frameId = 0;

        const animate = (now: number) => {
            const previous = lastFrameRef.current ?? now;
            const dtMs = now - previous;
            lastFrameRef.current = now;

            const dt = clamp(dtMs / 16.6667, 0.6, 1.8);
            const t = now / 1000;

            const pointer = pointerRef.current;
            const smooth = smoothPointerRef.current;

            smooth.x += (pointer.x - smooth.x) * 0.18 * dt;
            smooth.y += (pointer.y - smooth.y) * 0.18 * dt;
            smooth.vx += (pointer.vx - smooth.vx) * 0.16 * dt;
            smooth.vy += (pointer.vy - smooth.vy) * 0.16 * dt;
            smooth.speed += (pointer.speed - smooth.speed) * 0.16 * dt;
            smooth.active = pointer.active;

            for (let i = 0; i < orbs.length; i++) {
                const orb = orbs[i];
                const state = runtimeRef.current[i];
                const el = orbRefs.current[i];
                if (!el || !state) continue;

                const toBaseX = orb.baseX - state.x;
                const toBaseY = orb.baseY - state.y;

                const noiseX =
                    layeredNoise(orb.noiseSeedX, t * (0.7 + i * 0.03)) * 0.16 +
                    layeredNoise(orb.noiseSeedX + 41.2, t * 1.8) * 0.04;

                const noiseY =
                    layeredNoise(orb.noiseSeedY, t * (0.75 + i * 0.025)) * 0.16 +
                    layeredNoise(orb.noiseSeedY + 19.4, t * 1.65) * 0.04;

                let ax = toBaseX * 0.0035 + noiseX;
                let ay = toBaseY * 0.0035 + noiseY;

                if (smooth.active) {
                    const dx = state.x - smooth.x;
                    const dy = state.y - smooth.y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

                    const nx = dx / dist;
                    const ny = dy / dist;

                    const proximity = clamp(1 - dist / 30, 0, 1);
                    const speedFactor = smooth.speed / MAX_POINTER_SPEED;

                    const push =
                        proximity *
                        (0.22 + speedFactor * 0.34) *
                        orb.influence;

                    const tangentX = -ny * orb.swirlBias;
                    const tangentY = nx * orb.swirlBias;

                    const directionalTurbulence =
                        layeredNoise(orb.noiseSeedX + orb.noiseSeedY, t * 2.6) *
                        0.12;

                    ax +=
                        nx * push * 0.55 +
                        tangentX * push * (0.55 + directionalTurbulence);

                    ay +=
                        ny * push * 0.55 +
                        tangentY * push * (0.55 + directionalTurbulence);

                    ax += smooth.vx * proximity * 0.045 * orb.influence;
                    ay += smooth.vy * proximity * 0.045 * orb.influence;

                    ax +=
                        layeredNoise(orb.noiseSeedX + i * 11, t * 4.4) *
                        proximity *
                        0.08;
                    ay +=
                        layeredNoise(orb.noiseSeedY + i * 17, t * 4.1) *
                        proximity *
                        0.08;
                }

                state.vx += ax * dt;
                state.vy += ay * dt;

                const maxVelocity = MAX_ORB_PUSH * (0.55 + orb.influence * 0.22);
                const velocityMagnitude = Math.hypot(state.vx, state.vy);

                if (velocityMagnitude > maxVelocity) {
                    const scale = maxVelocity / velocityMagnitude;
                    state.vx *= scale;
                    state.vy *= scale;
                }

                state.vx *= 0.94;
                state.vy *= 0.94;

                state.x += state.vx * dt;
                state.y += state.vy * dt;

                const scale =
                    1 +
                    layeredNoise(orb.noiseSeedX * 0.5, t * 1.4) * 0.018 +
                    layeredNoise(orb.noiseSeedY * 0.5, t * 0.95) * 0.02;

                const activeBoost = smooth.active
                    ? clamp(
                        1 - Math.hypot(smooth.x - state.x, smooth.y - state.y) / 34,
                        0,
                        1
                    ) * 0.07
                    : 0;

                el.style.left = `${state.x}%`;
                el.style.top = `${state.y}%`;
                el.style.opacity = `${orb.opacity + activeBoost}`;
                el.style.transform = `translate3d(-50%, -50%, 0) scale(${scale + activeBoost})`;
            }

            frameId = requestAnimationFrame(animate);
        };

        frameId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(frameId);
        };
    }, [orbs]);

    useEffect(() => {
        const handleWindowMouseLeave = () => {
            pointerRef.current = {
                ...pointerRef.current,
                vx: 0,
                vy: 0,
                speed: 0,
                active: false,
            };
            lastMouseRef.current = null;
        };

        window.addEventListener("mouseleave", handleWindowMouseLeave);

        return () => {
            window.removeEventListener("mouseleave", handleWindowMouseLeave);
        };
    }, []);

    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        const now = performance.now();

        const last = lastMouseRef.current;
        let vx = 0;
        let vy = 0;
        let speed = 0;

        if (last) {
            const dt = Math.max(8, now - last.t);
            vx = ((x - last.x) / dt) * 16;
            vy = ((y - last.y) / dt) * 16;
            speed = Math.sqrt(vx * vx + vy * vy);
        }

        const clampedSpeed = clamp(speed, 0, MAX_POINTER_SPEED);
        const velocityScale =
            speed > 0 ? clampedSpeed / Math.max(speed, 0.0001) : 1;

        pointerRef.current = {
            x,
            y,
            vx: vx * velocityScale,
            vy: vy * velocityScale,
            speed: clampedSpeed,
            active: true,
        };

        lastMouseRef.current = { x, y, t: now };
    };

    const handleMouseLeave = () => {
        pointerRef.current = {
            ...pointerRef.current,
            vx: 0,
            vy: 0,
            speed: 0,
            active: false,
        };
        lastMouseRef.current = null;
    };

    return (
        <div
            ref={containerRef}
            className="landing"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <div className="landing-noise" />
            <div className="landing-vignette" />

            <div className="smoke-layer" aria-hidden="true">
                {orbs.map((orb, index) => (
                    <div
                        key={orb.id}
                        ref={(node) => {
                            orbRefs.current[index] = node;
                        }}
                        className="smoke-orb"
                        style={{
                            width: `${orb.size}px`,
                            height: `${orb.size}px`,
                            opacity: orb.opacity,
                        }}
                    />
                ))}
            </div>

            <img
                className="landing-spotify-logo"
                src={spotifyLogo}
                alt="Spotify"
            />

            <main className="landing-content">
                <p className="landing-kicker">
                    This is an independent third-party application and is not affiliated with, endorsed by, or sponsored by Spotify.
                </p>

                <h1 className="landing-title">
                    Welcome to your
                    <span> Music Wrapped</span>
                </h1>

                <p className="landing-subtitle">
                    Connect your Spotify account to explore your top tracks,
                    artists, albums, and listening trends.
                </p>

                <div className="landing-actions">
                    <ConnectSpotifyButton />
                </div>
            </main>

            <footer className="landing-footer">
                <span>Built with React by Tanner Henning-Inman</span>
                <span className="landing-footer-separator">•</span>
                <a
                    href={githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Tanner Henning-Inman GitHub profile"
                >
                    GitHub
                </a>
            </footer>
        </div>
    );
}