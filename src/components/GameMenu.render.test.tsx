import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

type ESMJest = ImportMeta["jest"] & {
    unstable_mockModule: (moduleName: string, factory: () => unknown) => void;
};

const jest = import.meta.jest as ESMJest;
const mockUseGameContext = jest.fn();

jest.unstable_mockModule("react-bootstrap/Modal", () => {
    const Modal = ({ children }: React.PropsWithChildren): React.ReactElement =>
        React.createElement("section", null, children);
    Modal.Header = ({ children }: React.PropsWithChildren): React.ReactElement =>
        React.createElement("header", null, children);
    Modal.Title = ({ children }: React.PropsWithChildren): React.ReactElement =>
        React.createElement("h1", null, children);
    Modal.Body = ({ children }: React.PropsWithChildren): React.ReactElement =>
        React.createElement("div", null, children);
    Modal.Footer = ({ children }: React.PropsWithChildren): React.ReactElement =>
        React.createElement("footer", null, children);
    return { default: Modal };
});

jest.unstable_mockModule("../context/GameContext.tsx", () => ({
    useGameContext: mockUseGameContext,
}));

jest.unstable_mockModule("./HelpModal.tsx", () => ({
    HelpPanel: (): React.ReactElement => React.createElement("div", null, "help panel"),
}));

jest.unstable_mockModule("./StatsModal.tsx", () => ({
    StatsPanel: (): React.ReactElement => React.createElement("div", null, "stats panel"),
}));

jest.unstable_mockModule("./GameMenu.styled.tsx", () => {
    const stub = (tag: "div" | "button" | "h6" | "label" | "p" | "input"): React.FC<React.PropsWithChildren<Record<string, unknown>>> =>
        ({ children, ...props }) => {
            const filteredProps = Object.fromEntries(
                Object.entries(props).filter(([key]) => !key.startsWith("$")),
            );
            return React.createElement(tag, filteredProps, children);
        };
    return {
        MenuBody: stub("div"),
        MenuTabs: stub("div"),
        MenuTab: stub("button"),
        SectionTitle: stub("h6"),
        SettingsCard: stub("div"),
        SettingsRow: stub("label"),
        SettingsCopy: stub("div"),
        SettingsDescription: stub("p"),
        SettingsName: stub("div"),
        ToggleInput: stub("input"),
    };
});

jest.unstable_mockModule("./StatsModal.styled.tsx", () => {
    const stub = (tag: "div" | "p"): React.FC<React.PropsWithChildren<Record<string, unknown>>> =>
        ({ children, ...props }) => React.createElement(tag, props, children);
    return {
        BuildLabel: stub("div"),
    };
});

describe("GameMenu", () => {
    it("renders the help section when the shared menu opens on help", async () => {
        mockUseGameContext.mockReturnValue({
            showGameMenu: true,
            activeGameMenuSection: "help",
            annotationsEnabled: true,
            onCloseGameMenu: jest.fn(),
            onOpenGameMenu: jest.fn(),
            onToggleAnnotationsEnabled: jest.fn(),
        });
        const { default: GameMenu } = await import("./GameMenu.tsx");
        const html = renderToStaticMarkup(<GameMenu />);

        expect(html).toContain("How to Play");
        expect(html).toContain("help panel");
        expect(html).toContain("Settings");
    });

    it("renders the settings switch state from context", async () => {
        mockUseGameContext.mockReturnValue({
            showGameMenu: true,
            activeGameMenuSection: "settings",
            annotationsEnabled: false,
            onCloseGameMenu: jest.fn(),
            onOpenGameMenu: jest.fn(),
            onToggleAnnotationsEnabled: jest.fn(),
        });
        const { default: GameMenu } = await import("./GameMenu.tsx");
        const html = renderToStaticMarkup(<GameMenu />);

        expect(html).toContain("Enable annotations");
        expect(html).toContain("Turn in-game dot annotations on or off.");
        expect(html).toContain('role="switch"');
        expect(html).not.toContain("checked");
    });
});
