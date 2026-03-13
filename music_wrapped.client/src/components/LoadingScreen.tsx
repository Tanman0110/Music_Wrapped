import "./LoadingScreen.css";

type Props = {
    title: string;
    subtitle?: string;
};

export default function LoadingScreen({ title, subtitle }: Props) {
    return (
        <section className="loading-screen" aria-live="polite" aria-busy="true">
            <div className="loading-screen__noise" />
            <div className="loading-screen__glow loading-screen__glow--one" />
            <div className="loading-screen__glow loading-screen__glow--two" />
            <div className="loading-screen__content">
                <p className="loading-screen__eyebrow">Music Wrapped</p>
                <h1 className="loading-screen__title">{title}</h1>
                {subtitle ? (
                    <p className="loading-screen__subtitle">{subtitle}</p>
                ) : null}

                <div className="loading-dots" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                </div>
            </div>
        </section>
    );
}