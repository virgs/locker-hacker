import { createGlobalStyle } from "styled-components";

export const PatternLockStyles = createGlobalStyle`
    * {
        user-select: none;
    }

    .react-pattern-lock__pattern-wrapper {
        touch-action: none;
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        position: relative;
    }
    .react-pattern-lock__connector-wrapper {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
        pointer-events: none;
    }
    .react-pattern-lock__connector {
        background: white;
        position: absolute;
        transform-origin: center left;
    }
    .react-pattern-lock__point-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        z-index: 2;
    }
    .react-pattern-lock__point {
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .react-pattern-lock__point-inner {
        background: white;
        border-radius: 50%;
    }
    .react-pattern-lock__point-inner.active {
        animation: pop 300ms ease;
    }
    .react-pattern-lock__pattern-wrapper.disabled,
    .react-pattern-lock__pattern-wrapper.disabled .react-pattern-lock__point {
        cursor: not-allowed;
    }
    .react-pattern-lock__pattern-wrapper.disabled .react-pattern-lock__point-inner,
    .react-pattern-lock__pattern-wrapper.disabled .react-pattern-lock__connector {
        background: grey;
    }

    .react-pattern-lock__pattern-wrapper.success .react-pattern-lock__point-inner,
    .react-pattern-lock__pattern-wrapper.success .react-pattern-lock__connector {
        background: #00ff00;
    }

    .react-pattern-lock__pattern-wrapper.error .react-pattern-lock__point-inner,
    .react-pattern-lock__pattern-wrapper.error .react-pattern-lock__connector {
        background: red;
    }

    .react-pattern-lock__arrow-head {
        position: absolute;
        left: 100%;
        top: 50%;
        transform: translateY(-50%);
        width: 0;
        height: 0;
        border-style: solid;
        border-top-color: transparent;
        border-bottom-color: transparent;
        border-right-width: 0;
        border-right-color: transparent;
        border-left-color: white;
    }
    .react-pattern-lock__pattern-wrapper.disabled .react-pattern-lock__arrow-head {
        border-left-color: grey;
    }
    .react-pattern-lock__pattern-wrapper.success .react-pattern-lock__arrow-head {
        border-left-color: #00ff00;
    }
    .react-pattern-lock__pattern-wrapper.error .react-pattern-lock__arrow-head {
        border-left-color: red;
    }

    @keyframes pop {
        from { transform: scale(1); }
        50% { transform: scale(2); }
        to { transform: scale(1); }
    }
`;
