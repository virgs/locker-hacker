import styled from "styled-components";
import { BREAKPOINTS } from "../theme/breakpoints.ts";

export const HelpList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 8px 0;

    li {
        padding: 8px 12px;
        border-radius: 6px;

        &:not(:last-child) {
            margin-bottom: 4px;
        }

        &:nth-child(odd) {
            background: rgba(255, 255, 255, 0.03);
        }
    }
`;

export const ExampleCaption = styled.h6`
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: rgba(255, 255, 255, 0.5);
    margin: 16px 0 8px;
`;

export const ExampleTable = styled.table`
    width: 100%;
    font-size: 0.82rem;
    border-collapse: collapse;

    th {
        font-weight: 600;
        color: rgba(255, 255, 255, 0.5);
        text-align: left;
        padding: 4px 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    td {
        padding: 6px 8px;
        vertical-align: top;
    }

    tbody tr:nth-child(odd) {
        background: rgba(255, 255, 255, 0.03);
    }

    code {
        font-size: 0.85em;
        letter-spacing: 1px;
    }
`;

export const NotesHelpRow = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 12px;
    justify-content: center;

    ${BREAKPOINTS.mobile} {
        flex-direction: column;
        align-items: center;
        flex-wrap: nowrap;
    }
`;

export const NotePreview = styled.span`
    display: inline-flex;
    align-items: center;
    font-size: 0.9rem;

    ${BREAKPOINTS.mobile} {
        width: min(100%, 280px);
    }
`;

export const NotePreviewMarker = styled.span`
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    flex: 0 0 72px;

    .react-pattern-lock__point-wrapper {
        width: 100%;
        height: 100%;
        flex: 1 0 100%;
    }
`;
