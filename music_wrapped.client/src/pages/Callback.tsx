import { useEffect, useRef, useState } from "react";
import { exchangeCodeForToken } from "../auth/spotifyPkce";
import LoadingScreen from "../components/LoadingScreen";

export default function Callback({
    onToken,
}: {
    onToken: (t: string) => Promise<void> | void;
}) {
    const [error, setError] = useState<string | null>(null);
    const ran = useRef(false);

    useEffect(() => {
        if (ran.current) return;
        ran.current = true;

        (async () => {
            const params = new URLSearchParams(window.location.search);
            const code = params.get("code");
            const err = params.get("error");

            if (err) {
                throw new Error(err);
            }

            if (!code) {
                throw new Error("Missing code in callback URL");
            }

            const { accessToken } = await exchangeCodeForToken(code);
            await onToken(accessToken);
        })().catch((e) =>
            setError(e instanceof Error ? e.message : String(e))
        );
    }, [onToken]);

    if (error) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "grid",
                    placeItems: "center",
                    background:
                        "linear-gradient(180deg, #0e0e0e 0%, #121212 50%, #0a0a0a 100%)",
                    color: "#fff",
                    padding: "2rem",
                    textAlign: "center",
                }}
            >
                <div>
                    <h2 style={{ marginBottom: "0.75rem" }}>Spotify auth failed</h2>
                    <p style={{ opacity: 0.8, margin: 0 }}>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <LoadingScreen
            title="Retrieving your listening data"
            subtitle="We’re pulling together your top artists, tracks, albums, and listening trends."
        />
    );
}