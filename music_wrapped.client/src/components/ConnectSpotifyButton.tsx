import { startSpotifyLogin } from "../auth/spotifyPkce";

export default function ConnectSpotifyButton() {
    return (
        <button type="button" onClick={() => startSpotifyLogin()}>
            Connect to your Spotify
        </button>
    );
}