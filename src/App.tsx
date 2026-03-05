import { type ReactElement } from 'react'
import './App.scss'
import PatternLock from "./components/PatternLock.tsx";
import PatternHistory from "./components/PatternHistory.tsx";
import Navbar from "./components/Navbar.tsx";
import Footer from "./components/Footer.tsx";
import CodeRevealOverlay from "./components/CodeRevealOverlay.tsx";
import TurnAnnouncement from "./components/TurnAnnouncement.tsx";
import ResizeHandle from "./components/ResizeHandle.tsx";
import { AppLayout, ContentArea, MainArea, PatternLockSizer, Sidebar, SidebarInner, SidebarHeader, SidebarContent, ClickOutsideOverlay } from "./App.styled.tsx";
import { GamePhase, PlayerCount } from "./game/GameConfig.ts";
import { getPlayerColor } from "./game/playerColors.ts";
import { useGameContext } from "./context/GameContext.tsx";
import { HistoryTitle } from "./components/PatternHistory.tsx";
import useSidebarResize from "./components/useSidebarResize.ts";
import useMediaQuery from "./components/useMediaQuery.ts";
import { BREAKPOINT_QUERIES } from "./theme/breakpoints.ts";

export const App = (): ReactElement => {
    const { phase, path, gameKey, gridConfig, playerCount, currentPlayer, revealedHints, onPathChange, onGuessFinish } = useGameContext();
    const pathColor = playerCount !== PlayerCount.One ? getPlayerColor(currentPlayer) : undefined;
    const isMobile = useMediaQuery(BREAKPOINT_QUERIES.mobile);
    const { expanded, collapse, onPointerDown, onPointerMove, onPointerUp } = useSidebarResize(isMobile);

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
                            highlightedPoints={revealedHints}
                            onChange={onPathChange}
                            onFinish={onGuessFinish}
                        />
                    </PatternLockSizer>
                </MainArea>
                {expanded && <ClickOutsideOverlay onClick={collapse} />}
                <Sidebar $expanded={expanded}>
                    <ResizeHandle
                        isMobile={isMobile}
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                    />
                    <SidebarInner>
                        <SidebarHeader>
                            <HistoryTitle />
                        </SidebarHeader>
                        <SidebarContent>
                            <PatternHistory expanded={expanded} />
                        </SidebarContent>
                    </SidebarInner>
                </Sidebar>
            </ContentArea>
            <Footer />
            <CodeRevealOverlay />
            <TurnAnnouncement />
        </AppLayout>
    );
};

export default App;
