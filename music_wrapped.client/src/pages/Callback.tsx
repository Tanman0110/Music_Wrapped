import { useEffect, useRef, useState } from "react";
import { exchangeCodeForToken } from "../auth/spotifyPkce";

export default function Callback({ onToken }: { onToken: (t: string) => void }) {
    const [error, setError] = useState<string | null>(null);
    const ran = useRef(false);

    useEffect(() => {
        if (ran.current) return; // ✅ prevents double-run (React dev)
        ran.current = true;

        (async () => {
            const params = new URLSearchParams(window.location.search);
            const code = params.get("code");
            const err = params.get("error");

            if (err) throw new Error(err);
            if (!code) throw new Error("Missing code in callback URL");

            const { accessToken } = await exchangeCodeForToken(code);
            onToken(accessToken);

            window.history.replaceState({}, document.title, "/");
        })().catch((e) => setError(e?.message ?? String(e)));
    }, [onToken]);

    if (error) return <div>Spotify auth failed: {error}</div>;
    return <h2>Connecting to Spotify...</h2>;
}