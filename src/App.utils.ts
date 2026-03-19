export const shouldScrollHistoryToBottom = (
    previousGuessCount: number,
    currentGuessCount: number,
    wasExpanded: boolean,
    expanded: boolean,
): boolean => {
    const guessCountChanged = previousGuessCount !== currentGuessCount;
    const collapsed = !expanded;

    return (guessCountChanged && collapsed) || (wasExpanded && collapsed);
};

export const preventContextMenu = (
    event: Pick<MouseEvent, "preventDefault">,
): void => {
    event.preventDefault();
};
