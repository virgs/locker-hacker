const normalizeBuildNumber = (buildNumber: string): string => {
    return buildNumber.trim();
};

const normalizeVersion = (version: string): string => {
    const trimmed = version.trim();
    return trimmed.startsWith("v") ? trimmed : `v${trimmed}`;
};

export const formatBuildLabel = (version: string, buildNumber?: string): string => {
    const normalizedVersion = normalizeVersion(version);
    const normalizedBuildNumber = normalizeBuildNumber(buildNumber ?? "");
    if (!normalizedBuildNumber) {
        return normalizedVersion;
    }
    return `${normalizedVersion} (build ${normalizedBuildNumber})`;
};

const getCompileTimeValue = (value: string | undefined, fallback: string): string => {
    return value && value.trim() ? value : fallback;
};

const appVersion = getCompileTimeValue(
    typeof __APP_VERSION__ === "undefined" ? undefined : __APP_VERSION__,
    "0.0.0",
);

const appBuildNumber = getCompileTimeValue(
    typeof __APP_BUILD_NUMBER__ === "undefined" ? undefined : __APP_BUILD_NUMBER__,
    "",
);

export const BUILD_LABEL = formatBuildLabel(appVersion, appBuildNumber);
