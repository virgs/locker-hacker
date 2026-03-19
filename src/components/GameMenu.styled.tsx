import styled from "styled-components";
import { BREAKPOINTS } from "../theme/breakpoints.ts";

export const MenuTabs = styled.div`
    display: flex;
    gap: 8px;
    margin-bottom: 18px;

    ${BREAKPOINTS.mobile} {
        gap: 6px;
        margin-bottom: 14px;
    }
`;

export const MenuBody = styled.div`
    min-height: 520px;

    ${BREAKPOINTS.mobile} {
        min-height: 460px;
    }
`;

export const MenuTab = styled.button<{ $active?: boolean }>`
    border: 1px solid ${({ $active }) => $active ? "rgba(42, 159, 214, 0.55)" : "rgba(255, 255, 255, 0.1)"};
    background: ${({ $active }) => $active ? "rgba(42, 159, 214, 0.16)" : "rgba(255, 255, 255, 0.03)"};
    color: ${({ $active }) => $active ? "rgba(255, 255, 255, 0.98)" : "rgba(255, 255, 255, 0.72)"};
    padding: 10px 14px;
    border-radius: 999px;
    font-size: 0.92rem;
    font-weight: 600;
    transition: background 140ms ease, border-color 140ms ease, color 140ms ease;

    ${BREAKPOINTS.mobile} {
        flex: 1;
        min-width: 0;
        padding: 10px 8px;
        font-size: 0.86rem;
    }
`;

export const SectionTitle = styled.h6`
    margin: 0 0 14px;
    font-size: 0.84rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.5);
`;

export const SettingsCard = styled.div`
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.03);
`;

export const SettingsRow = styled.label`
    display: flex;
    gap: 14px;
    align-items: flex-start;
    cursor: pointer;
`;

export const SettingsCopy = styled.div`
    flex: 1;
    min-width: 0;
`;

export const SettingsName = styled.div`
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
`;

export const SettingsDescription = styled.p`
    margin: 6px 0 0;
    font-size: 0.92rem;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.62);
`;

export const ToggleInput = styled.input`
    width: 44px;
    height: 24px;
    margin-top: 2px;
    accent-color: #2a9fd6;
    flex: 0 0 auto;
`;
