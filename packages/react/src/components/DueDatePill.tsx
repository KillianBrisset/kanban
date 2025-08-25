import React from "react";

function formatDate(iso: string) {
	//Very small date formatter without i18n deps.
	// Expected input: YYYY-MM-DD or ISO string.
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return iso;
	return d.toISOString().slice(0, 10);
}

export const DueDatePill: React.FC<{ dateISO: string; className?: string }> = ({
	dateISO,
	className,
}) => {
	//Overdue if past today.
	const today = new Date();
	const due = new Date(dateISO);
	const overdue =
		!Number.isNaN(due.getTime()) &&
		due < new Date(today.getFullYear(), today.getMonth(), today.getDate());

	return (
		<span
			className={"kb-due " + (overdue ? "overdue " : "") + (className ?? "")}
			title={overdue ? "Overdue" : "Due date"}
		>
			⏰ {formatDate(dateISO)}
		</span>
	);
};
