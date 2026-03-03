import * as React from "react";
import { FeedbackDot, FeedbackColumn } from "./FeedbackIndicator.styled.tsx";
import { dotColor } from "./FeedbackIndicator.utils.ts";

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
        {Array.from({ length: codeLength }).map((_, i) => (
            <FeedbackDot key={i} $color={dotColor(i, bulls, cows)} />
        ))}
    </FeedbackColumn>
);

export default FeedbackIndicator;
