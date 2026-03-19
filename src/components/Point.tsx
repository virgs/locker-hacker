import * as React from "react";
import { getConfirmedLabelStyle, getPointInnerClassName } from "./Point.utils.ts";
import ConfirmedRing from "./ConfirmedRing.tsx";
import { getDotAnnotationMenuOptions } from "./DotAnnotationMenu.utils.ts";
import { getAnnotationSelections, type DotAnnotationState } from "../game/dotAnnotations.ts";
import type { ActiveAnnotationMenu } from "./usePatternLock.ts";

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
    hidden          : boolean;
    annotation?     : DotAnnotationState;
    annotationMenu ?: ActiveAnnotationMenu;
    targetLength?   : number;
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
    hidden,
    annotation,
    annotationMenu,
    targetLength,
    pathColor,
}): React.ReactElement => {
    const colPercent = 100 / cols;
    const rowPercent = 100 / rows;
    const confirmedPositions = annotation?.eliminated ? [] : annotation?.positions ?? [];
    const highlighted = annotation?.eliminated ?? false;
    const confirmedMarker = useAnimatedMarker(confirmedPositions.length > 0);
    const eliminatedMarker = useAnimatedMarker(highlighted);
    const menuMarker = useAnimatedMarker(annotationMenu !== undefined);
    const innerClass = getPointInnerClassName({ complete, pop, highlighted, hidden, selected });
    const menuOptions = targetLength ? getDotAnnotationMenuOptions(targetLength, annotationMenu?.radiusPx) : [];
    const menuSelections = annotationMenu?.selectedSelections ?? getAnnotationSelections(annotation, targetLength ?? 0);

    return (
        <div
            className={[
                "react-pattern-lock__point-wrapper",
                selected ? "selected" : "",
                annotationMenu ? "menu-open" : "",
            ].filter(Boolean).join(" ")}
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
                {!hidden && confirmedMarker.visible && (
                    <div
                        className={`react-pattern-lock__point-confirmed${confirmedMarker.exiting ? " is-exiting" : ""}`}
                        aria-hidden={true}
                    >
                        {targetLength !== undefined && (
                            <ConfirmedRing positions={confirmedPositions} targetLength={targetLength} />
                        )}
                        {targetLength !== undefined && confirmedPositions.map(position => (
                            <span
                                key={position}
                                className="react-pattern-lock__point-confirmed-label"
                                style={getConfirmedLabelStyle(position, targetLength)}
                            >
                                {position}
                            </span>
                        ))}
                    </div>
                )}
                {!hidden && eliminatedMarker.visible && (
                    <div
                        className={`react-pattern-lock__point-eliminated${eliminatedMarker.exiting ? " is-exiting" : ""}`}
                        aria-hidden={true}
                    />
                )}
                {!hidden && menuMarker.visible && menuOptions.length > 0 && (
                    <div
                        className={`react-pattern-lock__annotation-menu${menuMarker.exiting ? " is-exiting" : ""}`}
                        aria-hidden={true}
                        style={{
                            ["--annotation-menu-backdrop-size" as string]: `${annotationMenu?.backdropDiameterPx ?? 164}px`,
                            transform: `translate(${annotationMenu?.offsetX ?? 0}px, ${annotationMenu?.offsetY ?? 0}px)`,
                        }}
                    >
                        <div className="react-pattern-lock__annotation-menu-core" />
                        {menuOptions.map(option => (
                            <div
                                key={option.selection}
                                data-annotation-selection={option.selection}
                                className={[
                                    "react-pattern-lock__annotation-menu-option",
                                    `tone-${option.tone}`,
                                    menuSelections.includes(option.selection) ? "is-selected" : "",
                                    annotationMenu?.highlightedSelection === option.selection ? "is-highlighted" : "",
                                ].filter(Boolean).join(" ")}
                                style={{
                                    transform: `translate(-50%, -50%) translate(${option.x.toFixed(2)}px, ${option.y.toFixed(2)}px)`,
                                }}
                            >
                                {option.label}
                            </div>
                        ))}
                    </div>
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
