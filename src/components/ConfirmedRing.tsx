import * as React from "react";
import { describeArcPath, getConfirmedRingSegments } from "./Point.utils.ts";

interface ConfirmedRingProps {
    positions: number[];
    targetLength: number;
    size?: number;
    outerRadius?: number;
    innerRadius?: number;
}

const ConfirmedRing: React.FunctionComponent<ConfirmedRingProps> = ({
    positions,
    targetLength,
    size = 48,
    outerRadius = 22.5,
    innerRadius = 18.5,
}): React.ReactElement => {
    const center = size / 2;
    const segments = getConfirmedRingSegments(positions, targetLength);

    return (
        <svg
            className="react-pattern-lock__point-confirmed-svg"
            viewBox={`0 0 ${size} ${size}`}
            aria-hidden={true}
        >
            {segments.map(segment => (
                <path
                    key={`outer-${segment.start}-${segment.end}`}
                    d={describeArcPath(center, outerRadius, segment.start, segment.end)}
                    className="react-pattern-lock__point-confirmed-outer-arc"
                />
            ))}
            {segments.map(segment => (
                <path
                    key={`inner-${segment.start}-${segment.end}`}
                    d={describeArcPath(center, innerRadius, segment.start, segment.end)}
                    className="react-pattern-lock__point-confirmed-inner-arc"
                />
            ))}
        </svg>
    );
};

export default ConfirmedRing;
