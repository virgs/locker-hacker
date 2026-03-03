import { useState, useCallback, useRef, type ReactElement } from 'react'
import './App.scss'
import PatternLock from "./components/PatternLock.tsx";
import PatternHistory from "./components/PatternHistory.tsx";
import Navbar from "./components/Navbar.tsx";
import CodeRevealOverlay from "./components/CodeRevealOverlay.tsx";
import { AppLayout, ContentArea, MainArea, PatternLockSizer, Sidebar } from "./App.styled.tsx";
import { CodeGenerator } from "./game/CodeGenerator.ts";
import { GuessValidator } from "./game/GuessValidator.ts";
import {
    type Level,
    type PlayerCount,
    type GamePhase,
    LEVEL_CONFIGS,
    DEFAULT_LEVEL,
    DEFAULT_PLAYER_COUNT,
} from "./game/GameConfig.ts";
import { REVEAL_DELAY_MS } from "./components/Navbar.constants.ts";

export const App = (): ReactElement => {
    const [level, setLevel]             = useState<Level>(DEFAULT_LEVEL);
    const [playerCount, setPlayerCount] = useState<PlayerCount>(DEFAULT_PLAYER_COUNT);
    const [phase, setPhase]             = useState<GamePhase>("idle");
    const [code, setCode]               = useState<number[]>([]);
    const [path, setPath]               = useState<number[]>([]);
    const [pathHistory, setPathHistory]  = useState<number[][]>([]);
    const [revealing, setRevealing]      = useState(false);
    const [gameKey, setGameKey]          = useState(0);
    const revealTimer                    = useRef<ReturnType<typeof setTimeout> | null>(null);

    const config = LEVEL_CONFIGS[level];

    const startGame = useCallback((): void => {
        if (revealTimer.current) clearTimeout(revealTimer.current);
        const newCode = new CodeGenerator(config).generate();
        setCode(newCode);
        setPath([]);
        setPathHistory([]);
        setPhase("playing");
        setRevealing(false);
        setGameKey(prev => prev + 1);
    }, [config]);

    const revealCode = useCallback((): void => {
        setRevealing(true);
        revealTimer.current = setTimeout(() => {
            setRevealing(false);
            setPhase("idle");
            setPath([]);
            setPathHistory([]);
            setCode([]);
            setGameKey(prev => prev + 1);
        }, REVEAL_DELAY_MS);
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

    const isPlaying = phase === "playing" && !revealing;

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
                show={revealing}
            />
        </AppLayout>
    );
};

export default App;

