import { useState } from "react";
import Landing from "./pages/Landing";
import Callback from "./pages/Callback";
import WrappedDashboard from "./components/WrappedDashboard";
import TimeRangeSelector from "./components/TimeRangeSelector";
import { getSpotifyUser } from "./api/spotifyApi";
import type { TimeRange } from "./types/spotifyTypes";

export default function App() {
    const [token, setToken] = useState<string | null>(null);
    const [meName, setMeName] = useState<string | null>(null);
    const [selectedRange, setSelectedRange] = useState<TimeRange | null>(null);

    const path = window.location.pathname;

    if (path === "/callback") {
        return (
            <Callback
                onToken={async (t) => {
                    const user = await getSpotifyUser(t);

                    setToken(t);
                    setMeName(user.display_name ?? user.id ?? "Spotify User");

                    window.history.replaceState({}, document.title, "/");
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