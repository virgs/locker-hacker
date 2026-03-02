# locker-hacker

A *Bulls and Cows* code-breaking game played with pattern lock paths over a grid of dots.

## How It Works

A hidden code is a **sequence of distinct dots** drawn on a rectangular grid. Players submit guesses and receive feedback:

* **Bulls** — dots correct in both identity and position
* **Cows** — dots present in the code but in the wrong position

The game ends when Bulls == code length.

## Game Rules

* No dot may appear twice in a code or guess.
* A move is invalid if the straight line to the target passes through an unvisited dot (same as `allowJumping=false` in the pattern lock component).

See [rules.md](./rules.md) for the full specification.

## Architecture

```
src/
├── components/          # PatternLock React component
│   ├── PatternLock.tsx
│   ├── PatternLock.styled.tsx
│   ├── Connectors.tsx
│   ├── Point.tsx
│   └── usePatternLock.ts
├── game/                # Game logic (pure TypeScript, framework-agnostic)
│   ├── CodeGenerator.ts   — generates a valid hidden code
│   └── GuessValidator.ts  — computes bulls/cows feedback
└── math/                # Geometry utilities shared by game and component
    ├── math.ts
    └── point.ts
```

### `CodeGenerator`

```ts
import { CodeGenerator } from './src/game/CodeGenerator';

const gen  = new CodeGenerator({ cols: 5, rows: 5, length: 4 });
const code = gen.generate(); // e.g. [0, 12, 7, 18]
```

### `GuessValidator`

```ts
import { GuessValidator } from './src/game/GuessValidator';

const validator = new GuessValidator(code);
const feedback  = validator.validate(guess); // { bulls: 1, cows: 2 }
const solved    = validator.isSolved(guess); // true when bulls === code.length
```

## Development

```bash
pnpm install   # install dependencies
pnpm dev       # start dev server
pnpm test      # run tests
pnpm lint      # lint
pnpm lint:fix  # auto-fix lint issues
pnpm build     # production build
```
