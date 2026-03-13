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

const metaEnv = import.meta.env ?? {};

const appVersion = getCompileTimeValue(
    metaEnv.VITE_APP_VERSION,
    "0.0.0",
);

const appBuildNumber = getCompileTimeValue(
    metaEnv.VITE_APP_BUILD_NUMBER,
    "",
);

export const BUILD_LABEL = formatBuildLabel(appVersion, appBuildNumber);
