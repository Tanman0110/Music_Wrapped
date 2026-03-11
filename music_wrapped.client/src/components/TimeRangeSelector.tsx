import type { TimeRange } from "../types/spotifyTypes";

type Props = {
    value: TimeRange;
    onChange: (value: TimeRange) => void;
};

export default function TimeRangeSelector({ value, onChange }: Props) {
    return (
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
            <button
                onClick={() => onChange("short_term")}
                disabled={value === "short_term"}
            >
                Past Month
            </button>

            <button
                onClick={() => onChange("medium_term")}
                disabled={value === "medium_term"}
            >
                6 Months
            </button>

            <button
                onClick={() => onChange("long_term")}
                disabled={value === "long_term"}
            >
                All Time
            </button>
        </div>
    );
}