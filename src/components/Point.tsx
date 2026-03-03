import * as React from "react";

interface PointProps {
    index           : number;
    pointSize       : number;
    pointActiveSize : number;
    cols            : number;
    rows            : number;
    pop             : boolean;
    complete        : boolean;
    selected        : boolean;
    pathColor      ?: string;
}

const Point: React.FunctionComponent<PointProps> = ({
    index,
    pointSize,
    pointActiveSize,
    cols,
    rows,
    selected,
    pop,
    complete,
    pathColor,
}): React.ReactElement => {
    const colPercent = 100 / cols;
    const rowPercent = 100 / rows;

    return (
        <div
            className={ `react-pattern-lock__point-wrapper${selected ? " selected" : ""}` }
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
                <div
                    className={ `react-pattern-lock__point-inner${complete ? " complete" : pop ? " active" : ""}` }
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
