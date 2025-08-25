import React from "react";

export const Avatar: React.FC<{
	src?: string;
	alt?: string;
	size?: number;
	className?: string;
}> = ({ src, alt, size = 20, className }) => {
	//Minimal, dependency-free avatar.
	const s: React.CSSProperties = { width: size, height: size };
	return (
		<img
			src={src}
			alt={alt}
			style={s}
			className={"kb-avatar " + (className ?? "")}
		/>
	);
};
