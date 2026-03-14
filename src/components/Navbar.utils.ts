export const HINT_ACTION_KEYS = {
    hint   : "hint",
    giveUp : "give-up",
} as const;

export type HintActionKey = typeof HINT_ACTION_KEYS[keyof typeof HINT_ACTION_KEYS];

interface HintActionHandlers {
    onRevealHint: () => void;
    onGiveUp: () => void;
}

export const runHintAction = (
    action: string | null,
    handlers: HintActionHandlers,
): void => {
    if (action === HINT_ACTION_KEYS.hint) {
        handlers.onRevealHint();
        return;
    }
    if (action === HINT_ACTION_KEYS.giveUp) {
        handlers.onGiveUp();
    }
};
