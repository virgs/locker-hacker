import * as React from "react";
import { Hash, BarChart2, Clock, User } from "react-feather";
import { FooterContainer, FooterStat, PlayerLabel } from "./Footer.styled.tsx";
import { PlayerCount, LEVEL_LABELS } from "../game/GameConfig.ts";
import { getPlayerColor } from "../game/playerColors.ts";
import { useGameContext } from "../context/GameContext.tsx";
import { formatTime } from "./Footer.utils.ts";

const Footer: React.FunctionComponent = (): React.ReactElement => {
    const { gridConfig, level, elapsedSeconds, playerCount, currentPlayer } = useGameContext();
    const isMultiplayer = playerCount !== PlayerCount.One;
    const playerColor   = getPlayerColor(currentPlayer);

    return (
        <FooterContainer className="text-dark">
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
