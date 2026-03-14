export type DotAnnotation = "eliminated" | "confirmed";

export type DotAnnotations = Record<number, DotAnnotation | undefined>;

export const cycleDotAnnotation = (
    current?: DotAnnotation,
): DotAnnotation | undefined => {
    if (current === "eliminated") return "confirmed";
    if (current === "confirmed") return undefined;
    return "eliminated";
};

export const toggleDotAnnotation = (
    annotations: DotAnnotations,
    index: number,
): DotAnnotations => {
    const next = cycleDotAnnotation(annotations[index]);

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
    type: DotAnnotation,
): number[] =>
    Object.entries(annotations)
        .filter(([, value]) => value === type)
        .map(([index]) => Number(index));
