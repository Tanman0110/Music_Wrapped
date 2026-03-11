import "./WrappedDashboard.css";
import TimeRangeSelector from "./TimeRangeSelector";
import { useWrappedData } from "../hooks/useWrappedData";
import type { SpotifyTrack } from "../types/spotifyTypes";

type Props = {
    token: string;
    meName: string | null;
};

function formatDuration(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function renderTrackLabel(track: SpotifyTrack) {
    return `${track.name} — ${track.artists.map((a) => a.name).join(", ")}`;
}

export default function WrappedDashboard({ token, meName }: Props) {
    const { data, loading, error, timeRange, setTimeRange } = useWrappedData(
        token,
        "medium_term"
    );

    if (loading) {
        return <div className="wrapped-state">Loading your Spotify data...</div>;
    }

    if (error) {
        return <div className="wrapped-state">Failed to load Spotify data: {error}</div>;
    }

    if (!data) {
        return <div className="wrapped-state">No data available.</div>;
    }

    return (
        <div className="wrapped-dashboard">
            <header className="wrapped-header">
                <h1 className="wrapped-title">Music Wrapped</h1>
                <p className="wrapped-subtitle">
                    Connected as: {meName ?? "Spotify User"}
                </p>
            </header>

            <div className="wrapped-range">
                <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
            </div>

            <section className="wrapped-section">
                <h2 className="wrapped-sectionTitle">Your Listening Profile</h2>
                <div className="wrapped-card">
                    <p className="wrapped-profileTitle">
                        {data.listeningProfile.title}
                    </p>
                    <p className="wrapped-profileDescription">
                        {data.listeningProfile.description}
                    </p>
                </div>
            </section>

            <section className="wrapped-section">
                <h2 className="wrapped-sectionTitle">Quick Stats</h2>
                <div className="wrapped-card">
                    <ul className="wrapped-statList">
                        {data.summaryStats.map((stat) => (
                            <li key={stat.label} className="wrapped-statItem">
                                <span className="wrapped-statLabel">{stat.label}</span>
                                <span className="wrapped-statValue">{stat.value}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <section className="wrapped-section">
                <h2 className="wrapped-sectionTitle">Highlights</h2>
                <div className="wrapped-card">
                    <ul className="wrapped-highlightList">
                        <li>
                            <strong>#1 Artist:</strong>{" "}
                            {data.topArtists[0]?.name ?? "N/A"}
                        </li>
                        <li>
                            <strong>#1 Track:</strong>{" "}
                            {data.topTracks[0] ? renderTrackLabel(data.topTracks[0]) : "N/A"}
                        </li>
                        <li>
                            <strong>Most Recurring Artist in Top Tracks:</strong>{" "}
                            {data.topRecurringArtists[0]
                                ? `${data.topRecurringArtists[0].artistName} (${data.topRecurringArtists[0].trackCount} tracks)`
                                : "N/A"}
                        </li>
                        <li>
                            <strong>Most Recurring Album:</strong>{" "}
                            {data.topAlbums[0]
                                ? `${data.topAlbums[0].albumName} — ${data.topAlbums[0].artistNames.join(", ")} (${data.topAlbums[0].trackCount} tracks)`
                                : "N/A"}
                        </li>
                        <li>
                            <strong>Longest Top Track:</strong>{" "}
                            {data.longestTrack
                                ? `${renderTrackLabel(data.longestTrack)} (${formatDuration(
                                    data.longestTrack.duration_ms
                                )})`
                                : "N/A"}
                        </li>
                        <li>
                            <strong>Shortest Top Track:</strong>{" "}
                            {data.shortestTrack
                                ? `${renderTrackLabel(data.shortestTrack)} (${formatDuration(
                                    data.shortestTrack.duration_ms
                                )})`
                                : "N/A"}
                        </li>
                    </ul>
                </div>
            </section>

            <section className="wrapped-section">
                <h2 className="wrapped-sectionTitle">Top Artists</h2>
                <ol className="wrapped-list">
                    {data.topArtists.slice(0, 10).map((artist) => (
                        <li key={artist.id} className="wrapped-card wrapped-artistItem">
                            <div className="wrapped-artistRow">
                                {artist.images?.[0]?.url ? (
                                    <img
                                        src={artist.images[0].url}
                                        alt={artist.name}
                                        className="wrapped-artistImage"
                                    />
                                ) : (
                                    <div className="wrapped-artistImagePlaceholder">
                                        {artist.name.charAt(0)}
                                    </div>
                                )}

                                <div className="wrapped-artistMeta">
                                    <strong className="wrapped-itemTitle">{artist.name}</strong>
                                </div>
                            </div>
                        </li>
                    ))}
                </ol>
            </section>

            <section className="wrapped-section">
                <h2 className="wrapped-sectionTitle">Top Tracks</h2>
                <ol className="wrapped-list">
                    {data.topTracks.slice(0, 10).map((track) => (
                        <li key={track.id} className="wrapped-card wrapped-trackItem">
                            <div className="wrapped-trackTop">
                                {track.album.images?.[0]?.url ? (
                                    <img
                                        src={track.album.images[0].url}
                                        alt={track.album.name}
                                        className="wrapped-albumThumb"
                                    />
                                ) : (
                                    <div className="wrapped-albumThumbPlaceholder">♪</div>
                                )}

                                <div className="wrapped-trackMeta">
                                    <strong className="wrapped-itemTitle">{track.name}</strong>
                                    <div className="wrapped-itemSubtext">
                                        {track.artists.map((a) => a.name).join(", ")}
                                    </div>
                                    <div className="wrapped-itemSubtext">
                                        Album: {track.album.name}
                                    </div>
                                    <div className="wrapped-itemSubtext">
                                        Length: {formatDuration(track.duration_ms)}
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ol>
            </section>

            <section className="wrapped-section">
                <h2 className="wrapped-sectionTitle">
                    Top Albums (derived from your top tracks)
                </h2>
                <ol className="wrapped-list">
                    {data.topAlbums.slice(0, 10).map((album) => (
                        <li key={album.albumId} className="wrapped-card wrapped-albumItem">
                            <div className="wrapped-albumRow">
                                {album.imageUrl ? (
                                    <img
                                        src={album.imageUrl}
                                        alt={album.albumName}
                                        className="wrapped-albumImage"
                                    />
                                ) : (
                                    <div className="wrapped-albumImagePlaceholder">♫</div>
                                )}

                                <div className="wrapped-albumMeta">
                                    <strong className="wrapped-itemTitle">
                                        {album.albumName}
                                    </strong>
                                    <div className="wrapped-itemSubtext">
                                        {album.artistNames.join(", ")}
                                    </div>
                                    <div className="wrapped-itemSubtext">
                                        {album.trackCount} top track
                                        {album.trackCount === 1 ? "" : "s"} from this album
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ol>
            </section>

            <section className="wrapped-section">
                <h2 className="wrapped-sectionTitle">
                    Most Recurring Artists in Your Top Tracks
                </h2>
                <div className="wrapped-card">
                    <ol className="wrapped-recurringList">
                        {data.topRecurringArtists.slice(0, 10).map((artist) => (
                            <li key={artist.artistId} className="wrapped-recurringItem">
                                <strong>{artist.artistName}</strong>
                                <span>
                                    {artist.trackCount} track
                                    {artist.trackCount === 1 ? "" : "s"}
                                </span>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>
        </div>
    );
}