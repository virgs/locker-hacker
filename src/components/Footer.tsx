import * as React from "react";
import { Hash, BarChart2, Clock, User, Unlock } from "react-feather";
import { FooterContainer, FooterStat, AiProgressStat, PlayerLabel } from "./Footer.styled.tsx";
import { PlayerCount, LEVEL_LABELS, LEVEL_LABELS_SHORT } from "../game/GameConfig.ts";
import { getPlayerColor } from "../game/playerColors.ts";
import { useGameContext } from "../context/GameContext.tsx";
import { formatTime, getAiIndicatorColor } from "./Footer.utils.ts";
import useInferenceEngine, { GuessQuality } from "./useInferenceEngine.ts";
import Tip from "./Tip.tsx";
import useMediaQuery from "./useMediaQuery.ts";
import { BREAKPOINT_QUERIES } from "../theme/breakpoints.ts";

const QUALITY_FLASH_MS = 2500;

const Footer: React.FunctionComponent = (): React.ReactElement => {
    const { gridConfig, level, elapsedSeconds, playerCount, currentPlayer, code, pathHistory } = useGameContext();
    const isMultiplayer = playerCount !== PlayerCount.One;
    const playerColor   = getPlayerColor(currentPlayer);
    const aiProgress    = useInferenceEngine(gridConfig, code, pathHistory);
    const [flashQuality, setFlashQuality] = React.useState<GuessQuality>(GuessQuality.Neutral);
    const isMobile      = useMediaQuery(BREAKPOINT_QUERIES.mobile);
    const levelLabel    = isMobile ? LEVEL_LABELS_SHORT[level] : LEVEL_LABELS[level];

    React.useEffect(() => {
        if (aiProgress.lastGuessQuality === GuessQuality.Neutral || pathHistory.length === 0) return;
        setFlashQuality(aiProgress.lastGuessQuality);
        const id = setTimeout(() => setFlashQuality(GuessQuality.Neutral), QUALITY_FLASH_MS);
        return () => clearTimeout(id);
    }, [aiProgress.lastGuessQuality, pathHistory.length]);

    const indicatorColor = getAiIndicatorColor(aiProgress.isSolved, flashQuality);

    return (
        <FooterContainer className="text-dark">
            <Tip text="AI confidence" placement="top">
                <AiProgressStat
                    $color={indicatorColor}
                    aria-label={`AI progress: ${aiProgress.percent.toFixed(1)}%`}
                >
                    <Unlock size={20} />
                    {aiProgress.percent.toFixed(1)}%
                </AiProgressStat>
            </Tip>
            {isMultiplayer && (
                <PlayerLabel $color={playerColor} aria-label={`Current player: Player ${currentPlayer}`}>
                    <User size={20} />
                    {isMobile ? currentPlayer : `Player ${currentPlayer}`}
                </PlayerLabel>
            )}
            <Tip text="Code length" placement="top">
                <FooterStat aria-label="Code length">
                    <Hash size={20} />
                    {gridConfig.length}
                </FooterStat>
            </Tip>
            <Tip text="Difficulty level" placement="top">
                <FooterStat aria-label={`Level: ${LEVEL_LABELS[level]}`}>
                    <BarChart2 size={20} />
                    {levelLabel}
                </FooterStat>
            </Tip>
            <Tip text="Elapsed time" placement="top">
                <FooterStat aria-label="Elapsed time">
                    <Clock size={20} />
                    {formatTime(elapsedSeconds)}
                </FooterStat>
            </Tip>
        </FooterContainer>
    );
};

export default Footer;
