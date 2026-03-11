import { useState } from "react";
import { getTopTracks } from "./api/spotifyApi";
import ConnectSpotifyButton from "./components/ConnectSpotifyButton";
import Callback from "./pages/Callback";

async function fetchSpotifyMe(token: string) {
    const res = await fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Spotify /me failed: ${res.status}`);
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
                    setToken(t);

                    const me = await fetchSpotifyMe(t);
                    setMeName(me.display_name ?? me.id);

                    const tracks = await getTopTracks(t);
                    console.log("Top Tracks:", tracks);
                }}
            />
        );
    }

    return (
        <div style={{ padding: 24 }}>
            <h1>Music Wrapped</h1>

            {!token ? (
                <ConnectSpotifyButton />
            ) : (
                <div>
                    <div>Connected as: {meName ?? "Loading profile..."}</div>
                    <button onClick={() => { setToken(null); setMeName(null); }}>
                        Disconnect
                    </button>
                </div>
            )}
        </div>
    );
}