import * as React from "react";
import { Hash, BarChart2, Clock, User, Unlock } from "react-feather";
import { FooterContainer, FooterStat, AiProgressStat, PlayerLabel } from "./Footer.styled.tsx";
import { PlayerCount, LEVEL_LABELS } from "../game/GameConfig.ts";
import { getPlayerColor } from "../game/playerColors.ts";
import { useGameContext } from "../context/GameContext.tsx";
import { formatTime } from "./Footer.utils.ts";
import useInferenceEngine from "./useInferenceEngine.ts";

const Footer: React.FunctionComponent = (): React.ReactElement => {
    const { gridConfig, level, elapsedSeconds, playerCount, currentPlayer, code, pathHistory } = useGameContext();
    const isMultiplayer = playerCount !== PlayerCount.One;
    const playerColor   = getPlayerColor(currentPlayer);
    const aiProgress    = useInferenceEngine(gridConfig, code, pathHistory);

    return (
        <FooterContainer className="text-dark">
            <AiProgressStat aria-label={`AI progress: ${Math.round(aiProgress.percent)}%`}>
                <Unlock size={13} />
                {Math.round(aiProgress.percent)}%
            </AiProgressStat>
            {isMultiplayer && (
                <PlayerLabel $color={playerColor} aria-label={`Current player: Player ${currentPlayer}`}>
                    <User size={12} />
                    Player {currentPlayer}
                </PlayerLabel>
            )}
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
