import * as React from "react";
import {
    HelpList,
    ExampleTable,
    ExampleCaption,
    NotesHelpRow,
    NotePreview,
    NotePreviewMarker,
} from "./HelpModal.styled.tsx";
import { FEEDBACK_THEME } from "./FeedbackIndicator.utils.ts";
import Point from "./Point.tsx";

const bull = FEEDBACK_THEME.bull;
const cow  = FEEDBACK_THEME.cow;
const miss = FEEDBACK_THEME.miss;

const FeedbackCell: React.FunctionComponent<{ entries: typeof bull[] }> = ({ entries }): React.ReactElement => (
    <td>
        {entries.map((e, i) => (
            <strong key={i} style={{ color: e.color, marginRight: 4 }}>{e.symbol}</strong>
        ))}
    </td>
);

export const HelpPanel: React.FunctionComponent = (): React.ReactElement => (
    <>
        <p>
            Connect the dots and <strong>crack the code!</strong>
        </p>
            Submit guesses and receive <strong>feedback</strong>:
        <p>
        </p>
        <HelpList>
            <li><strong style={{ color: bull.color }}>{bull.symbol}</strong> — correct dot in the <em>correct position</em>.</li>
            <li><strong style={{ color: cow.color }}>{cow.symbol}</strong> — correct dot but <em>wrong position</em>.</li>
            <li><strong style={{ color: miss.color }}>{miss.symbol}</strong> — dot <em>not in the code</em>.</li>
        </HelpList>

        <ExampleCaption>Examples</ExampleCaption>
        <ExampleTable>
            <thead>
                <tr><th>Secret</th><th>Guess</th><th>Feedback</th><th>Explanation</th></tr>
            </thead>
            <tbody>
                <tr>
                    <td><code>A B C D</code></td>
                    <td><code>A B E F</code></td>
                    <FeedbackCell entries={[bull, bull, miss, miss]} />
                    <td>A, B correct position; E, F not in code</td>
                </tr>
                <tr>
                    <td><code>A B C D</code></td>
                    <td><code>C D E A</code></td>
                    <FeedbackCell entries={[cow, cow, cow, miss]} />
                    <td>C, D, A are in code but wrong position; E not in code</td>
                </tr>
            </tbody>
        </ExampleTable>

        <p className="mt-3 mb-0">
            The game ends when the guess has <strong>all dots are in the correct position</strong>.<br/>
            Dots may <em>not repeat</em>, and lines <em>cannot skip</em> over unvisited dots.
        </p>
        <p className="mt-3 mb-0">
            <strong>Long-press a dot</strong>, then point toward a note and release to place it.
        </p>
        <NotesHelpRow>
            <NotePreview>
                <NotePreviewMarker aria-hidden={true}>
                    <Point
                        index={0}
                        pointSize={20}
                        pointActiveSize={30}
                        cols={1}
                        rows={1}
                        pop={false}
                        complete={false}
                        selected={false}
                        hidden={false}
                        annotation={{ eliminated: false, positions: [1, 2, 3, 4] }}
                        targetLength={4}
                    />
                </NotePreviewMarker>
                All positions
            </NotePreview>
            <NotePreview>
                <NotePreviewMarker aria-hidden={true}>
                    <Point
                        index={0}
                        pointSize={20}
                        pointActiveSize={30}
                        cols={1}
                        rows={1}
                        pop={false}
                        complete={false}
                        selected={false}
                        hidden={false}
                        annotation={{ eliminated: false, positions: [2] }}
                        targetLength={4}
                    />
                </NotePreviewMarker>
                Position #2
            </NotePreview>
            <NotePreview>
                <NotePreviewMarker aria-hidden={true}>
                    <Point
                        index={0}
                        pointSize={20}
                        pointActiveSize={30}
                        cols={1}
                        rows={1}
                        pop={false}
                        complete={false}
                        selected={false}
                        hidden={false}
                        annotation={{ eliminated: true, positions: [] }}
                    />
                </NotePreviewMarker>
                Eliminated
            </NotePreview>
        </NotesHelpRow>
    </>
);

export default HelpPanel;
