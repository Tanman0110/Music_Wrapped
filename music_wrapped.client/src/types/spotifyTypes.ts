export type SpotifyImage = {
    url: string;
    height: number | null;
    width: number | null;
};

export type SpotifyArtist = {
    id: string;
    name: string;
    genres?: string[];
    images?: SpotifyImage[];
    popularity?: number;
    followers?: {
        total: number;
    };
};

export type SpotifyAlbum = {
    id: string;
    name: string;
    images: SpotifyImage[];
};

export type SpotifyTrackArtist = {
    id: string;
    name: string;
};

export type SpotifyTrack = {
    id: string;
    name: string;
    duration_ms: number;
    popularity: number;
    preview_url: string | null;
    artists: SpotifyTrackArtist[];
    album: SpotifyAlbum;
};

export type SpotifyTopItemsResponse<T> = {
    items: T[];
    total: number;
    limit: number;
    offset: number;
    href: string;
    next: string | null;
    previous: string | null;
};

export type TimeRange = "short_term" | "medium_term" | "long_term";

export type GenreStat = {
    name: string;
    count: number;
};

export type TrackGenreBreakdown = {
    trackId: string;
    trackName: string;
    artistNames: string[];
    genres: string[];
};

export type WrappedData = {
    topTracks: SpotifyTrack[];
    topArtists: SpotifyArtist[];
    topGenres: GenreStat[];
    uniqueGenreCount: number;
    genreCountsFromTracks: GenreStat[];
    trackGenreBreakdown: TrackGenreBreakdown[];
};