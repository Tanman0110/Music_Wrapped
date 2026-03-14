export type SpotifyImage = {
    url: string;
    height: number | null;
    width: number | null;
};

export type SpotifyExternalUrls = {
    spotify?: string;
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
    external_urls?: SpotifyExternalUrls;
};

export type SpotifyAlbum = {
    id: string;
    name: string;
    images: SpotifyImage[];
    external_urls?: SpotifyExternalUrls;
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
    external_urls?: SpotifyExternalUrls;
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

export type AlbumStat = {
    albumId: string;
    albumName: string;
    artistNames: string[];
    imageUrl: string | null;
    spotifyUrl: string | null;
    trackCount: number;
};

export type ArtistTrackStat = {
    artistId: string;
    artistName: string;
    trackCount: number;
};

export type SummaryStat = {
    label: string;
    value: string;
};

export type ListeningProfile = {
    title: string;
    description: string;
};

export type WrappedData = {
    topTracks: SpotifyTrack[];
    topArtists: SpotifyArtist[];
    topAlbums: AlbumStat[];
    topRecurringArtists: ArtistTrackStat[];
    totalTracksAnalyzed: number;
    uniqueArtistCountFromTracks: number;
    uniqueAlbumCountFromTracks: number;
    avgTrackDurationMs: number;
    longestTrack: SpotifyTrack | null;
    shortestTrack: SpotifyTrack | null;
    summaryStats: SummaryStat[];
    listeningProfile: ListeningProfile;
};