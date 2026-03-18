import styled from "styled-components";

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
`;

export const NotePreview = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-radius: 999px;
    font-size: 0.9rem;
`;

export const NotePreviewDot = styled.span<{ $tone: "danger" | "success" }>`
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    //background: white;
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.22);

    ${({ $tone }) => $tone === "success" ? `
        &::before {
            content: "";
            position: absolute;
            inset: -7px;
            border-radius: 50%;
            box-shadow:
                0 0 0 4px rgba(25, 135, 84, 0.12),
                0 0 14px rgba(25, 135, 84, 0.3);
        }
    ` : `
        &::before,
        &::after {
            content: "";
            position: absolute;
            width: 28px;
            height: 4px;
            border-radius: 999px;
            background: var(--bs-danger, #dc3545);
            box-shadow: 0 0 10px rgba(220, 53, 69, 0.35);
        }

        &::before {
            transform: rotate(45deg);
        }

        &::after {
            transform: rotate(-45deg);
        }
    `}
`;

export const NotePreviewConfirmedRing = styled.span`
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(25, 135, 84, 0.22) 0%, rgba(25, 135, 84, 0.08) 52%, rgba(25, 135, 84, 0.02) 68%, transparent 78%);

    .react-pattern-lock__point-confirmed-svg {
        position: absolute;
        inset: 0;
        overflow: visible;
        filter: drop-shadow(0 0 8px rgba(25, 135, 84, 0.22));
    }

    .react-pattern-lock__point-confirmed-outer-arc {
        stroke: rgba(25, 135, 84, 0.95);
        stroke-width: 3;
        fill: none;
        stroke-linecap: round;
    }

    .react-pattern-lock__point-confirmed-inner-arc {
        stroke: rgba(255, 255, 255, 0.2);
        stroke-width: 1.5;
        fill: none;
        stroke-linecap: round;
    }

    span {
        position: absolute;
        top: 50%;
        left: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: 800;
        line-height: 1;
        color: var(--bs-success, #198754);
        text-shadow:
            0 0 6px rgba(25, 135, 84, 0.35),
            0 0 12px rgba(25, 135, 84, 0.2);
    }
`;
