import React from "react";

export const Badge: React.FC<{
	label: string;
	color?: string;
	title?: string;
	className?: string;
}> = ({ label, color, title, className }) => {
	//Simple badge using inline bg/border color if provided.
	const style: React.CSSProperties = color
		? { backgroundColor: color + "22", borderColor: color, color }
		: {};
	return (
		<span
			title={title}
			style={style}
			className={"kb-badge " + (className ?? "")}
		>
			{label}
		</span>
	);
};
