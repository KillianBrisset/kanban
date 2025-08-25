import { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import { useMemo, useState } from "react";

import type { KanbanState, KanbanEvents } from "@killianbrisset/kanban-core";
export interface UseKanbanProps extends KanbanEvents {
	state: KanbanState;
	disabled?: boolean;
}

type Preview = { columnId: string; index: number } | null;

// Helper
const clamp = (n: number, min: number, max: number) =>
	Math.max(min, Math.min(max, n));

function buildMaps(state: KanbanState) {
	const cardsById = new Map(state.cards.map((c) => [c.id, c]));
	const byColumn = new Map<string, typeof state.cards>();
	for (const col of state.columns) byColumn.set(col.id, []);
	for (const card of state.cards) byColumn.get(card.columnId)!.push(card);
	for (const arr of byColumn.values())
		arr.sort((a, b) => a.position - b.position);
	return { cardsById, byColumn };
}

export function useKanban({ state, ...events }: UseKanbanProps) {
	const { byColumn, cardsById } = useMemo(
		() => buildMaps(state),
		[state.cards, state.columns]
	);

	const [activeCardId, setActiveCardId] = useState<string | null>(null);
	const [preview, setPreview] = useState<Preview>(null);

	/**Compute target placement. Always return a CLAMPED toIndex. */
	const getDropTarget = (e: DragEndEvent | DragOverEvent) => {
		const { active, over } = e;
		if (!active || !over) return null;

		const activeId = String(active.id);
		const activeData = active.data.current; // { type:'card', index, columnId }
		const overData = over.data.current;
		const overId = String(over.id);

		// Target is a CARD → insert at that card index
		if (overData?.type === "card") {
			const toColumnId: string = overData.columnId;
			const colArr = byColumn.get(toColumnId) ?? [];
			const fromColumnId: string = activeData?.columnId;
			const fromIndex: number = Number(activeData?.index);

			let toIndex: number = Number(overData?.index);

			//When moving within the same column and dropping "below" original position,
			// the removal of the active card shifts indexes by -1 → adjust.
			if (fromColumnId === toColumnId && toIndex > fromIndex) {
				toIndex -= 1;
			}

			// Clamp (same-column: final count minus one, cross-column: full length)
			const maxIndex =
				fromColumnId === toColumnId
					? Math.max(0, colArr.length - 1)
					: colArr.length;
			toIndex = clamp(toIndex, 0, maxIndex);

			return { cardId: activeId, fromColumnId, toColumnId, toIndex };
		}

		// Target is a COLUMN area → append (end of list)
		if (overId.startsWith("col:")) {
			const toColumnId = overId.slice(4);
			const colArr = byColumn.get(toColumnId) ?? [];
			const fromColumnId: string = activeData?.columnId;
			const fromIndex: number = Number(activeData?.index);

			// Base: end of column
			let toIndex = colArr.length;

			//If same-column, the active card will be removed → end index is length-1.
			if (fromColumnId === toColumnId) {
				toIndex = Math.max(0, colArr.length - 1);
			}

			// Clamp for safety (already in range normally)
			const maxIndex =
				fromColumnId === toColumnId
					? Math.max(0, colArr.length - 1)
					: colArr.length;
			toIndex = clamp(toIndex, 0, maxIndex);

			return { cardId: String(active.id), fromColumnId, toColumnId, toIndex };
		}

		return null;
	};

	const onDragStart = (e: DragStartEvent) => {
		if (e.active) setActiveCardId(String(e.active.id));
	};

	const onDragOver = (e: DragOverEvent) => {
		const target = getDropTarget(e);
		if (!target) {
			if (preview) setPreview(null);
			return;
		}
		const colArr = byColumn.get(target.toColumnId) ?? [];
		const maxIndex =
			target.fromColumnId === target.toColumnId
				? Math.max(0, colArr.length - 1)
				: colArr.length;
		const next: Preview = {
			columnId: target.toColumnId,
			index: clamp(target.toIndex, 0, maxIndex),
		};
		if (preview?.columnId !== next.columnId || preview.index !== next.index) {
			setPreview(next);
		}
	};

	const onDragEnd = (e: DragEndEvent) => {
		setActiveCardId(null);
		setPreview(null);

		const target = getDropTarget(e);

		if (!target) return;
		target.toIndex = Math.max(0, target.toIndex - 1);
		const { cardId, fromColumnId, toColumnId, toIndex } = target;
		const card = cardsById.get(cardId);
		if (!card) return;

		if (card.columnId === toColumnId) {
			const currentIndex = (byColumn.get(card.columnId) ?? []).findIndex(
				(c) => c.id === cardId
			);
			if (currentIndex === toIndex || toIndex < 0) return;
		}

		events.onMoveCard?.({
			cardId,
			fromColumnId,
			toColumnId,
			toIndex,
		});
	};

	return {
		byColumn,
		activeCardId,
		preview,
		onDragStart,
		onDragOver,
		onDragEnd,
	};
}
