import * as React from "react";
import { Hash, BarChart2, Clock, User, Unlock } from "react-feather";
import { FooterContainer, FooterStat, AiProgressStat, PlayerLabel } from "./Footer.styled.tsx";
import { PlayerCount, LEVEL_LABELS } from "../game/GameConfig.ts";
import { getPlayerColor } from "../game/playerColors.ts";
import { useGameContext } from "../context/GameContext.tsx";
import { formatTime, getAiIndicatorColor } from "./Footer.utils.ts";
import useInferenceEngine, { GuessQuality } from "./useInferenceEngine.ts";

const QUALITY_FLASH_MS = 2500;

const Footer: React.FunctionComponent = (): React.ReactElement => {
    const { gridConfig, level, elapsedSeconds, playerCount, currentPlayer, code, pathHistory } = useGameContext();
    const isMultiplayer = playerCount !== PlayerCount.One;
    const playerColor   = getPlayerColor(currentPlayer);
    const aiProgress    = useInferenceEngine(gridConfig, code, pathHistory);
    const [flashQuality, setFlashQuality] = React.useState<GuessQuality>(GuessQuality.Neutral);

    React.useEffect(() => {
        if (aiProgress.lastGuessQuality === GuessQuality.Neutral || pathHistory.length === 0) return;
        setFlashQuality(aiProgress.lastGuessQuality);
        const id = setTimeout(() => setFlashQuality(GuessQuality.Neutral), QUALITY_FLASH_MS);
        return () => clearTimeout(id);
    }, [aiProgress.lastGuessQuality, pathHistory.length]);

    const indicatorColor = getAiIndicatorColor(aiProgress.isSolved, flashQuality);

    return (
        <FooterContainer className="text-dark">
            <AiProgressStat
                $color={indicatorColor}
                aria-label={`AI progress: ${Math.round(aiProgress.percent)}%`}
            >
                <Unlock size={20} />
                {Math.round(aiProgress.percent)}%
            </AiProgressStat>
            {isMultiplayer && (
                <PlayerLabel $color={playerColor} aria-label={`Current player: Player ${currentPlayer}`}>
                    <User size={20} />
                    Player {currentPlayer}
                </PlayerLabel>
            )}
            <FooterStat aria-label="Code length">
                <Hash size={20} />
                {gridConfig.length}
            </FooterStat>
            <FooterStat aria-label={`Level: ${LEVEL_LABELS[level]}`}>
                <BarChart2 size={20} />
                {LEVEL_LABELS[level]}
            </FooterStat>
            <FooterStat aria-label="Elapsed time">
                <Clock size={20} />
                {formatTime(elapsedSeconds)}
            </FooterStat>
        </FooterContainer>
    );
};

export default Footer;
