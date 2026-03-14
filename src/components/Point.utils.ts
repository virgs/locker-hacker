interface PointInnerClassOptions {
    complete: boolean;
    pop: boolean;
    highlighted: boolean;
    hidden: boolean;
    selected: boolean;
}

export const getPointInnerClassName = ({
    complete,
    pop,
    highlighted,
    hidden,
    selected,
}: PointInnerClassOptions): string => [
    "react-pattern-lock__point-inner",
    complete ? "complete" : pop ? "active" : "",
    highlighted && !selected && !hidden ? "highlighted" : "",
    hidden ? "hidden" : "",
].filter(Boolean).join(" ");
