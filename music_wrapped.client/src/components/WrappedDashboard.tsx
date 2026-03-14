import { useEffect, useMemo, useState } from "react";
import { useWrappedData } from "../hooks/useWrappedData";
import LoadingScreen from "./LoadingScreen";
import "./WrappedDashboard.css";
import type {
    SpotifyArtist,
    SpotifyTrack,
    TimeRange,
    WrappedData,
} from "../types/spotifyTypes";

type Props = {
    token: string;
    userName: string | null;
    initialRange: TimeRange;
    onStartOver?: () => void;
};

type Slide = {
    id: string;
    kind: "chapter" | "section";
    eyebrow: string;
    title: string;
    body?: string;
    content?: React.ReactNode;
};

// Spotify logo on main page
const spotifyLogo = `${import.meta.env.BASE_URL}Spotify_Full_Logo_RGB_White.png`;
function formatDuration(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function renderTrackLabel(track: SpotifyTrack) {
    return `${track.name} — ${track.artists.map((a) => a.name).join(", ")}`;
}

function getTimeRangeLabel(range: TimeRange) {
    switch (range) {
        case "short_term":
            return "Past Month";
        case "medium_term":
            return "6 Months";
        case "long_term":
            return "All Time";
        default:
            return "Your Range";
    }
}

function getSpotifyProfileUrl(username: string | null) {
    if (!username) return "https://open.spotify.com/";
    return `https://open.spotify.com/user/${encodeURIComponent(username)}`;
}

function SpotifyLink({
    url,
    label,
}: {
    url: string | null | undefined;
    label: string;
}) {
    if (!url) return null;

    return (
        <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="spotify-link"
            aria-label={label}
            title={label}
        >
            <img
                src={spotifyLogo}
                alt="Spotify"
                className="spotify-link__icon"
            />
            <span className="spotify-link__text">Open</span>
        </a>
    );
}

function getArtistImage(artist: SpotifyArtist) {
    return artist.images?.[0]?.url ?? null;
}

function getTopArtistMap(topArtists: SpotifyArtist[]) {
    return new Map(topArtists.map((artist) => [artist.id, artist]));
}

// Wrapped Slides
function buildSlides(
    data: WrappedData,
    userName: string | null,
    timeRange: TimeRange,
    onStartOver?: () => void
): Slide[] {
    const topArtists = data.topArtists.slice(0, 10);
    const topTracks = data.topTracks.slice(0, 10);
    const topAlbums = data.topAlbums.slice(0, 10);
    const recurringArtists = data.topRecurringArtists.slice(0, 10);
    const topArtistMap = getTopArtistMap(data.topArtists);

    return [
        //Listening Profile Slide 1
        {
            id: "listening-profile",
            kind: "section",
            eyebrow: `${getTimeRangeLabel(timeRange)} • Your recap starts here`,
            title: "Your listening profile",
            content: (
                <div className="story-grid story-grid--single">
                    <div className="story-card story-card--hero">
                        <p className="story-badge">Your pattern</p>
                        <h2 className="story-featureTitle">
                            {data.listeningProfile.title}
                        </h2>
                        <p className="story-featureText">
                            {data.listeningProfile.description}
                        </p>
                        <p className="story-supportText">
                            Built from your top listening data for the selected time range.
                        </p>
                    </div>
                </div>
            ),
        },
        // Quick Stats Slides 2-3
        {
            id: "chapter-quick-stats",
            kind: "chapter",
            eyebrow: "Next up",
            title: "A few numbers that shaped this snapshot",
            body: "Before the favorites, here’s a quick look at the listening patterns behind them.",
        },
        {
            id: "quick-stats",
            kind: "section",
            eyebrow: "Quick Stats",
            title: "The numbers behind your listening snapshot",
            content: (
                <div className="story-grid story-grid--stats">
                    {data.summaryStats.map((stat) => (
                        <div key={stat.label} className="story-card stat-card">
                            <span className="stat-card__label">{stat.label}</span>
                            <strong className="stat-card__value">{stat.value}</strong>
                        </div>
                    ))}
                </div>
            ),
        },
        // Highlights slides 4-5
        {
            id: "chapter-highlights",
            kind: "chapter",
            eyebrow: "Highlights ahead",
            title: "A few moments stood out more than the rest",
            body: "These were the biggest standouts across your top music data.",
        },
        {
            id: "highlights",
            kind: "section",
            eyebrow: "Highlights",
            title: "Standout moments from your music recap",
            content: (
                <div className="story-grid story-grid--compactSix">
                    <div className="story-card">
                        <span className="story-miniLabel">Top artist</span>
                        <strong className="story-cardTitle">
                            {data.topArtists[0]?.name ?? "N/A"}
                        </strong>
                        {data.topArtists[0] ? (
                            <div className="highlight-mediaRow">
                                {getArtistImage(data.topArtists[0]) ? (
                                    <img
                                        src={getArtistImage(data.topArtists[0]) ?? ""}
                                        alt={data.topArtists[0].name}
                                        className="highlight-thumb highlight-thumb--artist"
                                    />
                                ) : null}
                                <SpotifyLink
                                    url={data.topArtists[0].external_urls?.spotify}
                                    label={`Open ${data.topArtists[0].name} on Spotify`}
                                />
                            </div>
                        ) : null}
                    </div>

                    <div className="story-card">
                        <span className="story-miniLabel">Top track</span>
                        <strong className="story-cardTitle">
                            {data.topTracks[0] ? renderTrackLabel(data.topTracks[0]) : "N/A"}
                        </strong>
                        {data.topTracks[0] ? (
                            <div className="highlight-mediaRow">
                                {data.topTracks[0].album.images?.[0]?.url ? (
                                    <img
                                        src={data.topTracks[0].album.images[0].url}
                                        alt={data.topTracks[0].album.name}
                                        className="highlight-thumb"
                                    />
                                ) : null}
                                <SpotifyLink
                                    url={data.topTracks[0].external_urls?.spotify}
                                    label={`Open ${data.topTracks[0].name} on Spotify`}
                                />
                            </div>
                        ) : null}
                    </div>

                    <div className="story-card">
                        <span className="story-miniLabel">Most recurring artist</span>
                        <strong className="story-cardTitle">
                            {data.topRecurringArtists[0]
                                ? `${data.topRecurringArtists[0].artistName} (${data.topRecurringArtists[0].trackCount} tracks)`
                                : "N/A"}
                        </strong>
                        {data.topRecurringArtists[0] ? (
                            <div className="highlight-mediaRow">
                                {topArtistMap.get(data.topRecurringArtists[0].artistId)?.images?.[0]?.url ? (
                                    <img
                                        src={
                                            topArtistMap.get(data.topRecurringArtists[0].artistId)?.images?.[0]
                                                ?.url ?? ""
                                        }
                                        alt={data.topRecurringArtists[0].artistName}
                                        className="highlight-thumb highlight-thumb--artist"
                                    />
                                ) : null}
                                <SpotifyLink
                                    url={
                                        topArtistMap.get(data.topRecurringArtists[0].artistId)
                                            ?.external_urls?.spotify
                                    }
                                    label={`Open ${data.topRecurringArtists[0].artistName} on Spotify`}
                                />
                            </div>
                        ) : null}
                    </div>

                    <div className="story-card">
                        <span className="story-miniLabel">Most recurring album</span>
                        <strong className="story-cardTitle">
                            {data.topAlbums[0]
                                ? `${data.topAlbums[0].albumName} — ${data.topAlbums[0].artistNames.join(", ")}`
                                : "N/A"}
                        </strong>
                        {data.topAlbums[0] ? (
                            <>
                                <span className="story-cardMeta">
                                    {data.topAlbums[0].trackCount} top tracks from this album
                                </span>
                                <div className="highlight-mediaRow">
                                    {data.topAlbums[0].imageUrl ? (
                                        <img
                                            src={data.topAlbums[0].imageUrl}
                                            alt={data.topAlbums[0].albumName}
                                            className="highlight-thumb"
                                        />
                                    ) : null}
                                    <SpotifyLink
                                        url={data.topAlbums[0].spotifyUrl}
                                        label={`Open ${data.topAlbums[0].albumName} on Spotify`}
                                    />
                                </div>
                            </>
                        ) : null}
                    </div>

                    <div className="story-card">
                        <span className="story-miniLabel">Longest top track</span>
                        <strong className="story-cardTitle">
                            {data.longestTrack
                                ? renderTrackLabel(data.longestTrack)
                                : "N/A"}
                        </strong>
                        {data.longestTrack ? (
                            <>
                                <span className="story-cardMeta">
                                    {formatDuration(data.longestTrack.duration_ms)}
                                </span>
                                <div className="highlight-mediaRow">
                                    {data.longestTrack.album.images?.[0]?.url ? (
                                        <img
                                            src={data.longestTrack.album.images[0].url}
                                            alt={data.longestTrack.album.name}
                                            className="highlight-thumb"
                                        />
                                    ) : null}
                                    <SpotifyLink
                                        url={data.longestTrack.external_urls?.spotify}
                                        label={`Open ${data.longestTrack.name} on Spotify`}
                                    />
                                </div>
                            </>
                        ) : null}
                    </div>

                    <div className="story-card">
                        <span className="story-miniLabel">Shortest top track</span>
                        <strong className="story-cardTitle">
                            {data.shortestTrack
                                ? renderTrackLabel(data.shortestTrack)
                                : "N/A"}
                        </strong>
                        {data.shortestTrack ? (
                            <>
                                <span className="story-cardMeta">
                                    {formatDuration(data.shortestTrack.duration_ms)}
                                </span>
                                <div className="highlight-mediaRow">
                                    {data.shortestTrack.album.images?.[0]?.url ? (
                                        <img
                                            src={data.shortestTrack.album.images[0].url}
                                            alt={data.shortestTrack.album.name}
                                            className="highlight-thumb"
                                        />
                                    ) : null}
                                    <SpotifyLink
                                        url={data.shortestTrack.external_urls?.spotify}
                                        label={`Open ${data.shortestTrack.name} on Spotify`}
                                    />
                                </div>
                            </>
                        ) : null}
                    </div>
                </div>
            ),
        },
        // Top Artist Slides 6-7
        {
            id: "chapter-top-artists",
            kind: "chapter",
            eyebrow: "Artists",
            title: "These artists showed up the most in your listening",
            body: "The names that had the biggest presence in this time range.",
        },
        {
            id: "top-artists",
            kind: "section",
            eyebrow: "Top Artists",
            title: "Your top 10 artists",
            content: (
                <div className="media-grid media-grid--ten">
                    {topArtists.map((artist, index) => (
                        <div key={artist.id} className="media-grid-card">
                            <div className="media-grid-card__rank">{index + 1}.</div>

                            {artist.images?.[0]?.url ? (
                                <img
                                    src={artist.images[0].url}
                                    alt={artist.name}
                                    className="media-grid-card__image media-grid-card__image--artist"
                                />
                            ) : (
                                <div className="media-grid-card__image media-grid-card__image--artist media-grid-card__image--fallback">
                                    {artist.name.charAt(0)}
                                </div>
                            )}

                            <div className="media-grid-card__meta">
                                <strong className="media-grid-card__title">{artist.name}</strong>
                                <span className="media-grid-card__subtext">
                                    {artist.genres?.slice(0, 2).join(" • ") || "Featured in your top listening"}
                                </span>
                            </div>

                            <SpotifyLink
                                url={artist.external_urls?.spotify}
                                label={`Open ${artist.name} on Spotify`}
                            />
                        </div>
                    ))}
                </div>
            ),
        },
        // Top Tracks Slides 8-9
        {
            id: "chapter-top-tracks",
            kind: "chapter",
            eyebrow: "Tracks",
            title: "These songs made the strongest impression",
            body: "The tracks that defined the sound of this recap.",
        },
        {
            id: "top-tracks",
            kind: "section",
            eyebrow: "Top Tracks",
            title: "Your top 10 tracks",
            content: (
                <div className="media-grid media-grid--ten">
                    {topTracks.map((track, index) => (
                        <div key={track.id} className="media-grid-card">
                            <div className="media-grid-card__rank">{index + 1}.</div>

                            {track.album.images?.[0]?.url ? (
                                <img
                                    src={track.album.images[0].url}
                                    alt={track.album.name}
                                    className="media-grid-card__image"
                                />
                            ) : (
                                <div className="media-grid-card__image media-grid-card__image--fallback">
                                    ♪
                                </div>
                            )}

                            <div className="media-grid-card__meta">
                                <strong className="media-grid-card__title">{track.name}</strong>
                                <span className="media-grid-card__subtext">
                                    {track.artists.map((artist) => artist.name).join(", ")}
                                </span>
                                <span className="media-grid-card__subtext">
                                    {track.album.name} • {formatDuration(track.duration_ms)}
                                </span>
                            </div>

                            <SpotifyLink
                                url={track.external_urls?.spotify}
                                label={`Open ${track.name} on Spotify`}
                            />
                        </div>
                    ))}
                </div>
            ),
        },
        // Top ALbums Slides 10-11
        {
            id: "chapter-top-albums",
            kind: "chapter",
            eyebrow: "Albums",
            title: "A few albums kept resurfacing in your top tracks",
            body: "These are the projects that appeared the most across your top songs.",
        },
        {
            id: "top-albums",
            kind: "section",
            eyebrow: "Top Albums",
            title: "Your top 10 albums",
            content: (
                <div className="media-grid media-grid--ten">
                    {topAlbums.map((album, index) => (
                        <div key={album.albumId} className="media-grid-card">
                            <div className="media-grid-card__rank">{index + 1}.</div>

                            {album.imageUrl ? (
                                <img
                                    src={album.imageUrl}
                                    alt={album.albumName}
                                    className="media-grid-card__image"
                                />
                            ) : (
                                <div className="media-grid-card__image media-grid-card__image--fallback">
                                    ♫
                                </div>
                            )}

                            <div className="media-grid-card__meta">
                                <strong className="media-grid-card__title">
                                    {album.albumName}
                                </strong>
                                <span className="media-grid-card__subtext">
                                    {album.artistNames.join(", ")}
                                </span>
                                <span className="media-grid-card__subtext">
                                    {album.trackCount} top track
                                    {album.trackCount === 1 ? "" : "s"} from this album
                                </span>
                            </div>

                            <SpotifyLink
                                url={album.spotifyUrl}
                                label={`Open ${album.albumName} on Spotify`}
                            />
                        </div>
                    ))}
                </div>
            ),
        },
        // Recurring Artists Slides 12-13
        {
            id: "chapter-recurring-artists",
            kind: "chapter",
            eyebrow: "Repeat appearances",
            title: "Some artists kept appearing across your favorite tracks",
            body: "These are the artists who surfaced most often in your top songs.",
        },
        {
            id: "recurring-artists",
            kind: "section",
            eyebrow: "Recurring Artists",
            title: "Most recurring artists in your top tracks",
            content: (
                <div className="recurring-list recurring-list--ten">
                    {recurringArtists.map((artist, index) => {
                        const sourceArtist = topArtistMap.get(artist.artistId);

                        return (
                            <div key={artist.artistId} className="recurring-list-item">
                                <div className="recurring-list-item__rank">{index + 1}.</div>

                                {sourceArtist?.images?.[0]?.url ? (
                                    <img
                                        src={sourceArtist.images[0].url}
                                        alt={artist.artistName}
                                        className="recurring-list-item__image"
                                    />
                                ) : (
                                    <div className="recurring-list-item__image recurring-list-item__image--fallback">
                                        {artist.artistName.charAt(0)}
                                    </div>
                                )}

                                <div className="recurring-list-item__meta">
                                    <strong className="recurring-list-item__title">
                                        {artist.artistName}
                                    </strong>
                                    <span className="recurring-list-item__subtext">
                                        {artist.trackCount} track
                                        {artist.trackCount === 1 ? "" : "s"} in your top list
                                    </span>
                                </div>

                                <SpotifyLink
                                    url={sourceArtist?.external_urls?.spotify}
                                    label={`Open ${artist.artistName} on Spotify`}
                                />
                            </div>
                        );
                    })}
                </div>
            ),
        },
        // Final Overview Slides 14-15
        {
            id: "chapter-overview",
            kind: "chapter",
            eyebrow: "Final view",
            title: "Here’s the full picture in one place",
            body: "A compact view of the profile and favorites that shaped this recap.",
        },
        {
            id: "overview",
            kind: "section",
            eyebrow: "Overview",
            title: "Your music recap at a glance",
            content: (
                <div className="overview-layout">
                    <div className="story-card story-card--hero overview-card">
                        <p className="story-badge">Listening profile</p>
                        <h2 className="story-featureTitle">
                            {data.listeningProfile.title}
                        </h2>
                        <p className="story-featureText">
                            {data.listeningProfile.description}
                        </p>

                        <div className="overview-actions">
                            {onStartOver ? (
                                <button
                                    type="button"
                                    className="overview-button"
                                    onClick={onStartOver}
                                >
                                    Choose another time range
                                </button>
                            ) : null}

                            <a
                                href={getSpotifyProfileUrl(userName)}
                                target="_blank"
                                rel="noreferrer"
                                className="overview-button overview-button--spotify"
                            >
                                Open Your Spotify
                            </a>
                        </div>
                    </div>

                    <div className="story-card overview-listCard">
                        <span className="story-miniLabel">Top 5 artists</span>
                        <div className="overview-mediaList">
                            {data.topArtists.slice(0, 5).map((artist, index) => (
                                <div key={artist.id} className="overview-mediaRow">
                                    <span className="overview-rank">{index + 1}</span>
                                    {artist.images?.[0]?.url ? (
                                        <img
                                            src={artist.images[0].url}
                                            alt={artist.name}
                                            className="overview-thumb overview-thumb--artist"
                                        />
                                    ) : (
                                        <div className="overview-thumb overview-thumb--artist overview-thumb--fallback">
                                            {artist.name.charAt(0)}
                                        </div>
                                    )}
                                    <span className="overview-mediaText">{artist.name}</span>
                                    <SpotifyLink
                                        url={artist.external_urls?.spotify}
                                        label={`Open ${artist.name} on Spotify`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="story-card overview-listCard">
                        <span className="story-miniLabel">Top 5 tracks</span>
                        <div className="overview-mediaList">
                            {data.topTracks.slice(0, 5).map((track, index) => (
                                <div key={track.id} className="overview-mediaRow">
                                    <span className="overview-rank">{index + 1}</span>
                                    {track.album.images?.[0]?.url ? (
                                        <img
                                            src={track.album.images[0].url}
                                            alt={track.album.name}
                                            className="overview-thumb"
                                        />
                                    ) : (
                                        <div className="overview-thumb overview-thumb--fallback">♪</div>
                                    )}
                                    <span className="overview-mediaText">
                                        {track.name}
                                    </span>
                                    <SpotifyLink
                                        url={track.external_urls?.spotify}
                                        label={`Open ${track.name} on Spotify`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ),
        },
    ];
}

export default function WrappedDashboard({
    token,
    userName,
    initialRange,
    onStartOver,
}: Props) {
    const { data, loading, error, timeRange, refresh } = useWrappedData(
        token,
        initialRange,
        true
    );

    const slides = useMemo(
        () => (data ? buildSlides(data, userName, timeRange, onStartOver) : []),
        [data, userName, timeRange, onStartOver]
    );

    const [currentSlide, setCurrentSlide] = useState(0);
    const [direction, setDirection] = useState(1);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!slides.length) return;

            if (event.key === "ArrowRight") {
                setDirection(1);
                setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
            }

            if (event.key === "ArrowLeft") {
                setDirection(-1);
                setCurrentSlide((prev) => Math.max(prev - 1, 0));
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [slides.length]);

    if (loading) {
        return (
            <LoadingScreen
                title="Customizing your experience"
                subtitle="Shaping your music data into a personalized recap."
            />
        );
    }

    if (error) {
        return (
            <section className="wrapped-stage">
                <div className="wrapped-stage__inner">
                    <div className="story-card story-card--hero">
                        <p className="story-badge">Something went wrong</p>
                        <h1 className="story-featureTitle">Failed to load your music data</h1>
                        <p className="story-featureText">{error}</p>

                        <div className="overview-actions">
                            <button
                                type="button"
                                className="overview-button"
                                onClick={() => void refresh()}
                            >
                                Try again
                            </button>

                            {onStartOver ? (
                                <button
                                    type="button"
                                    className="overview-button overview-button--ghost"
                                    onClick={onStartOver}
                                >
                                    Change time range
                                </button>
                            ) : null}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (!data || slides.length === 0) {
        return (
            <section className="wrapped-stage">
                <div className="wrapped-stage__inner">
                    <div className="story-card story-card--hero">
                        <p className="story-badge">No data</p>
                        <h1 className="story-featureTitle">No music data available</h1>
                        <p className="story-featureText">
                            Spotify didn’t return enough listening information for this view.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    const activeSlide = slides[currentSlide];
    const progress = ((currentSlide + 1) / slides.length) * 100;

    return (
        <section
            className="wrapped-stage"
            style={{ ["--slide-index" as string]: String(currentSlide % 8) }}
        >
            <div className="wrapped-stage__noise" />

            <div className="wrapped-stage__topbar">
                <div className="wrapped-stage__meta">
                    <span className="wrapped-stage__pill">
                        {userName ?? "Spotify User"}
                    </span>
                    <span className="wrapped-stage__pill wrapped-stage__pill--muted">
                        {getTimeRangeLabel(timeRange)}
                    </span>
                </div>

                <div className="wrapped-stage__counter">
                    {currentSlide + 1} / {slides.length}
                </div>
            </div>

            <div className="wrapped-stage__progress">
                <span style={{ width: `${progress}%` }} />
            </div>

            <div className="wrapped-stage__inner">
                <div
                    key={activeSlide.id}
                    className={`slide slide--${activeSlide.kind} slide--animated ${direction > 0 ? "slide--fromRight" : "slide--fromLeft"
                        }`}
                >
                    <div className="slide__header">
                        <p className="slide__eyebrow">{activeSlide.eyebrow}</p>
                        <h1 className="slide__title">{activeSlide.title}</h1>
                        {activeSlide.body ? (
                            <p className="slide__body">{activeSlide.body}</p>
                        ) : null}
                    </div>

                    {activeSlide.content ? (
                        <div className="slide__content">{activeSlide.content}</div>
                    ) : null}
                </div>
            </div>

            <button
                type="button"
                className="wrapped-nav wrapped-nav--left"
                onClick={() => {
                    setDirection(-1);
                    setCurrentSlide((prev) => Math.max(prev - 1, 0));
                }}
                disabled={currentSlide === 0}
                aria-label="Previous slide"
            >
                &lt;
            </button>

            <button
                type="button"
                className="wrapped-nav wrapped-nav--right"
                onClick={() => {
                    setDirection(1);
                    setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
                }}
                disabled={currentSlide === slides.length - 1}
                aria-label="Next slide"
            >
                &gt;
            </button>

            <div className="wrapped-dots" aria-hidden="true">
                {slides.map((slide, index) => (
                    <button
                        key={slide.id}
                        type="button"
                        className={`wrapped-dot ${index === currentSlide ? "wrapped-dot--active" : ""}`}
                        onClick={() => {
                            setDirection(index > currentSlide ? 1 : -1);
                            setCurrentSlide(index);
                        }}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}