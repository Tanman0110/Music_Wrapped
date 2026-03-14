import type {
    SpotifyArtist,
    SpotifyTopItemsResponse,
    SpotifyTrack,
    TimeRange,
} from "../types/spotifyTypes";

const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

export type SpotifyUser = {
    id: string;
    display_name: string | null;
    email?: string;
};

async function spotifyFetch<T>(url: string, token: string): Promise<T> {
    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Spotify API failed: ${res.status} ${text}`);
    }

    return res.json() as Promise<T>;
}

export async function getSpotifyUser(token: string): Promise<SpotifyUser> {
    return spotifyFetch<SpotifyUser>(`${SPOTIFY_API_BASE}/me`, token);
}

export async function getTopTracks(
    token: string,
    timeRange: TimeRange,
    limit = 50
): Promise<SpotifyTrack[]> {
    const params = new URLSearchParams({
        time_range: timeRange,
        limit: String(Math.min(limit, 50)),
        offset: "0",
    });

    const data = await spotifyFetch<SpotifyTopItemsResponse<SpotifyTrack>>(
        `${SPOTIFY_API_BASE}/me/top/tracks?${params.toString()}`,
        token
    );

    return data.items;
}

export async function getTopArtists(
    token: string,
    timeRange: TimeRange,
    limit = 50
): Promise<SpotifyArtist[]> {
    const params = new URLSearchParams({
        time_range: timeRange,
        limit: String(Math.min(limit, 50)),
        offset: "0",
    });

    const data = await spotifyFetch<SpotifyTopItemsResponse<SpotifyArtist>>(
        `${SPOTIFY_API_BASE}/me/top/artists?${params.toString()}`,
        token
    );

    return data.items;
}