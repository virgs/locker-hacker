import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

type ESMJest = ImportMeta["jest"] & {
    unstable_mockModule: (moduleName: string, factory: () => unknown) => void;
};

const jest = import.meta.jest as ESMJest;
const mockUseGameContext = jest.fn();

jest.unstable_mockModule("./GuessCounter.styled.tsx", () => {
    const buildStub = (tag: "div" | "span"): React.FC<React.PropsWithChildren> =>
        ({ children }) => React.createElement(tag, null, children);
    return {
        GuessCounterWrapper: buildStub("div"),
        AttemptDots: buildStub("div"),
        AttemptDot: buildStub("span"),
        OverflowBadge: buildStub("span"),
        AttemptLabel: buildStub("span"),
    };
});

jest.unstable_mockModule("./PlayAreaCounter.styled.tsx", () => {
    const buildStub = (tag: "div" | "span"): React.FC<React.PropsWithChildren> =>
        ({ children }) => React.createElement(tag, null, children);
    return {
        CounterIcon: buildStub("span"),
        CounterMetric: buildStub("div"),
        CounterValue: buildStub("span"),
    };
});

jest.unstable_mockModule("../context/GameContext.tsx", () => ({
    useGameContext: mockUseGameContext,
}));

describe("GuessCounter", () => {
    it("returns nothing before the first guess", async () => {
        mockUseGameContext.mockReturnValue({
            pathHistory: [],
        });
        const { default: GuessCounter } = await import("./GuessCounter.tsx");

        expect(renderToStaticMarkup(<GuessCounter />)).toBe("");
    });

    it("renders the guess count once the round has started", async () => {
        mockUseGameContext.mockReturnValue({
            pathHistory: [[0, 1, 2], [0, 2, 3]],
        });
        const { default: GuessCounter } = await import("./GuessCounter.tsx");
        const html = renderToStaticMarkup(<GuessCounter />);

        expect(html).toContain("2 guesses");
        expect(html).toContain(">2<");
    });
});
