export type DotAnnotationSelection = "clear" | "eliminate" | "all" | `position-${number}`;

export interface DotAnnotationState {
    eliminated: boolean;
    positions: number[];
}

export interface ConfirmedDotAnnotation {
    index: number;
    positions: number[];
}

export type DotAnnotations = Record<number, DotAnnotationState | undefined>;

const createAllPositions = (codeLength: number): number[] =>
    Array.from({ length: Math.max(codeLength, 0) }, (_, index) => index + 1);

const normalizePositions = (
    positions: number[],
    codeLength: number,
): number[] =>
    Array.from(new Set(positions))
        .filter(position => Number.isInteger(position) && position >= 1 && position <= codeLength)
        .sort((left, right) => left - right);

const getPositionFromSelection = (selection: DotAnnotationSelection): number | null => {
    if (!selection.startsWith("position-")) return null;
    const position = Number(selection.replace("position-", ""));
    return Number.isInteger(position) && position >= 1 ? position : null;
};

const clearAnnotation = (
    annotations: DotAnnotations,
    index: number,
): DotAnnotations => {
    const next = { ...annotations };
    delete next[index];
    return next;
};

const setAnnotation = (
    annotations: DotAnnotations,
    index: number,
    annotation: DotAnnotationState,
): DotAnnotations => ({
    ...annotations,
    [index]: annotation,
});

export const getAnnotationSelections = (
    annotation: DotAnnotationState | undefined,
    codeLength: number,
): DotAnnotationSelection[] => {
    if (!annotation) return [];
    if (annotation.eliminated) return ["eliminate"];

    const positions = normalizePositions(annotation.positions, codeLength);
    if (positions.length === 0) return [];
    if (positions.length === codeLength) return ["all", ...positions.map(position => `position-${position}` as const)];
    return positions.map(position => `position-${position}` as const);
};

export const applyDotAnnotationSelection = (
    annotations: DotAnnotations,
    index: number,
    selection: DotAnnotationSelection,
    codeLength: number,
): DotAnnotations => {
    if (selection === "clear") return clearAnnotation(annotations, index);

    const current = annotations[index];
    if (selection === "eliminate") {
        if (current?.eliminated) return clearAnnotation(annotations, index);
        return setAnnotation(annotations, index, { eliminated: true, positions: [] });
    }

    if (selection === "all") {
        const positions = createAllPositions(codeLength);
        if (!current?.eliminated && normalizePositions(current?.positions ?? [], codeLength).length === positions.length) {
            return clearAnnotation(annotations, index);
        }
        return setAnnotation(annotations, index, { eliminated: false, positions });
    }

    const position = getPositionFromSelection(selection);
    if (position === null || position > codeLength) return annotations;

    const nextPositions = normalizePositions(
        current?.eliminated
            ? [position]
            : current?.positions.includes(position)
                ? current.positions.filter(entry => entry !== position)
                : [...(current?.positions ?? []), position],
        codeLength,
    );

    if (nextPositions.length === 0) return clearAnnotation(annotations, index);
    return setAnnotation(annotations, index, {
        eliminated: false,
        positions: nextPositions,
    });
};

export const getAnnotatedDotIndices = (
    annotations: DotAnnotations,
    type: "eliminated",
): number[] =>
    Object.entries(annotations)
        .filter(([, value]) => type === "eliminated" && value?.eliminated)
        .map(([index]) => Number(index));

export const getConfirmedDotAnnotations = (
    annotations: DotAnnotations,
): ConfirmedDotAnnotation[] =>
    Object.entries(annotations)
        .flatMap<ConfirmedDotAnnotation>(([index, value]) => {
            if (!value || value.eliminated) return [];
            if (value.positions.length === 0) return [];
            return [{ index: Number(index), positions: value.positions }];
        });
