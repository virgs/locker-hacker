# locker-hacker

A *Bulls and Cows* code-breaking game played with pattern lock paths over a grid of dots.

## How It Works

A hidden code is a **sequence of distinct dots** drawn on a rectangular grid. Players submit guesses and receive feedback:

* **Bulls** — dots correct in both identity and position
* **Cows** — dots present in the code but in the wrong position

The game ends when Bulls == code length.

## Features

* **Level selection** — Easy (3×2, length 3), Medium (3×3, length 4), Hard (4×4, length 5)
* **Play/Give Up flow** — Press Play to start; press Give Up to surrender and reveal the secret code, then choose Dismiss (keeps history visible, lock disabled) or Finish (resets to idle so you can reconfigure and play again)
* **Player count** — Select 1–4 players (future multiplayer support)
* **Help modal** — In-app game rules with a "Play Now" button
* **Responsive** — Works on desktop and mobile, navbar wraps to two rows on small screens

## Game Rules

* No dot may appear twice in a code or guess.
* A move is invalid if the straight line to the target passes through an unvisited dot (same as `allowJumping=false` in the pattern lock component).

See [rules.md](./rules.md) for the full specification.

## Architecture

```
src/
├── components/          # React components
│   ├── PatternLock.tsx        — main grid + drawing component
│   ├── PatternLock.styled.tsx — global CSS-in-JS styles
│   ├── PatternHistory.tsx     — renders the list of past guesses
│   ├── Navbar.tsx             — game controls (dropdowns, play/reveal, help)
│   ├── HelpModal.tsx          — how-to-play modal
│   ├── CodeRevealOverlay.tsx  — secret code reveal overlay
│   ├── Connectors.tsx
│   ├── Point.tsx
│   └── usePatternLock.ts
├── game/                # Game logic (pure TypeScript, framework-agnostic)
│   ├── CodeGenerator.ts   — generates a valid hidden code
│   ├── GameConfig.ts      — level/player types and constants
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
