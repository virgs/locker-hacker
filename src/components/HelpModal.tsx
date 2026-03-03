import * as React from "react";
import Modal from "react-bootstrap/Modal";
import { HelpList } from "./HelpModal.styled.tsx";

interface HelpModalProps {
    show    : boolean;
    onClose : () => void;
}

const HelpModal: React.FunctionComponent<HelpModalProps> = ({
    show,
    onClose,
}): React.ReactElement => (
    <Modal show={show} onHide={onClose} centered>
        <Modal.Header closeButton>
            <Modal.Title>How to Play</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <p>
                A <strong>hidden code</strong> is a sequence of <em>distinct dots</em> drawn on a grid.
                Submit guesses and receive feedback:
            </p>
            <HelpList>
                <li><strong style={{ color: "#22c55e" }}>● Green dots</strong> — correct dot in the <em>correct position</em>.</li>
                <li><strong style={{ color: "#eab308" }}>● Yellow dots</strong> — correct dot but <em>wrong position</em>.</li>
                <li><strong style={{ color: "#6b7280" }}>● Gray dots</strong> — dot <em>not in the code</em>.</li>
            </HelpList>
            <p className="mt-3 mb-0">
                The game ends when <strong>all dots are in the correct position</strong>.
                Dots may <em>not repeat</em>, and lines <em>cannot skip</em> over unvisited dots.
            </p>
        </Modal.Body>
    </Modal>
);

export default HelpModal;

