import * as React from "react";
import { CodeGenerator } from "../game/CodeGenerator.ts";
import { GuessValidator } from "../game/GuessValidator.ts";
import {
    Level,
    PlayerCount,
    GamePhase,
    GridConfig,
    LEVEL_CONFIGS,
    DEFAULT_LEVEL,
    DEFAULT_PLAYER_COUNT,
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
    isRunning       : boolean;
    showRevealModal : boolean;
    onLevelChange        : (level: Level) => void;
    onPlayerCountChange  : (count: PlayerCount) => void;
    onGiveUp             : () => void;
    onToggleRevealModal  : () => void;
    onFinishGame         : () => void;
    onPathChange         : (path: number[]) => void;
    onGuessFinish        : () => void;
}

const GameContext = React.createContext<GameContextValue | undefined>(undefined);

const generateCode = (config: GridConfig): number[] =>
    new CodeGenerator(config).generate();

export const useGameContext = (): GameContextValue => {
    const ctx = React.useContext(GameContext);
    if (!ctx) throw new Error("useGameContext must be used within GameProvider");
    return ctx;
};

export const GameProvider = ({ children }: React.PropsWithChildren): React.ReactElement => {
    const [level, setLevel]             = React.useState<Level>(DEFAULT_LEVEL);
    const [playerCount, setPlayerCount] = React.useState<PlayerCount>(DEFAULT_PLAYER_COUNT);
    const [phase, setPhase]             = React.useState<GamePhase>(GamePhase.Playing);
    const [code, setCode]               = React.useState<number[]>(() => generateCode(LEVEL_CONFIGS[DEFAULT_LEVEL]));
    const [path, setPath]               = React.useState<number[]>([]);
    const [pathHistory, setPathHistory] = React.useState<number[][]>([]);
    const [gameKey, setGameKey]         = React.useState(0);
    const [showRevealModal, setShowRevealModal] = React.useState(false);

    const gridConfig = LEVEL_CONFIGS[level];
    const isRunning  = pathHistory.length > 0;

    const onLevelChange = React.useCallback((newLevel: Level): void => {
        setLevel(newLevel);
        setCode(generateCode(LEVEL_CONFIGS[newLevel]));
        setPath([]);
        setPathHistory([]);
        setGameKey(prev => prev + 1);
    }, []);

    const onPlayerCountChange = React.useCallback((count: PlayerCount): void => {
        setPlayerCount(count);
    }, []);

    const onGiveUp = React.useCallback((): void => {
        setPhase(GamePhase.Revealing);
        setShowRevealModal(true);
    }, []);

    const onToggleRevealModal = React.useCallback((): void => {
        setShowRevealModal(prev => !prev);
    }, []);

    const onFinishGame = React.useCallback((): void => {
        setCode(generateCode(gridConfig));
        setPath([]);
        setPathHistory([]);
        setPhase(GamePhase.Playing);
        setShowRevealModal(false);
        setGameKey(prev => prev + 1);
    }, [gridConfig]);

    const onPathChange = React.useCallback((newPath: number[]): void => {
        setPath(newPath);
    }, []);

    const onGuessFinish = React.useCallback((): void => {
        if (path.length !== gridConfig.length) {
            setPath([]);
            return;
        }
        new GuessValidator(code).validate(path);
        setPathHistory(prev => [...prev, path]);
        setPath([]);
    }, [path, gridConfig.length, code]);

    const value: GameContextValue = {
        level, playerCount, gridConfig, code, gameKey,
        phase, path, pathHistory, isRunning, showRevealModal,
        onLevelChange, onPlayerCountChange,
        onGiveUp, onToggleRevealModal, onFinishGame,
        onPathChange, onGuessFinish,
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};
