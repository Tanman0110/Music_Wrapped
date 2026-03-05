export async function getTopTracks(token: string) {
    const res = await fetch(
        "https://api.spotify.com/v1/me/top/tracks?limit=10",
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    if (!res.ok) {
        throw new Error("Failed to fetch top tracks");
    }

    return res.json();
}