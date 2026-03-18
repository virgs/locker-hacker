export type DotAnnotation = "eliminated" | "confirmed" | `confirmed-${number}`;

export interface ConfirmedDotAnnotation {
    index: number;
    position: number | null;
}

export type DotAnnotations = Record<number, DotAnnotation | undefined>;

export const cycleDotAnnotation = (
    current?: DotAnnotation,
    codeLength = 0,
): DotAnnotation | undefined => {
    if (!current) return "eliminated";
    if (current === "eliminated") return "confirmed";
    if (current === "confirmed") return codeLength > 0 ? "confirmed-1" : undefined;

    const position = Number(current.replace("confirmed-", ""));
    if (!Number.isInteger(position) || position < 1) return undefined;
    if (position >= codeLength) return undefined;
    return `confirmed-${position + 1}`;
};

export const toggleDotAnnotation = (
    annotations: DotAnnotations,
    index: number,
    codeLength: number,
): DotAnnotations => {
    const next = cycleDotAnnotation(annotations[index], codeLength);

    if (next) {
        return {
            ...annotations,
            [index]: next,
        };
    }

    const rest = { ...annotations };
    delete rest[index];
    return rest;
};

export const getAnnotatedDotIndices = (
    annotations: DotAnnotations,
    type: "eliminated",
): number[] =>
    Object.entries(annotations)
        .filter(([, value]) => value === type)
        .map(([index]) => Number(index));

export const getConfirmedDotAnnotations = (
    annotations: DotAnnotations,
): ConfirmedDotAnnotation[] =>
    Object.entries(annotations)
        .flatMap<ConfirmedDotAnnotation>(([index, value]) => {
            if (!value || value === "eliminated") return [];
            if (value === "confirmed") {
                return [{ index: Number(index), position: null }];
            }

            const position = Number(value.replace("confirmed-", ""));
            if (!Number.isInteger(position) || position < 1) return [];
            return [{ index: Number(index), position }];
        });
