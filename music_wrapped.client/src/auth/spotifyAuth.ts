const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;

const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";

export function redirectToSpotifyLogin() {
    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        response_type: "code",
        redirect_uri: REDIRECT_URI,
        scope: "user-read-private user-read-email user-top-read",
        show_dialog: "true"
    });

    window.location.href = `${AUTH_ENDPOINT}?${params.toString()}`;
}