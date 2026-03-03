import { type ReactElement } from 'react'
import './App.scss'
import PatternLock from "./components/PatternLock.tsx";
import PatternHistory from "./components/PatternHistory.tsx";
import Navbar from "./components/Navbar.tsx";
import CodeRevealOverlay from "./components/CodeRevealOverlay.tsx";
import { AppLayout, ContentArea, MainArea, PatternLockSizer, Sidebar } from "./App.styled.tsx";
import { GamePhase } from "./game/GameConfig.ts";
import { useGameContext } from "./context/GameContext.tsx";

export const App = (): ReactElement => {
    const { phase, path, gameKey, gridConfig, onPathChange, onGuessFinish } = useGameContext();

    return (
        <AppLayout>
            <Navbar />
            <ContentArea>
                <MainArea>
                    <PatternLockSizer>
                        <PatternLock
                            key={gameKey}
                            containerSize="100%"
                            pointSize={20}
                            cols={gridConfig.cols}
                            rows={gridConfig.rows}
                            path={path}
                            allowJumping={false}
                            invisible={false}
                            disabled={phase !== GamePhase.Playing}
                            onChange={onPathChange}
                            onFinish={onGuessFinish}
                        />
                    </PatternLockSizer>
                </MainArea>
                <Sidebar>
                    <PatternHistory />
                </Sidebar>
            </ContentArea>
            <CodeRevealOverlay />
        </AppLayout>
    );
};

export default App;
