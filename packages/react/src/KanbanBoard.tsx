import {
	closestCorners,
	DndContext,
	DragOverlay,
	KeyboardSensor,
	MeasuringStrategy,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import React, { useMemo } from "react";

import { Card } from "./Card";
import { Column } from "./Column";
import { useKanban, UseKanbanProps } from "./useKanban";

import type { KanbanColumn, KanbanCard } from "@killianbrisset/kanban-core";
export interface KanbanBoardProps extends UseKanbanProps {
	className?: string;
	renderCard?(card: KanbanCard): React.ReactNode;
	renderColumnHeader?(column: KanbanColumn): React.ReactNode;
	getCardClassName?(card: KanbanCard): string;
	getColumnClassName?(column: KanbanColumn): string;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
	state,
	className,
	renderCard,
	renderColumnHeader,
	getCardClassName,
	getColumnClassName,
	...events
}) => {
	const {
		byColumn,
		preview,
		activeCardId,
		onDragStart,
		onDragOver,
		onDragEnd,
	} = useKanban({ state, ...events });

	//Stable lookup for the active card (used by DragOverlay).
	const activeCard: KanbanCard | null = useMemo(() => {
		if (!activeCardId) return null;
		return state.cards.find((c) => c.id === activeCardId) ?? null;
	}, [activeCardId, state.cards]);

	//Sensors for better pointer + keyboard DnD
	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
	);

	return (
		<DndContext
			sensors={sensors}
			//closestCorners feels better when moving across columns
			collisionDetection={closestCorners}
			//Always measure droppables to reduce layout jumps
			measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
			onDragStart={onDragStart}
			onDragOver={onDragOver}
			onDragEnd={onDragEnd}
		>
			<div
				className={"kb-board " + (className ?? "")}
				role="list"
				aria-label="Kanban Columns"
			>
				{state.columns
					.slice()
					.sort((a, b) => a.position - b.position)
					.map((col, idx) => {
						const cards = (byColumn.get(col.id) ?? [])
							.filter((c) => c.id !== activeCardId)
							.slice()
							.sort((a, b) => a.position - b.position);
						const ids = cards.map((c) => c.id);
						return (
							<SortableContext
								key={col.id}
								items={ids}
								strategy={verticalListSortingStrategy}
							>
								<Column
									column={col}
									index={idx}
									cards={cards}
									preview={preview}
									renderCard={renderCard}
									renderColumnHeader={renderColumnHeader}
									getCardClassName={getCardClassName}
									getColumnClassName={getColumnClassName}
								/>
							</SortableContext>
						);
					})}
			</div>

			{/*Drag overlay keeps a floating copy under the pointer when moving across lists */}
			<DragOverlay adjustScale={false} dropAnimation={{ duration: 180 }}>
				{activeCard ? (
					renderCard ? (
						(renderCard(activeCard) as React.ReactElement)
					) : (
						<Card card={activeCard} index={0} className="is-dragging" />
					)
				) : null}
			</DragOverlay>
		</DndContext>
	);
};
