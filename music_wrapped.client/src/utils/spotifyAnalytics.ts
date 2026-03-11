import type {
    GenreStat,
    SpotifyArtist,
    SpotifyTrack,
    TrackGenreBreakdown,
    WrappedData,
} from "../types/spotifyTypes";

function sortGenreCounts(map: Map<string, number>): GenreStat[] {
    return Array.from(map.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function computeTopGenresFromArtists(
    artists: SpotifyArtist[]
): GenreStat[] {
    const genreCounts = new Map<string, number>();

    for (const artist of artists) {
        const genres = Array.isArray(artist.genres) ? artist.genres : [];

        for (const genre of genres) {
            genreCounts.set(genre, (genreCounts.get(genre) ?? 0) + 1);
        }
    }

    return sortGenreCounts(genreCounts);
}

export function computeTrackGenreData(
    tracks: SpotifyTrack[],
    artists: SpotifyArtist[]
): {
    genreCountsFromTracks: GenreStat[];
    trackGenreBreakdown: TrackGenreBreakdown[];
} {
    const artistGenreMap = new Map<string, string[]>();

    for (const artist of artists) {
        artistGenreMap.set(
            artist.id,
            Array.isArray(artist.genres) ? artist.genres : []
        );
    }

    const genreCounts = new Map<string, number>();
    const trackGenreBreakdown: TrackGenreBreakdown[] = [];

    for (const track of tracks) {
        const trackGenres = new Set<string>();

        for (const artist of track.artists) {
            const genres = artistGenreMap.get(artist.id) ?? [];

            for (const genre of genres) {
                trackGenres.add(genre);
            }
        }

        for (const genre of trackGenres) {
            genreCounts.set(genre, (genreCounts.get(genre) ?? 0) + 1);
        }

        trackGenreBreakdown.push({
            trackId: track.id,
            trackName: track.name,
            artistNames: track.artists.map((a) => a.name),
            genres: Array.from(trackGenres).sort(),
        });
    }

    return {
        genreCountsFromTracks: sortGenreCounts(genreCounts),
        trackGenreBreakdown,
    };
}

export function buildWrappedData(
    topTracks: SpotifyTrack[],
    topArtists: SpotifyArtist[]
): WrappedData {
    const topGenres = computeTopGenresFromArtists(topArtists);
    const { genreCountsFromTracks, trackGenreBreakdown } = computeTrackGenreData(
        topTracks,
        topArtists
    );

    return {
        topTracks,
        topArtists,
        topGenres,
        uniqueGenreCount: topGenres.length,
        genreCountsFromTracks,
        trackGenreBreakdown,
    };
}