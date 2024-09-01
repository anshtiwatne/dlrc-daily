export function webpSupported() {
	const userAgent = navigator.userAgent

	const isIOS =
		/iPad|iPhone|iPod/.test(userAgent) ||
		(/Macintosh/.test(userAgent) &&
			navigator.maxTouchPoints &&
			navigator.maxTouchPoints > 1)

	const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent)

	return !(isIOS || isSafari)
}
