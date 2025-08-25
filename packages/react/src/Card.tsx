import {
	AnimateLayoutChanges,
	defaultAnimateLayoutChanges,
	useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React from "react";

import { Avatar } from "./components/Avatar";
import { Badge } from "./components/Badge";
import { DueDatePill } from "./components/DueDatePill";

import type { KanbanCard } from "@killianbrisset/kanban-core";
//Force layout animations also when moving across containers.
const animateLayoutChanges: AnimateLayoutChanges = (args) => {
	// Keep default rules but also animate when the item was just dragged or sorting is ongoing.
	const shouldAnimate = defaultAnimateLayoutChanges(args);
	return shouldAnimate || args.isSorting || args.wasDragging;
};

export const Card: React.FC<{
	card: KanbanCard;
	index: number;
	className?: string;
}> = ({ card, index, className }) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: card.id,
		data: { type: "card", index, columnId: card.columnId },
		animateLayoutChanges,
	});

	//Smooth transform + transition are key for displacement animations.
	const style: React.CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	const meta = card.meta ?? {};

	return (
		<article
			ref={setNodeRef}
			style={style}
			className={
				"kb-card " + (className ?? "") + (isDragging ? " is-dragging" : "")
			}
			role="article"
			aria-roledescription="Kanban Card"
			{...attributes}
			{...listeners}
		>
			<div className="kb-card-header-row">
				{meta.avatarUrl && (
					<Avatar src={meta.avatarUrl} alt={card.title} size={20} />
				)}
				<div className="kb-card-title">{card.title}</div>
			</div>

			{card.description && <p className="kb-card-desc">{card.description}</p>}

			{(meta.badges?.length || meta.dueDate) && (
				<div className="kb-card-meta-row">
					{meta.badges?.map((b, i) => (
						<Badge key={i} label={b.label} color={b.color} title={b.tooltip} />
					))}
					{meta.dueDate && <DueDatePill dateISO={meta.dueDate} />}
				</div>
			)}
		</article>
	);
};
