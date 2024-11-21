export function hexToHSL(hex: string) {
	let r = 0,
		g = 0,
		b = 0

	// 3 digits
	if (hex.length == 4) {
		r = parseInt("0x" + hex[1] + hex[1], 16)
		g = parseInt("0x" + hex[2] + hex[2], 16)
		b = parseInt("0x" + hex[3] + hex[3], 16)
	}
	// 6 digits
	else if (hex.length == 7) {
		r = parseInt("0x" + hex[1] + hex[2], 16)
		g = parseInt("0x" + hex[3] + hex[4], 16)
		b = parseInt("0x" + hex[5] + hex[6], 16)
	}

	r /= 255
	g /= 255
	b /= 255

	const max = Math.max(r, g, b),
		min = Math.min(r, g, b)
	let h,
		s,
		l = (max + min) / 2

	if (max == min) {
		h = s = 0
	} else {
		const d = max - min

		s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0)
				break
			case g:
				h = (b - r) / d + 2
				break
			case b:
				h = (r - g) / d + 4
				break
		}

		// @ts-expect-error: h might be undefined
		h /= 6
	}

	// @ts-expect-error: h might be undefined due to conditional assignment
	h = Math.round(360 * h)
	s = Math.round(100 * s)
	l = Math.round(100 * l)

	return { h: h, s: s, l: l }
}

export function rgbToHSL(rgb: string) {
	const result = rgb.match(/\d+/g)

	if (!result) {
		throw new Error("Invalid RGB or RGBA string")
	}
	const r = parseInt(result[0]) / 255
	const g = parseInt(result[1]) / 255
	const b = parseInt(result[2]) / 255

	const cmin = Math.min(r, g, b)
	const cmax = Math.max(r, g, b)
	const delta = cmax - cmin

	let h = 0,
		s = 0,
		l = 0

	if (delta == 0) h = 0
	// Red is max
	else if (cmax == r) h = ((g - b) / delta) % 6
	// Green is max
	else if (cmax == g) h = (b - r) / delta + 2
	// Blue is max
	else h = (r - g) / delta + 4

	h = Math.round(h * 60)

	// Make negative hues positive behind 360°
	if (h < 0) h += 360

	l = (cmax + cmin) / 2

	// Calculate saturation
	s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))

	// Multiply l and s by 100
	s = +(s * 100).toFixed(1)
	l = +(l * 100).toFixed(1)

	return { h: h, s: s, l: l }
}

export function getBgColor(rgb: string) {
	const hsl = rgbToHSL(rgb)

	// increase luminosity and saturation if too dark
	if (hsl.l < 75) {
		hsl.s = Math.round((hsl.l / 75 + 1) * 25)
		hsl.l = 75
	}

	const bgColor = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`

	return bgColor
}

export function getRandomColor(seed: string) {
	function hashCode(str: string) {
		let hash = 0

		for (let i = 0; i < str.length; i++) {
			hash = str.charCodeAt(i) + ((hash << 5) - hash)
		}

		return hash
	}
	const colors = [
		"rgba(107, 114, 128, 0.75)",
		"rgba(239, 68, 68, 0.75)",
		"rgba(249, 115, 22, 0.75)",
		"rgba(245, 158, 11, 0.75)",
		"rgba(234, 179, 8, 0.75)",
		"rgba(132, 204, 22, 0.75)",
		"rgba(34, 197, 94, 0.75)",
		"rgba(16, 185, 129, 0.75)",
		"rgba(20, 184, 166, 0.75)",
		"rgba(6, 182, 212, 0.75)",
		"rgba(14, 165, 233, 0.75)",
		"rgba(59, 130, 246, 0.75)",
		"rgba(99, 102, 241, 0.75)",
		"rgba(139, 92, 246, 0.75)",
		"rgba(168, 85, 247, 0.75)",
		"rgba(217, 70, 239, 0.75)",
		"rgba(236, 72, 153, 0.75)",
		"rgba(244, 63, 94, 0.75)",
	]
	const hash = hashCode(seed)
	const index = Math.abs(hash) % colors.length

	return colors[index]
}
