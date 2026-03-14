import { useState } from "react";
import Landing from "./pages/Landing";
import Callback from "./pages/Callback";
import WrappedDashboard from "./components/WrappedDashboard";
import TimeRangeSelector from "./components/TimeRangeSelector";
import { getSpotifyUser } from "./api/spotifyApi";
import type { TimeRange } from "./types/spotifyTypes";

const BASE_URL = import.meta.env.BASE_URL;
const CALLBACK_PATH = `${BASE_URL}callback`;

function normalizePath(path: string) {
    return path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
}

export default function App() {
    const [token, setToken] = useState<string | null>(null);
    const [meName, setMeName] = useState<string | null>(null);
    const [selectedRange, setSelectedRange] = useState<TimeRange | null>(null);

    const path = normalizePath(window.location.pathname);
    const callbackPath = normalizePath(CALLBACK_PATH);

    if (path === callbackPath) {
        return (
            <Callback
                onToken={async (t) => {
                    const user = await getSpotifyUser(t);

                    setToken(t);
                    setMeName(user.display_name ?? user.id ?? "Spotify User");

                    window.history.replaceState({}, document.title, BASE_URL);
                }}
            />
        );
    }

    if (!token) {
        return <Landing />;
    }

    if (!selectedRange) {
        return (
            <TimeRangeSelector
                value={null}
                onChange={(range) => setSelectedRange(range)}
                meName={meName}
            />
        );
    }

    return (
        <WrappedDashboard
            key={selectedRange}
            token={token}
            userName={meName}
            initialRange={selectedRange}
            onStartOver={() => setSelectedRange(null)}
        />
    );
}