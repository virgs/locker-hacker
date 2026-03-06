import { PlayerCount } from "../game/GameConfig.ts";

export class GameSessionStatsTracker {
    private started = false;
    private persisted = false;

    public start = (): void => {
        this.started = true;
    };

    public reset = (): void => {
        this.started = false;
        this.persisted = false;
    };

    public markPersisted = (): void => {
        this.persisted = true;
    };

    public canPersist = (playerCount: PlayerCount): boolean =>
        playerCount === PlayerCount.One && this.started && !this.persisted;
}
