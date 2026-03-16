import "./ReadNotice.css";

type ReadNoticeProps = {
    open: boolean;
    onContinue: () => void;
};

export default function ReadNotice({
    open,
    onContinue,
}: ReadNoticeProps) {
    if (!open) return null;

    return (
        <div className="read-notice-overlay" role="dialog" aria-modal="true" aria-labelledby="read-notice-title">
            <div className="read-notice">
                <div className="read-notice-glow" />

                <h2 id="read-notice-title" className="read-notice-title">
                    Please Read
                </h2>

                <div className="read-notice-body">
                    <p>
                        This application uses the Spotify Developer Dashboard to gain
                        access to Spotify&apos;s API. Due to me being an individual
                        developer and not being partnered with Spotify, this
                        application is only granted up to 5 users that are allowed to
                        connect to Spotify&apos;s API.
                    </p>

                    <p>
                        There is a demo video of me using my personal Spotify account
                        to showcase this application.
                    </p>

                    <p>
                        If you would like a personal demo done by me or would like me
                        to add your account so you can have access, please reach out to
                        me at{" "}
                        <a
                            href="mailto:Thenn0110@gmail.com"
                            className="read-notice-link"
                        >
                            Thenn0110@gmail.com
                        </a>{" "}
                        and include your full name and the email associated with your
                        Spotify.
                    </p>

                    <p>Thank you.</p>
                </div>

                <button
                    type="button"
                    className="read-notice-button"
                    onClick={onContinue}
                >
                    Continue
                </button>
            </div>
        </div>
    );
}