import { DocumentData } from '@firebase/firestore'

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

export function articleSearch(searchTerm: string, article: DocumentData) {
	const normalizedSearch = searchTerm.trim().toLowerCase()

	return (
		article.headline.toLowerCase().includes(normalizedSearch) ||
		article.story.toLowerCase().includes(normalizedSearch) ||
		article.author.toLowerCase().includes(normalizedSearch)
	)
}

export function abbreviateName(name: string) {
	const maxLength = 10

	if (name.length > maxLength) {
		const [firstName, lastName] = name.split(' ')

		return `${firstName} ${lastName.charAt(0)}.`
	}

	return name
}

export async function profanityCheck(
	text: string,
	type: 'vector' | 'tensor' = 'vector',
): Promise<boolean> {
	const res = await fetch(`https://${type}.profanity.dev`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ message: text }),
	})
	const json = await res.json()

	return json.isProfanity
}
