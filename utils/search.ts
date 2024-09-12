import { DocumentData } from '@firebase/firestore'

export function articleSearch(searchTerm: string, article: DocumentData) {
	const normalizedSearch = searchTerm.trim().toLowerCase()

	return (
		article.headline.toLowerCase().includes(normalizedSearch) ||
		article.story.toLowerCase().includes(normalizedSearch) ||
		article.author.toLowerCase().includes(normalizedSearch)
	)
}
