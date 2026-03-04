import * as React from "react";
import { CodeGenerator } from "../game/CodeGenerator.ts";
import { GuessValidator } from "../game/GuessValidator.ts";
import { saveRecord } from "../game/StatsService.ts";
import { loadConfig, saveConfig } from "../game/ConfigService.ts";
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
    showRevealModal : boolean;
    showStatsModal  : boolean;
    showTurnModal   : boolean;
    elapsedSeconds  : number;
    winner          : number | null;
    currentPlayer   : number;
    revealedHints   : number[];
    onLevelChange        : (level: Level) => void;
    onPlayerCountChange  : (count: PlayerCount) => void;
    onGiveUp             : () => void;
    onToggleRevealModal  : () => void;
    onFinishGame         : () => void;
    onPathChange         : (path: number[]) => void;
    onGuessFinish        : () => void;
    onToggleStatsModal   : () => void;
    onDismissTurnModal   : () => void;
    onRevealHint         : () => void;
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
    const [showRevealModal, setShowRevealModal] = React.useState(false);
    const [showStatsModal, setShowStatsModal]   = React.useState(false);
    const [showTurnModal, setShowTurnModal]     = React.useState(false);
    const [elapsedSeconds, setElapsedSeconds]   = React.useState<number>(0);
    const [winner, setWinner]                   = React.useState<number | null>(null);
    const [currentPlayer, setCurrentPlayer]     = React.useState(1);
    const [playerHistory, setPlayerHistory]     = React.useState<number[]>([]);
    const [revealedHints, setRevealedHints]     = React.useState<number[]>([]);

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

    const onLevelChange = React.useCallback((newLevel: Level): void => {
        setLevel(newLevel);
        setCode(generateCode(LEVEL_CONFIGS[newLevel]));
        setPath([]); setPathHistory([]); setElapsedSeconds(0);
        setCurrentPlayer(1); setWinner(null); setPlayerHistory([]); setRevealedHints([]);
        setGameKey(prev => prev + 1);
        if (playerCount > PlayerCount.One) setShowTurnModal(true);
    }, [playerCount]);

    const onPlayerCountChange = React.useCallback((count: PlayerCount): void => {
        setPlayerCount(count);
        if (count > PlayerCount.One) setShowTurnModal(true);
    }, []);

    const onGiveUp = React.useCallback((): void => {
        setPhase(GamePhase.Revealing);
        setShowRevealModal(true);
    }, []);

    const onToggleRevealModal = React.useCallback((): void => {
        setShowRevealModal(prev => !prev);
    }, []);

    const onToggleStatsModal = React.useCallback((): void => {
        setShowStatsModal(prev => !prev);
    }, []);

    const onFinishGame = React.useCallback((): void => {
        if (playerCount === PlayerCount.One) {
            const rec = {
                level,
                won: winner !== null,
                durationSeconds: elapsedSeconds,
                moves: pathHistory.length,
                date: new Date().toISOString(),
            };
            saveRecord(rec);
            setShowStatsModal(true);
        }
        setCode(generateCode(gridConfig));
        setPath([]); setPathHistory([]); setPlayerHistory([]);
        setPhase(GamePhase.Playing);
        setShowRevealModal(false);
        setElapsedSeconds(0);
        setCurrentPlayer(1); setWinner(null); setRevealedHints([]);
        setGameKey(prev => prev + 1);
        if (playerCount > PlayerCount.One) setShowTurnModal(true);
    }, [gridConfig, playerCount, winner, elapsedSeconds, level, pathHistory]);

    const onPathChange = React.useCallback((newPath: number[]): void => {
        setPath(newPath);
    }, []);

    const onDismissTurnModal = React.useCallback((): void => {
        setShowTurnModal(false);
    }, []);

    const onRevealHint = React.useCallback((): void => {
        setRevealedHints(prev => {
            const unrevealed = code.filter(dot => !prev.includes(dot));
            if (unrevealed.length <= 1) return prev;
            const next = unrevealed[Math.floor(Math.random() * unrevealed.length)]!;
            return [...prev, next];
        });
    }, [code]);

    const onGuessFinish = React.useCallback((): void => {
        if (path.length !== gridConfig.length) { setPath([]); return; }
        const validator = new GuessValidator(code);
        validator.validate(path);
        setPathHistory(prev => [...prev, path]);
        setPlayerHistory(prev => [...prev, currentPlayer]);
        setPath([]);
        if (validator.isSolved(path)) {
            setWinner(currentPlayer);
            setPhase(GamePhase.Revealing);
            setShowRevealModal(true);
        } else {
            setCurrentPlayer(prev => (prev % playerCount) + 1);
            if (playerCount > PlayerCount.One) setShowTurnModal(true);
        }
    }, [path, gridConfig.length, code, currentPlayer, playerCount]);

    const value: GameContextValue = {
        level, playerCount, gridConfig, code, gameKey,
        phase, path, pathHistory, playerHistory, isRunning,
        showRevealModal, showStatsModal, showTurnModal, elapsedSeconds,
        winner, currentPlayer, revealedHints,
        onLevelChange, onPlayerCountChange,
        onGiveUp, onToggleRevealModal, onFinishGame,
        onPathChange, onGuessFinish, onToggleStatsModal, onDismissTurnModal, onRevealHint,
    };

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

