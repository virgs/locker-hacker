import { useState, useEffect, type RefObject } from 'react';

const MAX_LOCK_SIZE = 500;

const useLockSize = (ref: RefObject<HTMLElement | null>): number => {
    const [size, setSize] = useState<number>(0);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const update = (): void => {
            const s = getComputedStyle(el);
            const availW = el.clientWidth  - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight);
            const availH = el.clientHeight - parseFloat(s.paddingTop)  - parseFloat(s.paddingBottom);
            setSize(Math.floor(Math.min(availW, availH, MAX_LOCK_SIZE)));
        };

        const observer = new ResizeObserver(update);
        observer.observe(el);
        update();
        return () => observer.disconnect();
    }, [ref]);

    return size;
};

export default useLockSize;
