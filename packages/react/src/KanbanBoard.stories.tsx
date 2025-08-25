import React, { useCallback, useMemo, useState } from "react";

import { KanbanBoard } from "./KanbanBoard";

// packages/react/src/stories/KanbanBoard.stories.tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import type {
	KanbanState,
	MoveCardPayload,
	ReorderColumnPayload,
	KanbanCard,
} from "@killianbrisset/kanban-core";

//Small id helper for new cards
function newId(prefix: string) {
	return prefix + Math.random().toString(36).slice(2, 8);
}

const meta: Meta<typeof KanbanBoard> = {
	title: "Kanban/KanbanBoard",
	component: KanbanBoard,
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"Playground story showing precise in-column sorting (drop between cards), cross-column moves, column reordering, per-card/column class hooks, meta (badges/avatars/due), and light/dark theming via CSS variables.",
			},
		},
	},
};
export default meta;
type Story = StoryObj<typeof KanbanBoard>;

/* =========================================================
   DEFAULT
   ---------------------------------------------------------
   Minimal board for sanity checks.
   ========================================================= */
export const Default: Story = {
	render: () => {
		const [state] = useState<KanbanState>({
			columns: [
				{ id: "todo", title: "To do", position: 0 },
				{ id: "doing", title: "Doing", position: 1 },
				{ id: "done", title: "Done", position: 2 },
			],
			cards: [
				{ id: "c1", columnId: "todo", title: "Spec API", position: 0 },
				{ id: "c2", columnId: "doing", title: "Build UI", position: 0 },
			],
		});
		return <KanbanBoard state={state} />;
	},
};

/* =========================================================
   PLAYGROUND (Hooks, precise drop, theme, add card)
   ========================================================= */
const PlaygroundInner: React.FC = () => {
	const [theme, setTheme] = useState<"light" | "dark">("light");
	const [highlightColumnId, setHighlightColumnId] = useState<string>(""); // to showcase getColumnClassName
	const [pulseCardId, setPulseCardId] = useState<string>(""); // to showcase getCardClassName

	const [state, setState] = useState<KanbanState>(() => ({
		columns: [
			{ id: "backlog", title: "Backlog", position: 0 },
			{ id: "todo", title: "To Do", position: 1 },
			{ id: "doing", title: "Doing", position: 2 },
			{ id: "done", title: "Done", position: 3 },
		],
		cards: [
			{
				id: "c1",
				columnId: "backlog",
				title: "Collect requirements",
				position: 0,
				meta: { badges: [{ label: "research", color: "#0ea5e9" }] },
			},
			{
				id: "c2",
				columnId: "todo",
				title: "Design data model",
				position: 0,
				meta: {
					avatarUrl: "https://i.pravatar.cc/40?img=5",
					dueDate: "2025-09-10",
					badges: [{ label: "P1", color: "#7c3aed" }],
				},
			},
			{
				id: "c3",
				columnId: "doing",
				title: "Implement API",
				position: 0,
				meta: {
					avatarUrl: "https://i.pravatar.cc/40?img=6",
					dueDate: "2025-08-10", // may be overdue later
					badges: [{ label: "backend", color: "#16a34a" }],
				},
			},
			{
				id: "c4",
				columnId: "done",
				title: "Spike drag & drop",
				position: 0,
				meta: { badges: [{ label: "spike", color: "#d97706" }] },
			},
		],
	}));

	//Utility to re-number positions inside each column.
	const normalizeCardPositions = (cards: KanbanState["cards"]) => {
		const byCol = new Map<string, KanbanState["cards"]>();
		for (const c of cards) {
			if (!byCol.has(c.columnId)) byCol.set(c.columnId, []);
			byCol.get(c.columnId)!.push(c);
		}
		for (const list of byCol.values()) {
			list
				.sort((a, b) => a.position - b.position)
				.forEach((c, i) => (c.position = i));
		}
	};

	//Move card handler receiving precise toIndex (from dnd-kit sortable).
	const onMoveCard = useCallback(
		({ cardId, fromColumnId, toColumnId, toIndex }: MoveCardPayload) => {
			setState((curr) => {
				const next: KanbanState = {
					columns: curr.columns.map((c) => ({ ...c })),
					cards: curr.cards.map((c) => ({ ...c })),
				};
				const moving = next.cards.find((c) => c.id === cardId);
				if (!moving) return curr;

				if (fromColumnId === toColumnId) {
					// Reorder within same column
					const same = next.cards
						.filter((c) => c.columnId === fromColumnId)
						.sort((a, b) => a.position - b.position);
					const fromIdx = same.findIndex((c) => c.id === cardId);
					if (fromIdx < 0) return curr;
					const [removed] = same.splice(fromIdx, 1);
					const clamped = Math.max(0, Math.min(toIndex, same.length));
					same.splice(clamped, 0, removed);
					same.forEach((c, i) => (c.position = i));
					return next;
				}

				// Cross-column move
				moving.columnId = toColumnId;
				const toList = next.cards
					.filter((c) => c.columnId === toColumnId && c.id !== cardId)
					.sort((a, b) => a.position - b.position);
				const clamped = Math.max(0, Math.min(toIndex, toList.length));
				toList.splice(clamped, 0, moving);
				toList.forEach((c, i) => (c.position = i));

				const fromList = next.cards
					.filter((c) => c.columnId === fromColumnId && c.id !== cardId)
					.sort((a, b) => a.position - b.position);
				fromList.forEach((c, i) => (c.position = i));

				return next;
			});
		},
		[]
	);

	const onReorderColumns = useCallback(
		({ columnId, toIndex }: ReorderColumnPayload) => {
			setState((curr) => {
				const ordered = [...curr.columns].sort(
					(a, b) => a.position - b.position
				);
				const fromIdx = ordered.findIndex((c) => c.id === columnId);
				if (fromIdx < 0) return curr;
				const [col] = ordered.splice(fromIdx, 1);
				const clamped = Math.max(0, Math.min(toIndex, ordered.length));
				ordered.splice(clamped, 0, col);
				ordered.forEach((c, i) => (c.position = i));
				return { ...curr, columns: ordered };
			});
		},
		[]
	);

	//UI helpers: add a card, pulse a card (class), outline a column.
	const [newCardColumn, setNewCardColumn] = useState("backlog");
	const [newCardTitle, setNewCardTitle] = useState("");

	const addCard = () => {
		if (!newCardTitle.trim()) return;
		setState((curr) => {
			const next: KanbanState = {
				columns: curr.columns.map((c) => ({ ...c })),
				cards: curr.cards.map((c) => ({ ...c })),
			};
			const pos = next.cards.filter((c) => c.columnId === newCardColumn).length;
			next.cards.push({
				id: newId("card-"),
				columnId: newCardColumn,
				title: newCardTitle.trim(),
				position: pos,
				meta: { badges: [{ label: "new", color: "#0ea5e9" }] },
			});
			normalizeCardPositions(next.cards);
			return next;
		});
		setPulseCardId(""); // reset pulse selection
		setNewCardTitle("");
	};

	//Class hooks demonstrate style customization without forking.
	const getCardClassName = useCallback(
		(card: KanbanCard) => (card.id === pulseCardId ? "kb-anim-in" : ""),
		[pulseCardId]
	);
	const getColumnClassName = useCallback(
		(col: KanbanState["columns"][number]) =>
			col.id === highlightColumnId ? "outline" : "",
		[highlightColumnId]
	);

	const sortedColumns = useMemo(
		() => state.columns.slice().sort((a, b) => a.position - b.position),
		[state.columns]
	);

	return (
		<div data-theme={theme} style={{ padding: 16 }}>
			{/* Controls */}
			<div
				style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}
			>
				{/* Theme */}
				<label style={{ display: "flex", gap: 6, alignItems: "center" }}>
					<span style={{ fontSize: 12 }}>Theme:</span>
					<select
						value={theme}
						onChange={(e) => setTheme(e.target.value as any)}
						style={{ padding: 4 }}
					>
						<option value="light">Light</option>
						<option value="dark">Dark</option>
					</select>
				</label>

				{/* Add to column */}
				<label style={{ display: "flex", gap: 6, alignItems: "center" }}>
					<span style={{ fontSize: 12 }}>Add to:</span>
					<select
						value={newCardColumn}
						onChange={(e) => setNewCardColumn(e.target.value)}
						style={{ padding: 4 }}
					>
						{sortedColumns.map((c) => (
							<option key={c.id} value={c.id}>
								{c.title}
							</option>
						))}
					</select>
				</label>

				{/* New card title */}
				<input
					placeholder="New card title"
					value={newCardTitle}
					onChange={(e) => setNewCardTitle(e.target.value)}
					style={{ padding: 4, minWidth: 180 }}
				/>
				<button
					onClick={addCard}
					style={{
						padding: "4px 10px",
						border: "1px solid var(--kb-border)",
						borderRadius: 6,
						cursor: "pointer",
						background: "var(--kb-surface-2)",
						color: "var(--kb-fg)",
						fontSize: 12,
					}}
				>
					Add Card
				</button>

				{/* Visual hooks */}
				<label style={{ display: "flex", gap: 6, alignItems: "center" }}>
					<span style={{ fontSize: 12 }}>Pulse card:</span>
					<select
						value={pulseCardId}
						onChange={(e) => setPulseCardId(e.target.value)}
						style={{ padding: 4 }}
					>
						<option value="">(none)</option>
						{state.cards
							.slice()
							.sort((a, b) => a.title.localeCompare(b.title))
							.map((c) => (
								<option value={c.id} key={c.id}>
									{c.title}
								</option>
							))}
					</select>
				</label>

				<label style={{ display: "flex", gap: 6, alignItems: "center" }}>
					<span style={{ fontSize: 12 }}>Outline column:</span>
					<select
						value={highlightColumnId}
						onChange={(e) => setHighlightColumnId(e.target.value)}
						style={{ padding: 4 }}
					>
						<option value="">(none)</option>
						{sortedColumns.map((c) => (
							<option value={c.id} key={c.id}>
								{c.title}
							</option>
						))}
					</select>
				</label>
			</div>

			{/* Board */}
			<KanbanBoard
				state={state}
				onMoveCard={onMoveCard}
				onReorderColumns={onReorderColumns}
				getCardClassName={getCardClassName}
				getColumnClassName={getColumnClassName}
			/>

			{/* State inspection */}
			<details style={{ marginTop: 16 }}>
				<summary style={{ cursor: "pointer", fontSize: 12 }}>
					State JSON
				</summary>
				<pre
					style={{
						maxHeight: 260,
						overflow: "auto",
						fontSize: 12,
						background: "var(--kb-surface-2)",
						padding: 8,
						border: "1px solid var(--kb-border)",
					}}
				>
					{JSON.stringify(
						{
							columns: state.columns
								.slice()
								.sort((a, b) => a.position - b.position),
							cards: state.cards
								.slice()
								.sort((a, b) =>
									a.columnId === b.columnId
										? a.position - b.position
										: a.columnId.localeCompare(b.columnId)
								),
						},
						null,
						2
					)}
				</pre>
			</details>
		</div>
	);
};

export const Playground: Story = {
	render: () => <PlaygroundInner />,
};
