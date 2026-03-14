import * as React from "react";

const MARKER_EXIT_MS = 180;

const useAnimatedMarker = (active: boolean): { visible: boolean; exiting: boolean } => {
    const [visible, setVisible] = React.useState(active);
    const [exiting, setExiting] = React.useState(false);

    React.useEffect((): (() => void) | void => {
        if (active) {
            setVisible(true);
            setExiting(false);
            return;
        }
        if (!visible) return;

        setExiting(true);
        const timeoutId = window.setTimeout(() => {
            setVisible(false);
            setExiting(false);
        }, MARKER_EXIT_MS);

        return () => window.clearTimeout(timeoutId);
    }, [active, visible]);

    return { visible, exiting };
};

interface PointProps {
    index           : number;
    pointSize       : number;
    pointActiveSize : number;
    cols            : number;
    rows            : number;
    pop             : boolean;
    complete        : boolean;
    selected        : boolean;
    highlighted     : boolean;
    confirmed       : boolean;
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
    highlighted,
    confirmed,
    pathColor,
}): React.ReactElement => {
    const colPercent = 100 / cols;
    const rowPercent = 100 / rows;
    const confirmedMarker = useAnimatedMarker(confirmed);
    const eliminatedMarker = useAnimatedMarker(highlighted);

    const innerClass = [
        "react-pattern-lock__point-inner",
        complete ? "complete" : pop ? "active" : "",
        highlighted && !selected ? "highlighted" : "",
    ].filter(Boolean).join(" ");

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
                    {confirmedMarker.visible && (
                        <div
                            className={`react-pattern-lock__point-confirmed${confirmedMarker.exiting ? " is-exiting" : ""}`}
                            aria-hidden={true}
                        />
                    )}
                    {eliminatedMarker.visible && (
                        <div
                            className={`react-pattern-lock__point-eliminated${eliminatedMarker.exiting ? " is-exiting" : ""}`}
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
