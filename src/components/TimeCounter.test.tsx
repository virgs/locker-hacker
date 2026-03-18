import * as React from "react";
import { jest } from "@jest/globals";
import { renderToStaticMarkup } from "react-dom/server";

const mockUseGameContext = jest.fn();

jest.unstable_mockModule("./PlayAreaCounter.styled.tsx", () => {
    const buildStub = (tag: "div" | "span"): React.FC<React.PropsWithChildren> =>
        ({ children }) => React.createElement(tag, null, children);
    return {
        PlayAreaCounter: buildStub("div"),
        CounterIcon: buildStub("span"),
        CounterLabel: buildStub("span"),
        CounterMetric: buildStub("div"),
        CounterValue: buildStub("span"),
    };
});

jest.unstable_mockModule("../context/GameContext.tsx", () => ({
    useGameContext: mockUseGameContext,
}));

describe("TimeCounter", () => {
    it("returns nothing before the first guess", async () => {
        mockUseGameContext.mockReturnValue({
            pathHistory: [],
            elapsedSeconds: 42,
        });
        const { default: TimeCounter } = await import("./TimeCounter.tsx");

        expect(renderToStaticMarkup(<TimeCounter />)).toBe("");
    });

    it("renders the elapsed time after the round starts", async () => {
        mockUseGameContext.mockReturnValue({
            pathHistory: [[0, 1, 2, 3]],
            elapsedSeconds: 125,
        });
        const { default: TimeCounter } = await import("./TimeCounter.tsx");

        const html = renderToStaticMarkup(<TimeCounter />);

        expect(html).toContain("Elapsed Time");
        expect(html).toContain("2:05");
    });
});
