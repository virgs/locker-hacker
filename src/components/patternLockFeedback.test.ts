import { getConnectorClassName, getPointWrapperClassName } from "./patternLockFeedback.ts";

describe("patternLockFeedback", () => {
    describe("getPointWrapperClassName", () => {
        it("Should include selected and latest modifiers when both states are true", () => {
            expect(getPointWrapperClassName({ selected: true, latest: true })).toBe("react-pattern-lock__point-wrapper selected latest");
        });

        it("Should include only selected when the point is not the latest", () => {
            expect(getPointWrapperClassName({ selected: true, latest: false })).toBe("react-pattern-lock__point-wrapper selected");
        });

        it("Should return the base class when the point is neither selected nor latest", () => {
            expect(getPointWrapperClassName({ selected: false, latest: false })).toBe("react-pattern-lock__point-wrapper");
        });
    });

    describe("getConnectorClassName", () => {
        it("Should mark the newest connector", () => {
            expect(getConnectorClassName(true)).toBe("react-pattern-lock__connector latest");
        });

        it("Should leave older connectors unmodified", () => {
            expect(getConnectorClassName(false)).toBe("react-pattern-lock__connector");
        });
    });
});
