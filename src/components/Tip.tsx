import * as React from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import type { Placement } from "react-bootstrap/types";
import { TOOLTIP_DELAY } from "./Tip.constants.ts";

interface TipProps {
    text: string;
    placement?: Placement;
    children: React.ReactElement;
}

const Tip: React.FunctionComponent<TipProps> = ({
    text,
    placement = "bottom",
    children,
}): React.ReactElement => (
    <OverlayTrigger
        placement={placement}
        delay={TOOLTIP_DELAY}
        overlay={<Tooltip>{text}</Tooltip>}
    >
        {children}
    </OverlayTrigger>
);

export default Tip;

