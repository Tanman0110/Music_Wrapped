import TimeRangeSelector from "./TimeRangeSelector";
import { useWrappedData } from "../hooks/useWrappedData";

type Props = {
    token: string;
    meName: string | null;
};

export default function WrappedDashboard({ token, meName }: Props) {
    const { data, loading, error, timeRange, setTimeRange } = useWrappedData(
        token,
        "medium_term"
    );

    if (loading) {
        return <div>Loading your Spotify data...</div>;
    }

    if (error) {
        return <div>Failed to load Spotify data: {error}</div>;
    }

    if (!data) {
        return <div>No data available.</div>;
    }

    return (
        <div style={{ padding: 24 }}>
            <h1>Music Wrapped</h1>
            <p>Connected as: {meName ?? "Spotify User"}</p>

            <TimeRangeSelector value={timeRange} onChange={setTimeRange} />

            <section style={{ marginBottom: 32 }}>
                <h2>Genre Summary</h2>
                <p>Unique genres: {data.uniqueGenreCount}</p>

                <h3>Top Genres (from top artists)</h3>
                <ol>
                    {data.topGenres.slice(0, 10).map((genre) => (
                        <li key={genre.name}>
                            {genre.name} — {genre.count}
                        </li>
                    ))}
                </ol>

                <h3>Genre Count Across Pulled Tracks</h3>
                <ol>
                    {data.genreCountsFromTracks.slice(0, 10).map((genre) => (
                        <li key={genre.name}>
                            {genre.name} — {genre.count} tracks
                        </li>
                    ))}
                </ol>
            </section>

            <section style={{ marginBottom: 32 }}>
                <h2>Top Artists</h2>
                <ol>
                    {data.topArtists.slice(0, 10).map((artist) => {
                        const genres = Array.isArray(artist.genres) ? artist.genres : [];

                        return (
                            <li key={artist.id}>
                                <strong>{artist.name}</strong>
                                {genres.length > 0 && (
                                    <div style={{ fontSize: 14 }}>
                                        Genres: {genres.slice(0, 4).join(", ")}
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ol>
            </section>

            <section style={{ marginBottom: 32 }}>
                <h2>Top Tracks</h2>
                <ol>
                    {data.topTracks.slice(0, 10).map((track) => (
                        <li key={track.id}>
                            <strong>{track.name}</strong> —{" "}
                            {track.artists.map((a) => a.name).join(", ")}
                        </li>
                    ))}
                </ol>
            </section>

            <section>
                <h2>Track Genre Breakdown</h2>
                <ul>
                    {data.trackGenreBreakdown.slice(0, 10).map((item) => (
                        <li key={item.trackId}>
                            <strong>{item.trackName}</strong> — {item.artistNames.join(", ")}
                            <div style={{ fontSize: 14 }}>
                                Genres: {item.genres.length > 0 ? item.genres.join(", ") : "None found"}
                            </div>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}