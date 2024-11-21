export default function MaterialSymbol({
	icon,
	size = 24,
	fill = false,
	className = "",
	onClick,
}: {
	icon: string
	size?: number
	fill?: boolean
	className?: string
	onClick?: () => void
}) {
	return onClick ? (
		<button
			className={`material-symbols-rounded ${className}`}
			style={{
				fontSize: size,
				fontVariationSettings: `"FILL" ${fill ? 1 : 0}, "opsz" ${size}`,
			}}
			onClick={onClick}
		>
			{icon}
		</button>
	) : (
		<span
			className={`material-symbols-rounded ${className}`}
			style={{
				fontSize: size,
				fontVariationSettings: `"FILL" ${fill ? 1 : 0}, "opsz" ${size}`,
			}}
		>
			{icon}
		</span>
	)
}
