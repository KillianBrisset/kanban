# @killianbrisset/kanban-react

React Kanban board built on top of `@dnd-kit`. Focuses on precise in-column sorting, cross-column moves, column reordering, and small UI primitives. A simple theme with CSS variables is showcased via Storybook.

- Source: `packages/react`
- Entry: `src/index.ts`
- Main exports: `KanbanBoard`, `useKanban`, `Avatar`, `Badge`, `DueDatePill`

Peer dependencies:

- `react >= 19`, `react-dom >= 19`
- `@dnd-kit/core >= 6`

This package also depends on `@dnd-kit/sortable`, `@dnd-kit/utilities`, and `@killianbrisset/kanban-core`.

## Installation

```powershell
pnpm add @killianbrisset/kanban-react @killianbrisset/kanban-core @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities react react-dom
# or with npm
npm i @killianbrisset/kanban-react @killianbrisset/kanban-core @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities react react-dom
```

## Quick start

```tsx
import React, { useMemo, useState } from "react";
import { KanbanBoard } from "@killianbrisset/kanban-react";
import { sortColumns, sortCards } from "@killianbrisset/kanban-core";
import type {
	KanbanState,
	MoveCardPayload,
	ReorderColumnPayload,
} from "@killianbrisset/kanban-core";

const initial: KanbanState = {
	columns: [
		{ id: "todo", title: "To do", position: 0 },
		{ id: "doing", title: "In progress", position: 1 },
		{ id: "done", title: "Done", position: 2 },
	],
	cards: [
		{ id: "c1", columnId: "todo", title: "Design data model", position: 0 },
		{ id: "c2", columnId: "doing", title: "Implement API", position: 0 },
	],
};

export default function App() {
	const [state, setState] = useState<KanbanState>(initial);

	const columns = useMemo(() => sortColumns(state.columns), [state.columns]);
	const cards = useMemo(() => sortCards(state.cards), [state.cards]);

	const onMoveCard = (p: MoveCardPayload) => {
		setState((s) => {
			const next = { ...s, cards: s.cards.map((c) => ({ ...c })) };
			const moved = next.cards.find((c) => c.id === p.cardId);
			if (!moved) return s;
			moved.columnId = p.toColumnId;
			moved.position = p.toIndex;
			const renorm = (colId: string) =>
				next.cards
					.filter((c) => c.columnId === colId)
					.sort((a, b) => a.position - b.position)
					.forEach((c, i) => (c.position = i));
			renorm(p.fromColumnId);
			renorm(p.toColumnId);
			return next;
		});
	};

	const onReorderCardsInColumn = (
		columnId: string,
		fromIndex: number,
		toIndex: number
	) => {
		setState((s) => {
			const next = { ...s, cards: s.cards.map((c) => ({ ...c })) };
			const list = next.cards
				.filter((c) => c.columnId === columnId)
				.sort((a, b) => a.position - b.position);
			const [moved] = list.splice(fromIndex, 1);
			list.splice(toIndex, 0, moved);
			list.forEach((c, i) => (c.position = i));
			return next;
		});
	};

	const onReorderColumns = ({ columnId, toIndex }: ReorderColumnPayload) => {
		setState((s) => {
			const list = s.columns.slice().sort((a, b) => a.position - b.position);
			const fromIdx = list.findIndex((c) => c.id === columnId);
			const [moved] = list.splice(fromIdx, 1);
			list.splice(toIndex, 0, moved);
			list.forEach((c, i) => (c.position = i));
			return { ...s, columns: list };
		});
	};

	return (
		<KanbanBoard
			state={{ columns, cards }}
			onMoveCard={onMoveCard}
			onReorderCardsInColumn={onReorderCardsInColumn}
			onReorderColumns={onReorderColumns}
		/>
	);
}
```

For a richer playground, see `src/KanbanBoard.stories.tsx`.

## API

Component: `KanbanBoard`

- `state: KanbanState` — columns and cards arrays.
- `onMoveCard(payload: MoveCardPayload): void` — called when a card is dropped, with precise `toIndex`.
- `onReorderCardsInColumn?(columnId: string, fromIndex: number, toIndex: number): void` — optional manual in-column reorder handler.
- `onReorderColumns?(payload: ReorderColumnPayload): void` — optional column reorder.
- `renderCard?(card: KanbanCard): ReactNode` — custom render for a card.
- `renderColumnHeader?(column: KanbanColumn): ReactNode` — custom header render.
- `getCardClassName?(card: KanbanCard): string` — per-card class hook.
- `getColumnClassName?(column: KanbanColumn): string` — per-column class hook.
- `className?: string` — extra class for the board root.

Hook: `useKanban`

- Used internally by `KanbanBoard`, exported for advanced control.
- Returns internal maps, active drag id, preview placement, and handlers: `onDragStart`, `onDragOver`, `onDragEnd`.

Small UI exports (optional): `Avatar`, `Badge`, `DueDatePill`.

## Styling and theming

Storybook demonstrates a minimal theme in `src/styles/base.scss` using CSS variables.

- Light theme via `:root`
- Dark theme via `[data-theme="dark"]`

Override variables globally in your app, for example:

```css
:root {
	--kb-accent: #0ea5e9;
}
[data-theme="dark"] {
	--kb-bg: #0b1220;
}
```

## Local development

- Storybook (from the package folder or repo root):

  ```powershell
  pnpm --filter @killianbrisset/kanban-react storybook
  ```

- Build library:
  ```powershell
  pnpm --filter @killianbrisset/kanban-react build
  ```

Artifacts are emitted to `dist/` (CJS, ESM, and types).

## License

MIT
