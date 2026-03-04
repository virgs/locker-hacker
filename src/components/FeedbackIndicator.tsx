import * as React from "react";
import { FeedbackShape, FeedbackColumn } from "./FeedbackIndicator.styled.tsx";
import { feedbackEntry } from "./FeedbackIndicator.utils.ts";

interface FeedbackIndicatorProps {
    bulls      : number;
    cows       : number;
    codeLength : number;
}

const FeedbackIndicator: React.FunctionComponent<FeedbackIndicatorProps> = ({
    bulls,
    cows,
    codeLength,
}): React.ReactElement => (
    <FeedbackColumn>
        {Array.from({ length: codeLength }).map((_, i) => {
            const entry = feedbackEntry(i, bulls, cows);
            return (
                <FeedbackShape key={i} $color={entry.color}>
                    {entry.symbol}
                </FeedbackShape>
            );
        })}
    </FeedbackColumn>
);

export default FeedbackIndicator;
