export const shouldScrollHistoryToBottom = (
    previousGuessCount: number,
    currentGuessCount: number,
    wasExpanded: boolean,
    expanded: boolean,
): boolean => previousGuessCount !== currentGuessCount || (wasExpanded && !expanded);
