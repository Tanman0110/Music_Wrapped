import { useState } from "react";
import Callback from "./pages/Callback";
import WrappedDashboard from "./components/WrappedDashboard";
import Landing from "./pages/Landing";

async function fetchSpotifyMe(token: string) {
    const res = await fetch("https://api.spotify.com/v1/me", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        throw new Error(`Spotify /me failed: ${res.status}`);
    }

    return res.json();
}

export default function App() {
    const [token, setToken] = useState<string | null>(null);
    const [meName, setMeName] = useState<string | null>(null);

    const path = window.location.pathname;

    if (path === "/callback") {
        return (
            <Callback
                onToken={async (t) => {
                    const me = await fetchSpotifyMe(t);

                    setToken(t);
                    setMeName(me.display_name ?? me.id);

                    window.history.replaceState({}, document.title, "/");
                }}
            />
        );
    }

    if (!token) {
        return <Landing />;
    }

    return <WrappedDashboard token={token} meName={meName} />;
}