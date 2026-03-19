import * as React from "react";
import { PlayerCount, Level } from "../game/GameConfig.ts";
import { GameSessionStatsTracker } from "./GameSessionStatsTracker.ts";
import { createRecordId, saveRecord, updateRecord } from "../game/StatsService.ts";

interface UseSinglePlayerStatsPersistenceOptions {
    trackerRef      : React.RefObject<GameSessionStatsTracker>;
    playerCount     : PlayerCount;
    level           : Level;
    elapsedSeconds  : number;
    pathHistorySize : number;
    hintsUsed       : number;
}

interface FinalizeOptions {
    won           : boolean;
    movesOverride?: number;
}

interface UseSinglePlayerStatsPersistenceResult {
    activeRecordId : string | null;
    markStarted    : (movesOverride?: number) => void;
    finalizeActive : (options: FinalizeOptions) => void;
    resumeActive   : (recordId: string, movesOverride?: number) => void;
    resetActive    : () => void;
}

export const useSinglePlayerStatsPersistence = ({
    trackerRef,
    playerCount,
    level,
    elapsedSeconds,
    pathHistorySize,
    hintsUsed,
}: UseSinglePlayerStatsPersistenceOptions): UseSinglePlayerStatsPersistenceResult => {
    const [activeRecordId, setActiveRecordId] = React.useState<string | null>(null);
    const getSnapshot = React.useCallback((movesOverride?: number) => ({
        level,
        won             : false,
        completed       : false,
        durationSeconds : elapsedSeconds,
        moves           : movesOverride ?? pathHistorySize,
        hintsUsed,
    }), [elapsedSeconds, hintsUsed, level, pathHistorySize]);

    const markStarted = React.useCallback((movesOverride?: number): void => {
        if (playerCount !== PlayerCount.One || trackerRef.current.hasStarted()) return;
        const recordId = createRecordId();
        saveRecord({ id: recordId, ...getSnapshot(movesOverride), date: new Date().toISOString() });
        trackerRef.current.start(recordId);
        setActiveRecordId(recordId);
    }, [getSnapshot, playerCount, trackerRef]);

    React.useEffect(() => {
        if (activeRecordId === null) return;
        updateRecord(activeRecordId, getSnapshot());
    }, [activeRecordId, getSnapshot]);

    const finalizeActive = React.useCallback(({ won, movesOverride }: FinalizeOptions): void => {
        const recordId = trackerRef.current.getActiveRecordId(playerCount);
        if (recordId === null) return;
        updateRecord(recordId, { ...getSnapshot(movesOverride), won, completed: true });
        trackerRef.current.reset();
        setActiveRecordId(null);
    }, [getSnapshot, playerCount, trackerRef]);

    const resumeActive = React.useCallback((recordId: string, movesOverride?: number): void => {
        if (playerCount !== PlayerCount.One || recordId.length === 0) return;
        updateRecord(recordId, { ...getSnapshot(movesOverride), completed: false });
        trackerRef.current.start(recordId);
        setActiveRecordId(recordId);
    }, [getSnapshot, playerCount, trackerRef]);

    const resetActive = React.useCallback((): void => {
        trackerRef.current.reset();
        setActiveRecordId(null);
    }, [trackerRef]);

    return { activeRecordId, markStarted, finalizeActive, resumeActive, resetActive };
};
