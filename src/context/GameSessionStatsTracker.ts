import { PlayerCount } from "../game/GameConfig.ts";

export class GameSessionStatsTracker {
    private started = false;
    private activeRecordId: string | null = null;

    public start = (recordId: string): void => {
        this.started = true;
        this.activeRecordId = recordId;
    };

    public reset = (): void => {
        this.started = false;
        this.activeRecordId = null;
    };

    public hasStarted = (): boolean => this.started;

    public getActiveRecordId = (playerCount: PlayerCount): string | null =>
        playerCount === PlayerCount.One && this.started ? this.activeRecordId : null;
}
