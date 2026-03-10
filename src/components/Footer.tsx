import * as React from "react";
import {Hash, BarChart2, Clock, User, Unlock, Gift, Lock} from "react-feather";
import {
    FooterContainer,
    FooterStat,
    CodeLengthStat,
    AiProgressStat,
    PlayerLabel,
    ConfidenceDelta,
    HintButton
} from "./Footer.styled.tsx";
import {PlayerCount, GamePhase, LEVEL_LABELS, LEVEL_LABELS_SHORT} from "../game/GameConfig.ts";
import {getPlayerColor} from "../game/playerColors.ts";
import {useGameContext} from "../context/GameContext.tsx";
import {formatTime, formatPercentDelta, getAiIndicatorColor} from "./Footer.utils.ts";
import useInferenceEngine, {GuessQuality} from "./useInferenceEngine.ts";
import Tip from "./Tip.tsx";
import useMediaQuery from "./useMediaQuery.ts";
import {BREAKPOINT_QUERIES} from "../theme/breakpoints.ts";
import {IS_CAPACITOR} from "../platform.ts";
import {showRewardedAd} from "../ads/AdService.ts";
import {hasEliminationHintCandidates} from "../game/HintService.ts";

const QUALITY_FLASH_MS = 2500;
const DELTA_DISPLAY_MS = 2000;

const Footer: React.FunctionComponent = (): React.ReactElement => {
    const {
        gridConfig,
        level,
        elapsedSeconds,
        playerCount,
        currentPlayer,
        code,
        pathHistory,
        phase,
        revealedHints,
        onRevealHint,
        onRegisterInvalidGuessListener,
    } = useGameContext();
    const isMultiplayer = playerCount !== PlayerCount.One;
    const playerColor = getPlayerColor(currentPlayer);
    const aiProgress = useInferenceEngine(gridConfig, code, pathHistory);
    const [flashQuality, setFlashQuality] = React.useState<GuessQuality>(GuessQuality.Neutral);
    const isMobile = useMediaQuery(BREAKPOINT_QUERIES.mobile);
    const levelLabel = isMobile ? LEVEL_LABELS_SHORT[level] : LEVEL_LABELS[level];
    const [showDelta, setShowDelta] = React.useState(false);
    const [deltaKey, setDeltaKey] = React.useState(0);
    const [flashCodeLength, setFlashCodeLength] = React.useState(false);

    const canHint = IS_CAPACITOR && phase === GamePhase.Playing && hasEliminationHintCandidates({
        totalDots: gridConfig.cols * gridConfig.rows,
        code,
        alreadyEliminated: revealedHints,
    });

    const handleHint = async (): Promise<void> => {
        const rewarded = await showRewardedAd();
        if (rewarded) onRevealHint();
    };

    React.useEffect(() => {
        if (aiProgress.lastGuessQuality === GuessQuality.Neutral || pathHistory.length === 0) return;
        setFlashQuality(aiProgress.lastGuessQuality);
        const id = setTimeout(() => setFlashQuality(GuessQuality.Neutral), QUALITY_FLASH_MS);
        return () => clearTimeout(id);
    }, [aiProgress.lastGuessQuality, pathHistory.length]);

    React.useEffect(() => {
        if (pathHistory.length === 0) return;
        setShowDelta(true);
        setDeltaKey(prev => prev + 1);
        const id = setTimeout(() => setShowDelta(false), DELTA_DISPLAY_MS);
        return () => clearTimeout(id);
    }, [pathHistory.length]);

    const flashTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    React.useEffect(() => {
        onRegisterInvalidGuessListener(() => {
            if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
            setFlashCodeLength(true);
            flashTimerRef.current = setTimeout(() => setFlashCodeLength(false), 1200);
        });
    }, [onRegisterInvalidGuessListener]);

    const indicatorColor = getAiIndicatorColor(aiProgress.isSolved, flashQuality);

    return (
        <FooterContainer className="text-dark">
            <Tip text="AI confidence" placement="top">
                <AiProgressStat
                    $color={indicatorColor}
                    aria-label={`AI progress: ${aiProgress.percent.toFixed(1)}%`}
                >
                    {aiProgress.isSolved ? <Unlock size={20}/> : <Lock size={20}/>}
                    {aiProgress.percent.toFixed(1)}%
                    {showDelta && (
                        <ConfidenceDelta key={deltaKey} $color={indicatorColor}>
                            {formatPercentDelta(aiProgress.percentDelta)}
                        </ConfidenceDelta>
                    )}
                </AiProgressStat>
            </Tip>
            {canHint && (
                <Tip text="Watch an ad to eliminate one wrong dot" placement="top">
                    <HintButton onClick={handleHint} aria-label="Get a hint">
                        <Gift size={18}/>
                    </HintButton>
                </Tip>
            )}
            {isMultiplayer && (
                <PlayerLabel $color={playerColor} aria-label={`Current player: Player ${currentPlayer}`}>
                    <User size={20}/>
                    {isMobile ? currentPlayer : `Player ${currentPlayer}`}
                </PlayerLabel>
            )}
            <Tip text="Difficulty level" placement="top">
                <FooterStat aria-label={`Level: ${LEVEL_LABELS[level]}`}>
                    <BarChart2 size={20}/>
                    {levelLabel}
                </FooterStat>
            </Tip>
            <Tip text="Code length" placement="top">
                <CodeLengthStat $flash={flashCodeLength} aria-label="Code length">
                    <Hash size={20}/>
                    {gridConfig.length}
                </CodeLengthStat>
            </Tip>
            <Tip text="Elapsed time" placement="top">
                <FooterStat aria-label="Elapsed time">
                    <Clock size={20}/>
                    {formatTime(elapsedSeconds)}
                </FooterStat>
            </Tip>
        </FooterContainer>
    );
};

export default Footer;
