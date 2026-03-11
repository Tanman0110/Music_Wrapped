import { useState } from "react";
import ConnectSpotifyButton from "./components/ConnectSpotifyButton";
import Callback from "./pages/Callback";
import WrappedDashboard from "./components/WrappedDashboard";

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

    return (
        <div style={{ padding: 24 }}>
            {!token ? (
                <>
                    <h1>Music Wrapped</h1>
                    <p>Connect your Spotify account to see your listening insights.</p>
                    <ConnectSpotifyButton />
                </>
            ) : (
                <WrappedDashboard token={token} meName={meName} />
            )}
        </div>
    );
}