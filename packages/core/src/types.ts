// Base domain types for a generic Kanban.
export type KanbanId = string;

export interface KanbanCardMeta {
	/** Primary avatar for quick visual identification */
	avatarUrl?: string;
	/** Multiple assignees if needed */
	assignees?: Array<{ id: string; name: string; avatarUrl?: string }>;
	/** Small colored badges */
	badges?: Array<{ label: string; color?: string; tooltip?: string }>;
	/** ISO8601 due date string, e.g. '2025-08-21' */
	dueDate?: string;
	/** Open extension bag for consumers */
	[k: string]: unknown;
}

export interface KanbanCard {
	id: KanbanId;
	columnId: KanbanId;
	title: string;
	description?: string;
	/** Ordering inside a column */
	position: number;
	/** Optional metadata used by UI decorators */
	meta?: KanbanCardMeta;
}

export interface KanbanColumn {
	id: KanbanId;
	title: string;
	/** Ordering among columns */
	position: number;
	meta?: Record<string, unknown>;
}

export interface KanbanState {
	columns: KanbanColumn[];
	cards: KanbanCard[];
}

export interface MoveCardPayload {
	cardId: KanbanId;
	fromColumnId: KanbanId;
	toColumnId: KanbanId;
	toIndex: number;
}

export interface ReorderColumnPayload {
	columnId: KanbanId;
	toIndex: number;
}

export interface KanbanEvents {
	onMoveCard?(payload: MoveCardPayload): void;
	onReorderColumns?(payload: ReorderColumnPayload): void;
	onCreateCard?(card: KanbanCard): void;
	onUpdateCard?(card: KanbanCard): void;
	onDeleteCard?(cardId: KanbanId): void;
}
