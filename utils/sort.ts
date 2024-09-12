export function sortTags(tags: any[]) {
	if (!tags) return []

	return tags.sort((a, b) => {
		if (a.NO_ID_FIELD === 'NONE') return 1
		if (b.NO_ID_FIELD === 'NONE') return -1

		return a.text.localeCompare(b.text)
	})
}
