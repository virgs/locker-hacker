export const shouldScrollHistoryToBottom = (
    wasExpanded: boolean,
    expanded: boolean,
): boolean => wasExpanded && !expanded;
