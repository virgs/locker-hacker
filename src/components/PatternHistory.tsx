import * as React from "react";
import PatternLock from "./PatternLock.tsx";

interface PatternHistoryProps {
    pathHistory : number[][];
    cols        : number;
    rows        : number;
}

const PatternHistory: React.FunctionComponent<PatternHistoryProps> = ({
    pathHistory,
    cols,
    rows,
}): React.ReactElement => (
    <>
        {pathHistory.map((path, index) => (
            <PatternLock
                key={`history-${index}`}
                containerSize={200}
                pointSize={20}
                disabled={true}
                cols={cols}
                rows={rows}
                path={path}
                dynamicLineStyle={true}
                arrowHeads={true}
                arrowHeadSize={20}
                allowJumping={false}
            />
        ))}
    </>
);

export default PatternHistory;
