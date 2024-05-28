export function capitalizeTitle(title: string) {
	const alwaysLower = [
		'a',
		'an',
		'the',
		'and',
		'but',
		'or',
		'nor',
		'yet',
		'so',
		'on',
		'to',
		'in',
		'up',
		'down',
		'of',
		'for',
	]

	function capitalizeWord(word: string, isFirstOrLast: boolean) {
		if (isFirstOrLast || !alwaysLower.includes(word.toLowerCase())) {
			return word.charAt(0).toUpperCase() + word.slice(1)
		}

		return word
	}

	const words = title.split(' ')
	const len = words.length

	for (let i = 0; i < len; i++) {
		// If word has a hyphen, process each part
		if (words[i].includes('-')) {
			const hyphenatedParts = words[i]
				.split('-')
				.map((part, index, arr) => {
					const isFirstOrLastPart =
						index === 0 || index === arr.length - 1

					return capitalizeWord(part, isFirstOrLastPart)
				})

			words[i] = hyphenatedParts.join('-')
		} else {
			const isFirstOrLast = i === 0 || i === len - 1

			words[i] = capitalizeWord(words[i], isFirstOrLast)
		}
	}

	return words.join(' ')
}

export function linkifyPreview(text: string) {
	const urlRegex = /(https?:\/\/[^\s]+)/g

	return text.replace(urlRegex, (url) => `${new URL(url).hostname}`)
}
