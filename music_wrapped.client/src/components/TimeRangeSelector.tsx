import type { TimeRange } from "../types/spotifyTypes";
import "./WrappedDashboard.css";

type Props = {
    value: TimeRange | null;
    onChange: (value: TimeRange) => void;
    meName?: string | null;
};

const OPTIONS: {
    value: TimeRange;
    label: string;
    description: string;
}[] = [
        {
            value: "short_term",
            label: "Past Month",
            description: "A snapshot of your recent listening habits.",
        },
        {
            value: "medium_term",
            label: "6 Months",
            description: "A broader look at your recent favorites.",
        },
        {
            value: "long_term",
            label: "All Time",
            description: "The biggest-picture view of your music taste.",
        },
    ];

export default function TimeRangeSelector({ value, onChange, meName }: Props) {
    return (
        <section className="range-screen">
            <div className="range-screen__noise" />
            <div className="range-screen__content">
                <p className="range-screen__eyebrow">
                    {meName ? `Connected as ${meName}` : "Spotify connected"}
                </p>

                <h1 className="range-screen__title">
                    How far back would you like to go?
                </h1>

                <p className="range-screen__subtitle">
                    Choose the time range for your music recap.
                </p>

                <div className="range-screen__grid">
                    {OPTIONS.map((option) => {
                        const active = value === option.value;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                className={`range-card ${active ? "range-card--active" : ""}`}
                                onClick={() => onChange(option.value)}
                            >
                                <span className="range-card__label">{option.label}</span>
                                <span className="range-card__description">
                                    {option.description}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}