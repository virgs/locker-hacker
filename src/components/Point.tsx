import * as React from "react";
import { getPointWrapperClassName } from "./patternLockFeedback.ts";

interface PointProps {
    index           : number;
    pointSize       : number;
    pointActiveSize : number;
    cols            : number;
    rows            : number;
    pop             : boolean;
    complete        : boolean;
    selected        : boolean;
    latest          : boolean;
    highlighted     : boolean;
    pathColor      ?: string;
}

const Point: React.FunctionComponent<PointProps> = ({
    index,
    pointSize,
    pointActiveSize,
    cols,
    rows,
    selected,
    latest,
    pop,
    complete,
    highlighted,
    pathColor,
}): React.ReactElement => {
    const colPercent = 100 / cols;
    const rowPercent = 100 / rows;

    const innerClass = [
        "react-pattern-lock__point-inner",
        complete ? "complete" : pop ? "active" : "",
        highlighted && !selected ? "highlighted" : "",
    ].filter(Boolean).join(" ");

    return (
        <div
            className={getPointWrapperClassName({ selected, latest })}
            style={{
                width  : `${colPercent}%`,
                height : `${rowPercent}%`,
                flex   : `1 0 ${colPercent}%`
            }}
            data-index={ index }
        >
                <div
                    className="react-pattern-lock__point"
                    style={{
                        width  : pointActiveSize,
                        height : pointActiveSize
                    }}
                >
                    {highlighted && (
                        <div
                            className="react-pattern-lock__point-eliminated"
                            aria-hidden={true}
                        />
                    )}
                    <div
                        className={innerClass}
                        style={{
                            minWidth   : pointSize,
                        minHeight  : pointSize,
                        ...(pathColor && selected ? { background: pathColor } : {}),
                    }}
                />
            </div>
        </div>
    );
};

export default Point;
