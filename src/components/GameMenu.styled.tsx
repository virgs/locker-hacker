import styled from "styled-components";
import { BREAKPOINTS } from "../theme/breakpoints.ts";

export const MenuBody = styled.div`
    min-height: 520px;
    display: grid;
    gap: 12px;

    ${BREAKPOINTS.mobile} {
        min-height: 460px;
        gap: 10px;
    }
`;

export const AccordionItem = styled.section`
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.035);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
`;

export const AccordionHeader = styled.button`
    width: 100%;
    border: none;
    background: transparent;
    color: rgba(255, 255, 255, 0.95);
    padding: 15px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    font-size: 1rem;
    font-weight: 700;
    text-align: left;
    transition: background 140ms ease, color 140ms ease;

    &:hover {
        background: rgba(255, 255, 255, 0.04);
    }

    ${BREAKPOINTS.mobile} {
        padding: 14px 15px;
        font-size: 0.95rem;
    }
`;

export const AccordionTitle = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
`;

export const AccordionIcon = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 999px;
    color: rgba(42, 159, 214, 0.94);
    background: rgba(42, 159, 214, 0.14);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
    flex: 0 0 auto;
`;

export const AccordionChevron = styled.span<{ $open?: boolean }>`
    color: rgba(255, 255, 255, 0.56);
    font-size: 1.15rem;
    line-height: 1;
    transform: rotate(${({ $open }) => $open ? "180deg" : "0deg"});
    transition: transform 140ms ease, color 140ms ease;
    flex: 0 0 auto;
`;

export const AccordionBody = styled.div`
    padding: 0 18px 18px;

    ${BREAKPOINTS.mobile} {
        padding: 0 15px 15px;
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
