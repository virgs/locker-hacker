export const getPointWrapperClassName = ({
    selected,
    latest,
}: {
    selected: boolean;
    latest: boolean;
}): string =>
    [
        "react-pattern-lock__point-wrapper",
        selected ? "selected" : "",
        latest ? "latest" : "",
    ].filter(Boolean).join(" ");

export const getConnectorClassName = (isLatest: boolean): string =>
    ["react-pattern-lock__connector", isLatest ? "latest" : ""].filter(Boolean).join(" ");
