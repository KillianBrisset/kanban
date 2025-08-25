export * from "./types";

// Simple helpers; you can extend these with richer ordering strategies.
export const sortColumns = <T extends { position: number }>(cols: T[]) =>
	[...cols].sort((a, b) => a.position - b.position);

export const sortCards = <T extends { position: number }>(cards: T[]) =>
	[...cards].sort((a, b) => a.position - b.position);
