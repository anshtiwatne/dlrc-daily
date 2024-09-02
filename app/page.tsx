'use client'

import { useEffect, useRef, useState } from 'react'
import { useFirestore } from 'reactfire'
import {
	doc,
	getDoc,
	query,
	where,
	orderBy,
	limit,
	collection,
	startAfter,
	getDocs,
	DocumentData,
} from 'firebase/firestore'
import { MaterialSymbol } from 'react-material-symbols'
import { useSearchParams } from 'next/navigation'

import { Loader } from '@/components/loader'
import { Article } from '@/components/article'
import { Progress } from '@nextui-org/react'

export default function Home() {
	const db = useFirestore()
	const [sharedArticle, setSharedArticle] = useState<
		DocumentData | null | false
	>(null)
	const [lastDoc, setLastDoc] = useState<DocumentData | null>(null)
	const [articlesData, setArticlesData] = useState<DocumentData[]>([])
	const [hasMore, setHasMore] = useState(true)
	const [isInitialLoad, setIsInitialLoad] = useState(true)
	const searchParams = useSearchParams()
	const isLoading = useRef(false)
	const articlesRef = collection(useFirestore(), 'articles')
	const loadMoreRef = useRef(null)
	const [windowDim, setWindowDim] = useState(
		typeof window !== 'undefined'
			? { width: window.innerWidth, height: window.innerHeight }
			: { width: 0, height: 0 },
	)

	useEffect(() => {
		if (typeof window === 'undefined') return
		const handleResize = () =>
			setWindowDim({
				width: window.innerWidth,
				height: window.innerHeight,
			})

		window.addEventListener('load', () => {
			if ('serviceWorker' in navigator) {
				navigator.serviceWorker.register('/sw.js')
			}
		})
		window.addEventListener('resize', handleResize)

		return () => window.removeEventListener('resize', handleResize)
	}, [])

	useEffect(() => {
		const articleID = searchParams.get('article')

		if (articleID) {
			getDoc(doc(db, 'articles', articleID)).then((doc) => {
				if (doc.exists())
					setSharedArticle({ ...doc.data(), id: doc.id })
			})
		} else {
			setSharedArticle(false)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		if (sharedArticle !== null) fetchArticles(null)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sharedArticle])

	async function fetchArticles(startAfterDoc: DocumentData | null) {
		if (!hasMore || isLoading.current) return
		while (sharedArticle === null) {
			await new Promise((resolve) => setTimeout(resolve, 500))
		}

		isLoading.current = true
		const sharedArticleDate =
			sharedArticle === null || sharedArticle === false
				? 0
				: sharedArticle.publishDate
		const newQuery = startAfterDoc
			? // the publishDate is the timestamp of when the article was published, it's unlikely for two articles to have the same publishDate down to the millisecond, so it is used as a unique identifier when excluding sharedArticleID since the query is ordered by it
				query(
					articlesRef,
					where('publishDate', '!=', sharedArticleDate),
					orderBy('publishDate', 'desc'),
					startAfter(startAfterDoc),
					limit(3),
				)
			: query(
					articlesRef,
					where('publishDate', '!=', sharedArticleDate),
					orderBy('publishDate', 'desc'),
					limit(5),
				)

		const snapshot = await getDocs(newQuery)
		const newArticles = snapshot.docs.map((doc) => ({
			...doc.data(),
			id: doc.id,
		}))

		if (newArticles.length === 0) {
			setHasMore(false)
		} else {
			setArticlesData((prev) => [...prev, ...newArticles])
			setLastDoc(snapshot.docs[snapshot.docs.length - 1])
		}
		isLoading.current = false
		setIsInitialLoad(false)
	}

	useEffect(() => {
		if (isInitialLoad || !lastDoc || !hasMore) return

		let fetchTimeout: NodeJS.Timeout

		const observer = new IntersectionObserver(
			(entries) => {
				const first = entries[0]

				if (first.isIntersecting) {
					// Debounce the fetchArticles call
					clearTimeout(fetchTimeout)
					fetchTimeout = setTimeout(() => fetchArticles(lastDoc), 200)
				}
			},
			{ threshold: 1 },
		)

		const currentRef = loadMoreRef.current

		if (currentRef) observer.observe(currentRef)

		return () => {
			if (currentRef) observer.unobserve(currentRef)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [lastDoc, hasMore, isInitialLoad])

	if (!articlesData.length)
		return (
			<div className="absolute left-0 top-0 h-screen w-screen">
				<Loader />
			</div>
		)

	return (
		<section
			className="absolute left-0 top-0 h-screen w-[100dvw] snap-y snap-mandatory overflow-y-scroll scrollbar-hide"
			id="articles"
		>
			{sharedArticle && (
				<Article
					articleDoc={sharedArticle}
					isShared={true}
					windowDim={windowDim}
				/>
			)}
			{articlesData.map((article, index) => (
				<>
					<Article
						key={article.id}
						ref={
							index === articlesData.length - 1
								? loadMoreRef
								: null
						}
						articleDoc={article}
						isShared={false}
						windowDim={windowDim}
					/>
					{index === articlesData.length - 1 && (
						<Progress
							isIndeterminate
							className="w-full mt-[-0.25rem]"
							size="sm"
						/>
					)}
				</>
			))}
			{/* <div className="w-full py-4 text-center font-semibold">
				Loading...
			</div> */}
			{windowDim.width >= 1024 && (
				<div className="fixed bottom-4 right-4 flex items-center gap-1">
					<MaterialSymbol
						className="text-neutral-700 text-opacity-75"
						icon="arrow_upward"
						size={24}
						onClick={() =>
							document.getElementById('articles')?.scrollBy(0, -1)
						}
					/>
					<MaterialSymbol
						className="text-neutral-700 text-opacity-75"
						icon="arrow_downward"
						size={24}
						onClick={() =>
							document.getElementById('articles')?.scrollBy(0, 1)
						}
					/>
				</div>
			)}
		</section>
	)
}
