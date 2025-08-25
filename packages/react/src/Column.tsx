import { useDroppable } from "@dnd-kit/core";
import React from "react";

import { Card } from "./Card";

import type { KanbanCard, KanbanColumn } from "@killianbrisset/kanban-core";
export const Column: React.FC<{
	column: KanbanColumn;
	index: number;
	cards: KanbanCard[];
	preview?: { columnId: string; index: number } | null;
	renderCard?(card: KanbanCard): React.ReactNode;
	renderColumnHeader?(column: KanbanColumn): React.ReactNode;
	getCardClassName?(card: KanbanCard): string;
	getColumnClassName?(column: KanbanColumn): string;
}> = ({
	column,
	index,
	cards,
	preview,
	renderCard,
	renderColumnHeader,
	getCardClassName,
	getColumnClassName,
}) => {
	//Column droppable area, for dropping at the end of the list.
	const { isOver, setNodeRef } = useDroppable({
		id: `col:${column.id}`,
		data: { type: "column", index },
	});
	const columnClass =
		"kb-column " +
		(getColumnClassName?.(column) ?? "") +
		(isOver ? " outline" : "");

	//Build a list with an optional ghost placeholder at preview.index
	const items: Array<KanbanCard | { __ghost: true; key: string }> = [];
	const showGhost = preview && preview.columnId === column.id;
	const ghostIndex = showGhost
		? Math.max(0, Math.min(preview!.index, cards.length))
		: -1;

	cards.forEach((c, i) => {
		if (i === ghostIndex)
			items.push({ __ghost: true, key: `ghost-${column.id}-${i}` });
		items.push(c);
	});
	if (showGhost && ghostIndex === cards.length) {
		items.push({ __ghost: true, key: `ghost-${column.id}-end` });
	}

	return (
		<section
			ref={setNodeRef}
			role="listitem"
			aria-label={column.title}
			className={columnClass}
			tabIndex={0}
		>
			<header className="kb-col-header">
				{renderColumnHeader ? renderColumnHeader(column) : column.title}
			</header>

			<div className="kb-col-cards">
				{items.map((it, idx) => {
					if ("__ghost" in it && it.__ghost) {
						//Visual insertion placeholder. Height can be tuned via CSS.
						return (
							<div
								key={it.key}
								className="kb-card kb-ghost"
								aria-hidden="true"
							/>
						);
					}
					const card = it as KanbanCard;
					return renderCard ? (
						<React.Fragment key={card.id}>{renderCard(card)}</React.Fragment>
					) : (
						<Card
							key={card.id}
							card={card}
							index={idx}
							className={getCardClassName?.(card)}
						/>
					);
				})}
			</div>
		</section>
	);
};
