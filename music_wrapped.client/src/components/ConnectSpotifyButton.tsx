import { startSpotifyLogin } from "../auth/spotifyPkce";

export default function ConnectSpotifyButton() {
    return (
        <button onClick={() => startSpotifyLogin()}>
            Connect Spotify
        </button>
    );
}