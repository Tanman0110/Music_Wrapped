import { useCallback, useEffect, useState } from "react";
import { getTopArtists, getTopTracks } from "../api/spotifyApi";
import { buildWrappedData } from "../utils/spotifyAnalytics";
import type { TimeRange, WrappedData } from "../types/spotifyTypes";

type UseWrappedDataResult = {
    data: WrappedData | null;
    loading: boolean;
    error: string | null;
    timeRange: TimeRange;
    setTimeRange: (range: TimeRange) => void;
    refresh: () => Promise<void>;
};

export function useWrappedData(
    token: string | null,
    initialRange: TimeRange = "medium_term"
): UseWrappedDataResult {
    const [timeRange, setTimeRange] = useState<TimeRange>(initialRange);
    const [data, setData] = useState<WrappedData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        if (!token) {
            setData(null);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const [topTracks, topArtists] = await Promise.all([
                getTopTracks(token, timeRange, 50),
                getTopArtists(token, timeRange, 50),
            ]);

            const wrappedData = buildWrappedData(topTracks, topArtists);
            setData(wrappedData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [token, timeRange]);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    return {
        data,
        loading,
        error,
        timeRange,
        setTimeRange,
        refresh,
    };
}