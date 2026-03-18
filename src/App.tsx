import { useEffect, useRef, type ReactElement } from 'react'
import './App.scss'
import PatternLock from "./components/PatternLock.tsx";
import PatternHistory from "./components/PatternHistory.tsx";
import Navbar from "./components/Navbar.tsx";
import Footer from "./components/Footer.tsx";
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
import useLockSize from "./components/useLockSize.ts";
import useEndGameColor from "./components/useEndGameColor.ts";
import useConfetti from "./components/useConfetti.ts";
import GuessCounter from "./components/GuessCounter.tsx";
import { shouldScrollHistoryToBottom } from "./App.utils.ts";

export const App = (): ReactElement => {
    const {
        phase, path, code, gameKey, gridConfig, pathHistory, playerCount, currentPlayer, winner, revealedHints,
        isRunning, dotAnnotations, onPathChange, onGuessFinish, onSelectDotAnnotation,
    } = useGameContext();
    const isRevealing   = phase === GamePhase.Revealing;
    const multiColor    = playerCount !== PlayerCount.One ? getPlayerColor(currentPlayer) : undefined;
    const endGameColor  = useEndGameColor(phase, winner);
    const isMobile = useMediaQuery(BREAKPOINT_QUERIES.mobile);
    const {
        expanded,
        collapse,
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onContentTouchStart,
        onContentTouchMove,
        onContentTouchEnd,
    } = useSidebarResize(isMobile);
    const mainAreaRef = useRef<HTMLElement>(null);
    const sidebarContentRef = useRef<HTMLDivElement>(null);
    const wasExpandedRef = useRef(expanded);
    const previousGuessCountRef = useRef(pathHistory.length);
    const lockSize = useLockSize(mainAreaRef);
    const dragHandlers = { onPointerDown, onPointerMove, onPointerUp };

    useConfetti(isRevealing && winner !== null);

    useEffect(() => {
        if (shouldScrollHistoryToBottom(
            previousGuessCountRef.current,
            pathHistory.length,
            wasExpandedRef.current,
            expanded,
        )) {
            window.requestAnimationFrame(() => {
                const content = sidebarContentRef.current;
                if (!content) return;
                content.scrollTop = content.scrollHeight;
            });
        }
        wasExpandedRef.current = expanded;
        previousGuessCountRef.current = pathHistory.length;
    }, [expanded, pathHistory.length]);

    return (
        <AppLayout>
            <Navbar />
            <ContentArea>
                <MainArea ref={mainAreaRef}>
                    <GuessCounter />
                    {lockSize > 0 && (
                        <PatternLockSizer $size={lockSize}>
                            <PatternLock
                                key={gameKey}
                                className="react-pattern-lock--animated"
                                containerSize="100%"
                                pointSize={20}
                                cols={gridConfig.cols}
                                rows={gridConfig.rows}
                                path={isRevealing ? code : path}
                                allowJumping={false}
                                invisible={false}
                                disabled={isRevealing}
                                arrowHeads={isRevealing}
                                arrowHeadSize={16}
                                dynamicLineStyle={isRevealing}
                                targetLength={gridConfig.length}
                                pathColor={isRevealing ? endGameColor : multiColor}
                                hiddenPoints={isRevealing ? [] : revealedHints}
                                annotations={isRevealing || !isRunning ? {} : dotAnnotations}
                                onSelectPointAnnotation={isRevealing || !isRunning ? undefined : onSelectDotAnnotation}
                                onChange={onPathChange}
                                onFinish={onGuessFinish}
                            />
                        </PatternLockSizer>
                    )}
                </MainArea>
                {expanded && <ClickOutsideOverlay onClick={collapse} />}
                <Sidebar $expanded={expanded}>
                    <ResizeHandle
                        isMobile={isMobile}
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                    />
                    <SidebarInner {...(isMobile ? {} : dragHandlers)}>
                        <SidebarHeader {...(isMobile ? dragHandlers : {})}>
                            <HistoryTitle />
                        </SidebarHeader>
                        <SidebarContent
                            ref={sidebarContentRef}
                            onTouchStart={onContentTouchStart}
                            onTouchMove={onContentTouchMove}
                            onTouchEnd={onContentTouchEnd}
                        >
                            <PatternHistory expanded={expanded} />
                        </SidebarContent>
                    </SidebarInner>
                </Sidebar>
            </ContentArea>
            <Footer />
            <TurnAnnouncement />
        </AppLayout>
    );
};

export default App;
