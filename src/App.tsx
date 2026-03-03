import { useState, useCallback, type ReactElement } from 'react'
import './App.scss'
import PatternLock from "./components/PatternLock.tsx";
import PatternHistory from "./components/PatternHistory.tsx";
import Navbar from "./components/Navbar.tsx";
import CodeRevealOverlay from "./components/CodeRevealOverlay.tsx";
import { AppLayout, ContentArea, MainArea, PatternLockSizer, Sidebar } from "./App.styled.tsx";
import { CodeGenerator } from "./game/CodeGenerator.ts";
import { GuessValidator } from "./game/GuessValidator.ts";
import {
    Level,
    PlayerCount,
    GamePhase,
    LEVEL_CONFIGS,
    DEFAULT_LEVEL,
    DEFAULT_PLAYER_COUNT,
} from "./game/GameConfig.ts";

export const App = (): ReactElement => {
    const [level, setLevel]             = useState<Level>(DEFAULT_LEVEL);
    const [playerCount, setPlayerCount] = useState<PlayerCount>(DEFAULT_PLAYER_COUNT);
    const [phase, setPhase]             = useState<GamePhase>(GamePhase.Idle);
    const [code, setCode]               = useState<number[]>([]);
    const [path, setPath]               = useState<number[]>([]);
    const [pathHistory, setPathHistory]  = useState<number[][]>([]);
    const [gameKey, setGameKey]          = useState(0);

    const config = LEVEL_CONFIGS[level];

    const startGame = useCallback((): void => {
        const newCode = new CodeGenerator(config).generate();
        setCode(newCode);
        setPath([]);
        setPathHistory([]);
        setPhase(GamePhase.Playing);
        setGameKey(prev => prev + 1);
    }, [config]);

    const revealCode = useCallback((): void => {
        setPhase(GamePhase.Revealing);
    }, []);

    const dismissReveal = useCallback((): void => {
        setPhase(GamePhase.GameOver);
        setGameKey(prev => prev + 1);
    }, []);

    const finishGame = useCallback((): void => {
        setCode([]);
        setPath([]);
        setPathHistory([]);
        setPhase(GamePhase.Idle);
        setGameKey(prev => prev + 1);
    }, []);

    const onFinish = useCallback((): void => {
        if (path.length !== config.length) {
            setPath([]);
            return;
        }
        const feedback = new GuessValidator(code).validate(path);
        console.log(feedback);
        setPathHistory(prev => [...prev, path]);
        setPath([]);
    }, [path, config.length, code]);

    const isPlaying = phase === GamePhase.Playing;

    return (
        <AppLayout>
            <Navbar
                phase={phase}
                level={level}
                playerCount={playerCount}
                onLevelChange={setLevel}
                onPlayerCountChange={setPlayerCount}
                onPlay={startGame}
                onReveal={revealCode}
            />
            <ContentArea>
                <MainArea>
                    <PatternLockSizer>
                        <PatternLock
                            key={gameKey}
                            containerSize="100%"
                            pointSize={20}
                            cols={config.cols}
                            rows={config.rows}
                            path={path}
                            allowJumping={false}
                            invisible={false}
                            disabled={!isPlaying}
                            onChange={(pattern) => setPath(pattern)}
                            onFinish={onFinish}
                        />
                    </PatternLockSizer>
                </MainArea>
                <Sidebar>
                    <PatternHistory
                        pathHistory={pathHistory}
                        code={code}
                        cols={config.cols}
                        rows={config.rows}
                        entrySize={100}
                    />
                </Sidebar>
            </ContentArea>
            <CodeRevealOverlay
                code={code}
                cols={config.cols}
                rows={config.rows}
                show={phase === GamePhase.Revealing}
                onDismiss={dismissReveal}
                onFinish={finishGame}
            />
        </AppLayout>
    );
};

export default App;

