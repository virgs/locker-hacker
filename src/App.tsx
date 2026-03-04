import { type ReactElement } from 'react'
import './App.scss'
import PatternLock from "./components/PatternLock.tsx";
import PatternHistory from "./components/PatternHistory.tsx";
import Navbar from "./components/Navbar.tsx";
import Footer from "./components/Footer.tsx";
import CodeRevealOverlay from "./components/CodeRevealOverlay.tsx";
import TurnAnnouncement from "./components/TurnAnnouncement.tsx";
import { AppLayout, ContentArea, MainArea, PatternLockSizer, Sidebar, SidebarHeader, SidebarContent } from "./App.styled.tsx";
import { GamePhase, PlayerCount } from "./game/GameConfig.ts";
import { getPlayerColor } from "./game/playerColors.ts";
import { useGameContext } from "./context/GameContext.tsx";
import { HistoryTitle } from "./components/PatternHistory.tsx";

export const App = (): ReactElement => {
    const { phase, path, gameKey, gridConfig, playerCount, currentPlayer, onPathChange, onGuessFinish } = useGameContext();
    const pathColor = playerCount !== PlayerCount.One ? getPlayerColor(currentPlayer) : undefined;

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
                            targetLength={gridConfig.length}
                            pathColor={pathColor}
                            onChange={onPathChange}
                            onFinish={onGuessFinish}
                        />
                    </PatternLockSizer>
                </MainArea>
                <Sidebar>
                    <SidebarHeader>
                        <HistoryTitle />
                    </SidebarHeader>
                    <SidebarContent>
                        <PatternHistory />
                    </SidebarContent>
                </Sidebar>
            </ContentArea>
            <Footer />
            <CodeRevealOverlay />
            <TurnAnnouncement />
        </AppLayout>
    );
};

export default App;
