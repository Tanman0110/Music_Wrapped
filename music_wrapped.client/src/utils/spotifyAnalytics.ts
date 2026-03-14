import type {
    AlbumStat,
    ArtistTrackStat,
    ListeningProfile,
    SpotifyArtist,
    SpotifyTrack,
    SummaryStat,
    WrappedData,
} from "../types/spotifyTypes";

function msToMinutesSeconds(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function average(values: number[]): number {
    if (values.length === 0) {
        return 0;
    }

    const total = values.reduce((sum, value) => sum + value, 0);
    return total / values.length;
}

function computeTopAlbums(tracks: SpotifyTrack[]): AlbumStat[] {
    const albumMap = new Map<string, AlbumStat>();

    for (const track of tracks) {
        const albumId = track.album?.id;
        if (!albumId) {
            continue;
        }

        const existing = albumMap.get(albumId);

        if (existing) {
            existing.trackCount += 1;
            continue;
        }

        albumMap.set(albumId, {
            albumId,
            albumName: track.album.name,
            artistNames: track.artists.map((artist) => artist.name),
            imageUrl: track.album.images?.[0]?.url ?? null,
            spotifyUrl: track.album.external_urls?.spotify ?? null,
            trackCount: 1,
        });
    }

    return Array.from(albumMap.values()).sort(
        (a, b) => b.trackCount - a.trackCount || a.albumName.localeCompare(b.albumName)
    );
}

function computeTopRecurringArtists(tracks: SpotifyTrack[]): ArtistTrackStat[] {
    const artistMap = new Map<string, ArtistTrackStat>();

    for (const track of tracks) {
        for (const artist of track.artists) {
            const existing = artistMap.get(artist.id);

            if (existing) {
                existing.trackCount += 1;
            } else {
                artistMap.set(artist.id, {
                    artistId: artist.id,
                    artistName: artist.name,
                    trackCount: 1,
                });
            }
        }
    }

    return Array.from(artistMap.values()).sort(
        (a, b) => b.trackCount - a.trackCount || a.artistName.localeCompare(b.artistName)
    );
}

function computeListeningProfile(params: {
    uniqueArtistCountFromTracks: number;
    uniqueAlbumCountFromTracks: number;
    topRecurringArtistTrackCount: number;
    totalTracksAnalyzed: number;
}): ListeningProfile {
    const {
        uniqueArtistCountFromTracks,
        uniqueAlbumCountFromTracks,
        topRecurringArtistTrackCount,
        totalTracksAnalyzed,
    } = params;

    const recurringArtistShare =
        totalTracksAnalyzed > 0
            ? topRecurringArtistTrackCount / totalTracksAnalyzed
            : 0;

    if (recurringArtistShare >= 0.25) {
        return {
            title: "Loyal Listener",
            description:
                "You come back to the same favorite artists again and again.",
        };
    }

    if (uniqueArtistCountFromTracks >= 35 && uniqueAlbumCountFromTracks >= 30) {
        return {
            title: "Variety Explorer",
            description:
                "Your top tracks span a wide mix of artists and albums.",
        };
    }

    if (uniqueAlbumCountFromTracks <= 10) {
        return {
            title: "Album Lock-In",
            description:
                "A smaller set of albums dominates your top tracks in this time range.",
        };
    }

    return {
        title: "Balanced Rotator",
        description:
            "You mix familiar favorites with a healthy spread of artists and albums.",
    };
}

function buildSummaryStats(params: {
    totalTracksAnalyzed: number;
    uniqueArtistCountFromTracks: number;
    uniqueAlbumCountFromTracks: number;
    avgTrackDurationMs: number;
}): SummaryStat[] {
    return [
        {
            label: "Tracks analyzed",
            value: String(params.totalTracksAnalyzed),
        },
        {
            label: "Unique artists in top tracks",
            value: String(params.uniqueArtistCountFromTracks),
        },
        {
            label: "Unique albums in top tracks",
            value: String(params.uniqueAlbumCountFromTracks),
        },
        {
            label: "Avg track length",
            value: msToMinutesSeconds(params.avgTrackDurationMs),
        },
    ];
}

export function buildWrappedData(
    topTracks: SpotifyTrack[],
    topArtists: SpotifyArtist[]
): WrappedData {
    const topAlbums = computeTopAlbums(topTracks);
    const topRecurringArtists = computeTopRecurringArtists(topTracks);

    const uniqueArtistIds = new Set(
        topTracks.flatMap((track) => track.artists.map((artist) => artist.id))
    );

    const uniqueAlbumIds = new Set(
        topTracks
            .map((track) => track.album?.id)
            .filter((id): id is string => Boolean(id))
    );

    const avgTrackDurationMs = Math.round(
        average(topTracks.map((track) => track.duration_ms ?? 0))
    );

    const sortedByDuration = [...topTracks].sort(
        (a, b) => a.duration_ms - b.duration_ms
    );

    const shortestTrack = sortedByDuration[0] ?? null;
    const longestTrack =
        sortedByDuration.length > 0
            ? sortedByDuration[sortedByDuration.length - 1]
            : null;

    const totalTracksAnalyzed = topTracks.length;
    const uniqueArtistCountFromTracks = uniqueArtistIds.size;
    const uniqueAlbumCountFromTracks = uniqueAlbumIds.size;

    const listeningProfile = computeListeningProfile({
        uniqueArtistCountFromTracks,
        uniqueAlbumCountFromTracks,
        topRecurringArtistTrackCount: topRecurringArtists[0]?.trackCount ?? 0,
        totalTracksAnalyzed,
    });

    const summaryStats = buildSummaryStats({
        totalTracksAnalyzed,
        uniqueArtistCountFromTracks,
        uniqueAlbumCountFromTracks,
        avgTrackDurationMs,
    });

    return {
        topTracks,
        topArtists,
        topAlbums,
        topRecurringArtists,
        totalTracksAnalyzed,
        uniqueArtistCountFromTracks,
        uniqueAlbumCountFromTracks,
        avgTrackDurationMs,
        longestTrack,
        shortestTrack,
        summaryStats,
        listeningProfile,
    };
}