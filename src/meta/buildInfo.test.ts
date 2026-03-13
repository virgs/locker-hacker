import { formatBuildLabel } from "./buildInfo.ts";

describe("formatBuildLabel", () => {
    it("prefixes the package version with v", () => {
        expect(formatBuildLabel("1.2.3")).toBe("v1.2.3");
    });

    it("preserves an existing v prefix", () => {
        expect(formatBuildLabel("v2.0.0")).toBe("v2.0.0");
    });

    it("appends the deployment build number when available", () => {
        expect(formatBuildLabel("1.2.3", "4567")).toBe("v1.2.3 (build 4567)");
    });

    it("ignores blank build numbers", () => {
        expect(formatBuildLabel("1.2.3", "   ")).toBe("v1.2.3");
    });
});
