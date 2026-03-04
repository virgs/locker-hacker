import { GuessValidator } from "../game/GuessValidator.ts";
import type { Path, Observation } from "./types.ts";

export const filterCandidates = (
    candidates: ReadonlyArray<Path>,
    observation: Observation,
): ReadonlyArray<Path> => {
    const { guess, feedback } = observation;
    return candidates.filter(candidate => {
        const validator = new GuessValidator([...candidate]);
        const result    = validator.validate([...guess]);
        return result.bulls === feedback.bulls && result.cows === feedback.cows;
    });
};

