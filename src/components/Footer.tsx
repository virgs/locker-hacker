import * as React from "react";
import { Hash, BarChart2, Clock } from "react-feather";
import { FooterContainer, FooterStat } from "./Footer.styled.tsx";
import { LEVEL_LABELS } from "../game/GameConfig.ts";
import { useGameContext } from "../context/GameContext.tsx";
import { formatTime } from "./Footer.utils.ts";

const Footer: React.FunctionComponent = (): React.ReactElement => {
    const { gridConfig, level, elapsedSeconds } = useGameContext();

    return (
        <FooterContainer>
            <FooterStat aria-label="Code length">
                <Hash size={13} />
                {gridConfig.length}
            </FooterStat>
            <FooterStat aria-label={`Level: ${LEVEL_LABELS[level]}`}>
                <BarChart2 size={13} />
                {LEVEL_LABELS[level]}
            </FooterStat>
            <FooterStat aria-label="Elapsed time">
                <Clock size={13} />
                {formatTime(elapsedSeconds)}
            </FooterStat>
        </FooterContainer>
    );
};

export default Footer;
