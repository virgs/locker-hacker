describe("platform detection logic", () => {
    const detectPlatform = (env: string | undefined): { isCapacitor: boolean; isWeb: boolean } => {
        const isCapacitor = env === "capacitor";
        return { isCapacitor, isWeb: !isCapacitor };
    };

    it("IS_CAPACITOR should be true when VITE_PLATFORM is 'capacitor'", () => {
        const result = detectPlatform("capacitor");
        expect(result.isCapacitor).toBe(true);
        expect(result.isWeb).toBe(false);
    });

    it("IS_CAPACITOR should be false when VITE_PLATFORM is undefined", () => {
        const result = detectPlatform(undefined);
        expect(result.isCapacitor).toBe(false);
        expect(result.isWeb).toBe(true);
    });

    it("IS_CAPACITOR should be false when VITE_PLATFORM is empty string", () => {
        const result = detectPlatform("");
        expect(result.isCapacitor).toBe(false);
        expect(result.isWeb).toBe(true);
    });

    it("IS_CAPACITOR should be false for any non-capacitor value", () => {
        const result = detectPlatform("web");
        expect(result.isCapacitor).toBe(false);
        expect(result.isWeb).toBe(true);
    });
});

