const SPOTIFY_AUTHORIZE = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN = "https://accounts.spotify.com/api/token";

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI as string;

const SCOPES = ["user-read-private", "user-read-email", "user-top-read"].join(" ");
const VERIFIER_KEY = "spotify_pkce_verifier";

function randomString(length = 64) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    const bytes = crypto.getRandomValues(new Uint8Array(length));
    return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

function base64UrlEncode(buffer: ArrayBuffer) {
    const bytes = new Uint8Array(buffer);
    let str = "";
    for (let i = 0; i < bytes.byteLength; i++) str += String.fromCharCode(bytes[i]);
    return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sha256(plain: string) {
    const data = new TextEncoder().encode(plain);
    return crypto.subtle.digest("SHA-256", data);
}

export async function startSpotifyLogin() {
    if (!CLIENT_ID || !REDIRECT_URI) {
        throw new Error("Missing VITE_SPOTIFY_CLIENT_ID or VITE_SPOTIFY_REDIRECT_URI");
    }

    const verifier = randomString(64);
    sessionStorage.setItem(VERIFIER_KEY, verifier);

    const challenge = base64UrlEncode(await sha256(verifier));

    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        response_type: "code",
        redirect_uri: REDIRECT_URI,
        code_challenge_method: "S256",
        code_challenge: challenge,
        scope: SCOPES,
    });

    window.location.href = `${SPOTIFY_AUTHORIZE}?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string): Promise<{ accessToken: string; expiresIn: number }> {
    const verifier = sessionStorage.getItem(VERIFIER_KEY);
    if (!verifier) throw new Error("Missing PKCE verifier (try logging in again).");

    const body = new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
        code_verifier: verifier,
    });

    const res = await fetch(SPOTIFY_TOKEN, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Token exchange failed: ${res.status} ${text}`);
    }

    // You want reconnect if they leave — keep token only in memory.
    sessionStorage.removeItem(VERIFIER_KEY);

    const data = await res.json();
    return { accessToken: data.access_token, expiresIn: data.expires_in };
}