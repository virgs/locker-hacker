import * as React from "react";
import { CodeGenerator } from "../game/CodeGenerator.ts";
import { GuessValidator } from "../game/GuessValidator.ts";
import { saveRecord } from "../game/StatsService.ts";
import { loadConfig, saveConfig } from "../game/ConfigService.ts";
import { GameSessionStatsTracker } from "./GameSessionStatsTracker.ts";
import { pickEliminationHint } from "../game/HintService.ts";
import {
    Level, PlayerCount, GamePhase, GridConfig,
    LEVEL_CONFIGS, DEFAULT_LEVEL, DEFAULT_PLAYER_COUNT,
} from "../game/GameConfig.ts";

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
    showStatsModal  : boolean;
    showTurnModal   : boolean;
    elapsedSeconds  : number;
    winner          : number | null;
    currentPlayer   : number;
    revealedHints   : number[];
    onLevelChange        : (level: Level) => void;
    onPlayerCountChange  : (count: PlayerCount) => void;
    onGiveUp             : () => void;
    onFinishGame         : () => void;
    onPathChange         : (path: number[]) => void;
    onGuessFinish        : () => void;
    onToggleStatsModal   : () => void;
    onDismissTurnModal              : () => void;
    onRevealHint                    : () => void;
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

    const [level, setLevel]             = React.useState<Level>(initialLevel);
    const [playerCount, setPlayerCount] = React.useState<PlayerCount>(initialPlayerCount);
    const [phase, setPhase]             = React.useState<GamePhase>(GamePhase.Playing);
    const [code, setCode]               = React.useState<number[]>(() => generateCode(LEVEL_CONFIGS[initialLevel]));
    const [path, setPath]               = React.useState<number[]>([]);
    const [pathHistory, setPathHistory] = React.useState<number[][]>([]);
    const [gameKey, setGameKey]         = React.useState(0);
    const [showStatsModal, setShowStatsModal]   = React.useState(false);
    const [showTurnModal, setShowTurnModal]     = React.useState(false);
    const [elapsedSeconds, setElapsedSeconds]   = React.useState<number>(0);
    const [winner, setWinner]                   = React.useState<number | null>(null);
    const [currentPlayer, setCurrentPlayer]     = React.useState(1);
    const [playerHistory, setPlayerHistory]     = React.useState<number[]>([]);
    const [revealedHints, setRevealedHints]     = React.useState<number[]>([]);
    const sessionTrackerRef                      = React.useRef(new GameSessionStatsTracker());
    const invalidGuessListenerRef                = React.useRef<(() => void) | null>(null);
    const gridConfig = LEVEL_CONFIGS[level];
    const isRunning  = pathHistory.length > 0;

    React.useEffect(() => {
        if (!isRunning || phase === GamePhase.Revealing) return;
        const id = setInterval(() => setElapsedSeconds(prev => prev + 1), 1000);
        return () => clearInterval(id);
    }, [isRunning, phase]);

    React.useEffect(() => {
        saveConfig({ level, playerCount });
    }, [level, playerCount]);
    const persistCurrentGameRecord = React.useCallback((won: boolean, movesOverride?: number): void => {
        if (!sessionTrackerRef.current.canPersist(playerCount)) return;
        saveRecord({
            level,
            won,
            durationSeconds: elapsedSeconds,
            moves: movesOverride ?? pathHistory.length,
            hintsUsed: revealedHints.length,
            date: new Date().toISOString(),
        });
        sessionTrackerRef.current.markPersisted();
    }, [elapsedSeconds, level, pathHistory.length, playerCount, revealedHints.length]);
    React.useEffect(() => {
        const onPageHide = (): void => persistCurrentGameRecord(false);
        window.addEventListener("pagehide", onPageHide);
        return () => window.removeEventListener("pagehide", onPageHide);
    }, [persistCurrentGameRecord]);
    const onLevelChange = React.useCallback((newLevel: Level): void => {
        persistCurrentGameRecord(false);
        setLevel(newLevel);
        setCode(generateCode(LEVEL_CONFIGS[newLevel]));
        setPath([]); setPathHistory([]); setElapsedSeconds(0);
        setCurrentPlayer(1); setWinner(null); setPlayerHistory([]); setRevealedHints([]);
        sessionTrackerRef.current.reset();
        setGameKey(prev => prev + 1);
        if (playerCount > PlayerCount.One) setShowTurnModal(true);
    }, [persistCurrentGameRecord, playerCount]);
    const onPlayerCountChange = React.useCallback((count: PlayerCount): void => {
        setPlayerCount(count);
        if (count > PlayerCount.One) setShowTurnModal(true);
    }, []);
    const onGiveUp = React.useCallback((): void => {
        persistCurrentGameRecord(false);
        setPhase(GamePhase.Revealing);
    }, [persistCurrentGameRecord]);

    const onToggleStatsModal = React.useCallback((): void => {
        setShowStatsModal(prev => !prev);
    }, []);

    const onFinishGame = React.useCallback((): void => {
        persistCurrentGameRecord(winner !== null);
        if (playerCount === PlayerCount.One) {
            setShowStatsModal(true);
        }
        setCode(generateCode(gridConfig));
        setPath([]); setPathHistory([]); setPlayerHistory([]);
        setPhase(GamePhase.Playing);
        setElapsedSeconds(0);
        setCurrentPlayer(1); setWinner(null); setRevealedHints([]);
        sessionTrackerRef.current.reset();
        setGameKey(prev => prev + 1);
        if (playerCount > PlayerCount.One) setShowTurnModal(true);
    }, [gridConfig, persistCurrentGameRecord, playerCount, winner]);

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
    const onRegisterInvalidGuessListener = React.useCallback((cb: () => void): void => {
        invalidGuessListenerRef.current = cb;
    }, []);

    const onGuessFinish = React.useCallback((): void => {
        if (path.length !== gridConfig.length) { setPath([]); invalidGuessListenerRef.current?.(); return; }
        const validator = new GuessValidator(code);
        validator.validate(path);
        sessionTrackerRef.current.start();
        setPathHistory(prev => [...prev, path]);
        setPlayerHistory(prev => [...prev, currentPlayer]);
        setPath([]);
        if (validator.isSolved(path)) {
            persistCurrentGameRecord(true, pathHistory.length + 1);
            setWinner(currentPlayer);
            setPhase(GamePhase.Revealing);
        } else {
            setCurrentPlayer(prev => (prev % playerCount) + 1);
            if (playerCount > PlayerCount.One) setShowTurnModal(true);
        }
    }, [code, currentPlayer, gridConfig.length, path, pathHistory.length, persistCurrentGameRecord, playerCount]);
    const value: GameContextValue = {
        level, playerCount, gridConfig, code, gameKey,
        phase, path, pathHistory, playerHistory, isRunning,
        showStatsModal, showTurnModal, elapsedSeconds,
        winner, currentPlayer, revealedHints,
        onLevelChange, onPlayerCountChange,
        onGiveUp, onFinishGame,
        onPathChange, onGuessFinish, onToggleStatsModal, onDismissTurnModal, onRevealHint,
        onRegisterInvalidGuessListener,
    };
    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
