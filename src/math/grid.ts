export const toCoord = (id: number, cols: number): { r: number; c: number } => ({
    r: Math.floor(id / cols),
    c: id % cols,
});

export const toId = (r: number, c: number, cols: number): number =>
    r * cols + c;

export const dotCount = (cols: number, rows: number): number =>
    cols * rows;

