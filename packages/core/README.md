# @killianbrisset/kanban-core

Framework-agnostic helpers and shared domain types for building Kanban features. Use it standalone or together with `@killianbrisset/kanban-react`.

- Source: `packages/core`
- Entry: `src/index.ts`
- Types: `src/types.ts`

## Installation

```powershell
pnpm add @killianbrisset/kanban-core
# or with npm
npm i @killianbrisset/kanban-core
```

## Quick start

```ts
import { sortColumns, sortCards } from "@killianbrisset/kanban-core";
// import type { KanbanState, KanbanCard, KanbanColumn } from "@killianbrisset/kanban-core";

const columns = [
	{ id: "todo", title: "To do", position: 0 },
	{ id: "doing", title: "In progress", position: 1 },
	{ id: "done", title: "Done", position: 2 },
];

const cards = [
	{ id: "c1", columnId: "todo", title: "First", position: 0 },
	{ id: "c2", columnId: "todo", title: "Second", position: 1 },
];

const orderedColumns = sortColumns(columns);
const orderedCardsInTodo = sortCards(
	cards.filter((c) => c.columnId === "todo")
);
```

## API

- `sortColumns<T extends { position: number }>(cols: T[]): T[]`

  - Returns a new array of columns sorted by the numeric `position` field (ascending).

- `sortCards<T extends { position: number }>(cards: T[]): T[]`
  - Returns a new array of cards sorted by the numeric `position` field (ascending).

## Types

Import common domain types directly from the package. They are re-exported from `src/index.ts`.

```ts
import type {
	KanbanState,
	KanbanCard,
	KanbanColumn,
	MoveCardPayload,
	ReorderColumnPayload,
} from "@killianbrisset/kanban-core";
```

These types are consumed by the React package as well.

## Build

Build command (from repo root or package folder):

```powershell
pnpm --filter @killianbrisset/kanban-core build
```

Output bundles (CJS + ESM) and `.d.ts` are written to `dist/`.

## License

MIT
