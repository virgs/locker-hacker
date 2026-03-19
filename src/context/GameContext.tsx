import * as React from "react";
import { CodeGenerator } from "../game/CodeGenerator.ts";
import { GuessValidator } from "../game/GuessValidator.ts";
import { loadConfig, saveConfig } from "../game/ConfigService.ts";
import { GameSessionStatsTracker } from "./GameSessionStatsTracker.ts";
import { useSinglePlayerStatsPersistence } from "./useSinglePlayerStatsPersistence.ts";
import { pickEliminationHint } from "../game/HintService.ts";
import {
    getAnnotatedDotIndices,
    getConfirmedDotAnnotations,
    applyDotAnnotationSelection,
    type DotAnnotationSelection,
    type ConfirmedDotAnnotation,
    type DotAnnotations,
} from "../game/dotAnnotations.ts";
import {
    Level, PlayerCount, GamePhase, GridConfig,
    LEVEL_CONFIGS, DEFAULT_LEVEL, DEFAULT_PLAYER_COUNT,
} from "../game/GameConfig.ts";

export type GameMenuSection = "stats" | "help" | "settings";

export interface GameContextValue {
    level           : Level;
    playerCount     : PlayerCount;
    gridConfig      : GridConfig;
    code            : number[];
    gameKey         : number;
    phase           : GamePhase;
    path            : number[];
    pathHistory     : number[][];
    playerHistory   : number[];
    isRunning       : boolean;
    showGameMenu    : boolean;
    activeGameMenuSection: GameMenuSection;
    showTurnModal   : boolean;
    elapsedSeconds  : number;
    winner          : number | null;
    currentPlayer   : number;
    revealedHints   : number[];
    annotationsEnabled: boolean;
    dotAnnotations        : DotAnnotations;
    annotatedEliminations : number[];
    annotatedConfirmed    : ConfirmedDotAnnotation[];
    activeStatsRecordId     : string | null;
    onLevelChange        : (level: Level) => void;
    onPlayerCountChange  : (count: PlayerCount) => void;
    onGiveUp             : () => void;
    onFinishGame         : () => void;
    onPathChange         : (path: number[]) => void;
    onGuessFinish        : () => void;
    onCloseGameMenu      : () => void;
    onOpenGameMenu       : (section?: GameMenuSection) => void;
    onToggleAnnotationsEnabled: () => void;
    onDismissTurnModal              : () => void;
    onRevealHint                    : () => void;
    onSelectDotAnnotation           : (index: number, selection: DotAnnotationSelection) => void;
    onRegisterInvalidGuessListener  : (cb: () => void) => void;
}

const GameContext = React.createContext<GameContextValue | undefined>(undefined);

const generateCode = (config: GridConfig): number[] =>
    new CodeGenerator(config).generate();

// eslint-disable-next-line react-refresh/only-export-components
export const useGameContext = (): GameContextValue => {
    const ctx = React.useContext(GameContext);
    if (!ctx) throw new Error("useGameContext must be used within GameProvider");
    return ctx;
};

export const GameProvider = ({ children }: React.PropsWithChildren): React.ReactElement => {
    const [savedConfig]     = React.useState(() => loadConfig());
    const initialLevel       = savedConfig.level       ?? DEFAULT_LEVEL;
    const initialPlayerCount = savedConfig.playerCount ?? DEFAULT_PLAYER_COUNT;
    const initialAnnotationsEnabled = savedConfig.annotationsEnabled ?? true;

    const [level, setLevel]             = React.useState<Level>(initialLevel);
    const [playerCount, setPlayerCount] = React.useState<PlayerCount>(initialPlayerCount);
    const [phase, setPhase]             = React.useState<GamePhase>(GamePhase.Playing);
    const [code, setCode]               = React.useState<number[]>(() => generateCode(LEVEL_CONFIGS[initialLevel]));
    const [path, setPath]               = React.useState<number[]>([]);
    const [pathHistory, setPathHistory] = React.useState<number[][]>([]);
    const [gameKey, setGameKey]         = React.useState(0);
    const [showGameMenu, setShowGameMenu]       = React.useState(false);
    const [activeGameMenuSection, setActiveGameMenuSection] = React.useState<GameMenuSection>("stats");
    const [showTurnModal, setShowTurnModal]     = React.useState(false);
    const [elapsedSeconds, setElapsedSeconds]   = React.useState<number>(0);
    const [winner, setWinner]                   = React.useState<number | null>(null);
    const [currentPlayer, setCurrentPlayer]     = React.useState(1);
    const [playerHistory, setPlayerHistory]     = React.useState<number[]>([]);
    const [revealedHints, setRevealedHints]     = React.useState<number[]>([]);
    const [annotationsEnabled, setAnnotationsEnabled] = React.useState(initialAnnotationsEnabled);
    const [dotAnnotations, setDotAnnotations]   = React.useState<DotAnnotations>({});
    const sessionTrackerRef                      = React.useRef(new GameSessionStatsTracker());
    const invalidGuessListenerRef                = React.useRef<(() => void) | null>(null);
    const gridConfig = LEVEL_CONFIGS[level];
    const isRunning  = pathHistory.length > 0;
    const { activeRecordId, markStarted, finalizeActive, resetActive } = useSinglePlayerStatsPersistence({
        trackerRef: sessionTrackerRef,
        playerCount,
        level,
        elapsedSeconds,
        pathHistorySize: pathHistory.length,
        hintsUsed: revealedHints.length,
    });

    React.useEffect(() => {
        if (!isRunning || phase === GamePhase.Revealing) return;
        const id = setInterval(() => setElapsedSeconds(prev => prev + 1), 1000);
        return () => clearInterval(id);
    }, [isRunning, phase]);

    React.useEffect(() => {
        saveConfig({ level, playerCount, annotationsEnabled });
    }, [annotationsEnabled, level, playerCount]);
    React.useEffect(() => {
        const onPageHide = (): void => finalizeActive({ won: false });
        window.addEventListener("pagehide", onPageHide);
        return () => window.removeEventListener("pagehide", onPageHide);
    }, [finalizeActive]);
    const onLevelChange = React.useCallback((newLevel: Level): void => {
        finalizeActive({ won: false });
        setLevel(newLevel);
        setCode(generateCode(LEVEL_CONFIGS[newLevel]));
        setPath([]); setPathHistory([]); setElapsedSeconds(0);
        setCurrentPlayer(1); setWinner(null); setPlayerHistory([]); setRevealedHints([]); setDotAnnotations({});
        resetActive();
        setGameKey(prev => prev + 1);
        if (playerCount > PlayerCount.One) setShowTurnModal(true);
    }, [finalizeActive, playerCount, resetActive]);
    const onPlayerCountChange = React.useCallback((count: PlayerCount): void => {
        setPlayerCount(count);
        if (count > PlayerCount.One) setShowTurnModal(true);
    }, []);
    const onGiveUp = React.useCallback((): void => {
        finalizeActive({ won: false });
        setPhase(GamePhase.Revealing);
    }, [finalizeActive]);

    const onOpenGameMenu = React.useCallback((section: GameMenuSection = "stats"): void => {
        setActiveGameMenuSection(section);
        setShowGameMenu(true);
    }, []);

    const onCloseGameMenu = React.useCallback((): void => {
        setShowGameMenu(false);
    }, []);

    const onToggleAnnotationsEnabled = React.useCallback((): void => {
        setAnnotationsEnabled(prev => !prev);
    }, []);

    const onFinishGame = React.useCallback((): void => {
        finalizeActive({ won: winner !== null });
        setActiveGameMenuSection("stats");
        setShowGameMenu(true);
        setCode(generateCode(gridConfig));
        setPath([]); setPathHistory([]); setPlayerHistory([]);
        setPhase(GamePhase.Playing);
        setElapsedSeconds(0);
        setCurrentPlayer(1); setWinner(null); setRevealedHints([]); setDotAnnotations({});
        resetActive();
        setGameKey(prev => prev + 1);
        if (playerCount > PlayerCount.One) setShowTurnModal(true);
    }, [finalizeActive, gridConfig, playerCount, resetActive, winner]);

    const onPathChange = React.useCallback((newPath: number[]): void => {
        setPath(newPath);
    }, []);

    const onDismissTurnModal = React.useCallback((): void => {
        setShowTurnModal(false);
    }, []);
    const onRevealHint = React.useCallback((): void => {
        setRevealedHints(prev => {
            const next = pickEliminationHint({
                totalDots: gridConfig.cols * gridConfig.rows,
                code,
                alreadyEliminated: prev,
            });
            if (next === null) return prev;
            return [...prev, next];
        });
    }, [code, gridConfig.cols, gridConfig.rows]);
    const onSelectDotAnnotation = React.useCallback((index: number, selection: DotAnnotationSelection): void => {
        if (phase === GamePhase.Revealing || !annotationsEnabled) return;
        setDotAnnotations(prev => applyDotAnnotationSelection(prev, index, selection, gridConfig.length));
    }, [annotationsEnabled, gridConfig.length, phase]);
    const onRegisterInvalidGuessListener = React.useCallback((cb: () => void): void => {
        invalidGuessListenerRef.current = cb;
    }, []);

    const onGuessFinish = React.useCallback((): void => {
        if (path.length !== gridConfig.length) { setPath([]); invalidGuessListenerRef.current?.(); return; }
        const validator = new GuessValidator(code);
        validator.validate(path);
        markStarted(pathHistory.length + 1);
        setPath([]);
        React.startTransition(() => {
            setPathHistory(prev => [...prev, path]);
            setPlayerHistory(prev => [...prev, currentPlayer]);
            if (validator.isSolved(path)) {
                finalizeActive({ won: true, movesOverride: pathHistory.length + 1 });
                setWinner(currentPlayer);
                setPhase(GamePhase.Revealing);
            } else {
                setCurrentPlayer(prev => (prev % playerCount) + 1);
                if (playerCount > PlayerCount.One) setShowTurnModal(true);
            }
        });
    }, [code, currentPlayer, finalizeActive, gridConfig.length, markStarted, path, pathHistory.length, playerCount]);
    const value: GameContextValue = {
        level, playerCount, gridConfig, code, gameKey,
        phase, path, pathHistory, playerHistory, isRunning,
        showGameMenu, activeGameMenuSection, showTurnModal, elapsedSeconds,
        winner, currentPlayer, revealedHints,
        annotationsEnabled,
        dotAnnotations,
        annotatedEliminations: getAnnotatedDotIndices(dotAnnotations, "eliminated"),
        annotatedConfirmed: getConfirmedDotAnnotations(dotAnnotations),
        activeStatsRecordId: activeRecordId,
        onLevelChange, onPlayerCountChange,
        onGiveUp, onFinishGame,
        onPathChange, onGuessFinish, onCloseGameMenu, onOpenGameMenu, onToggleAnnotationsEnabled,
        onDismissTurnModal, onRevealHint, onSelectDotAnnotation,
        onRegisterInvalidGuessListener,
    };
    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
