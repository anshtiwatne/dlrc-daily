'use client'

import { forwardRef, useEffect, useRef, useState } from 'react'
import { useFirestore, useFirestoreDocData } from 'reactfire'
import {
	doc,
	getDoc,
	updateDoc,
	increment,
	query,
	where,
	orderBy,
	limit,
	collection,
	startAfter,
	getDocs,
	DocumentData,
	arrayUnion,
} from 'firebase/firestore'
import { MaterialSymbol } from 'react-material-symbols'
import {
	Avatar,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	useDisclosure,
	Input,
	Button,
	Chip,
	Link,
} from '@nextui-org/react'
import { useRouter, useSearchParams } from 'next/navigation'
import NextLink from 'next/link'
import Linkify from 'linkify-react'
import clsx from 'clsx'

import { Loader } from '@/components/loader'
import { timeAgo, getMillis } from '@/utils/datetime'
import { getRandomColor } from '@/utils/color'

interface ArticleProps {
	articleDoc: DocumentData
	isShared: boolean
	windowDim: { width: number; height: number }
}

function CommentText({ text }: { text: string }) {
	const [isExpanded, setIsExpanded] = useState(false)

	return (
		// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
		<span
			className={clsx(
				'text-wrap',
				isExpanded ? 'line-clamp-none' : 'line-clamp-2',
			)}
			onClick={() => setIsExpanded((prev) => !prev)}
		>
			{text}
		</span>
	)
}

function RenderLink({
	attributes,
	content,
}: {
	attributes: any
	content: any
}) {
	const { href, ...props } = attributes

	return (
		<Link
			className="text-[1.0625rem] text-neutral-700 md:text-lg"
			href={href}
			underline="always"
			{...props}
		>
			{content}
		</Link>
	)
}

function formatLink(value: string, type: string) {
	const urlRegex = /(https?:\/\/[^\s]+)/g

	if (type === 'url' && urlRegex.test(value)) return new URL(value).hostname
	else return value
}

function LikeCounter({ count }: { count: string }) {
	const [newNum, setNewNum] = useState(count)
	const [oldNum, setOldNum] = useState(count)

	useEffect(() => {
		if (count !== newNum) {
			setOldNum(newNum)
			setNewNum(count)
		}
	}, [count, newNum])

	const renderDigits = () => {
		let digits = []

		for (let i = 0; i < newNum.length; i++) {
			const newDigit = newNum[i]
			const oldDigit = oldNum[i] || ''
			const animateDir =
				parseInt(newNum) > parseInt(oldNum) ? 'up' : 'down'

			digits.push(
				<span
					key={i}
					className={`digit-container ${newDigit !== oldDigit ? `animate-${animateDir}` : ''}`}
				>
					{newDigit}
				</span>,
			)
		}

		return digits
	}

	return <div style={{ width: `${count.length}ch` }}>{renderDigits()}</div>
}

const Article = forwardRef<HTMLElement, ArticleProps>((props, ref) => {
	const router = useRouter()
	const articleRef = doc(useFirestore(), 'articles', props.articleDoc.id)
	const [isLiked, setIsLiked] = useState(
		localStorage.getItem(`${props.articleDoc.id}_liked`) === '1',
	)
	const [likeCount, setLikeCount] = useState(props.articleDoc.likes)
	const [commentText, setCommentText] = useState('')
	const [commentSuccess, setCommentSuccess] = useState<boolean | null>(null)
	const { isOpen, onOpen, onOpenChange } = useDisclosure()
	const { data: tagData, status: tagStatus } =
		useFirestoreDocData<DocumentData>(props.articleDoc.tag)

	async function handleLike() {
		try {
			await updateDoc(articleRef, {
				likes: increment(isLiked ? -1 : 1),
			})
			if (!isLiked)
				localStorage.setItem(`${props.articleDoc.id}_liked`, '1')
			else localStorage.removeItem(`${props.articleDoc.id}_liked`)
			setIsLiked((prev) => !prev)
			setLikeCount((prev: number) => prev + (isLiked ? -1 : 1))
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error('Error updating document: ', error)
		}
	}

	async function handleComment(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		if (commentText.trim() === '') return
		try {
			await updateDoc(articleRef, {
				submittedComments: arrayUnion({
					text: commentText.replace(/\s\s+/g, ' ').trim(),
					timestamp: new Date(),
				}),
			})
			setCommentText('')
			setCommentSuccess(true)
			setTimeout(() => setCommentSuccess(null), 2500)
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error('Error updating document: ', error)
			setCommentSuccess(false)
			setTimeout(() => setCommentSuccess(null), 2500)
		}
	}

	function handleShare() {
		navigator.share({
			title: props.articleDoc.headline,
			url: `https://daily.dlrc.in/?article=${props.articleDoc.id}`,
		})
	}

	if (tagStatus !== 'success')
		return (
			<article
				ref={ref}
				className="h-screen w-screen snap-start"
				id={props.articleDoc.id}
			>
				<Loader />
			</article>
		)

	return (
		<article
			ref={ref}
			className="relative h-[100dvh] w-[100dvw] snap-start snap-always text-neutral-800 lg:flex lg:items-center"
			id={props.articleDoc.id}
			style={{ backgroundColor: props.articleDoc.color }}
		>
			{/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
			<div
				className={`h-[40dvh] w-[${props.windowDim.width}] cursor-pointer bg-cover bg-center lg:h-full lg:min-w-[40dvw] lg:max-w-[60dvw]`}
				style={{
					backgroundImage: `linear-gradient(to ${props.windowDim.width >= 1024 ? 'left' : 'top'}, ${props.articleDoc.color}, transparent, transparent), url(${props.articleDoc.coverImage})`,
				}}
				onClick={() => {
					router.push(props.articleDoc.coverImage)
				}}
			/>
			<div className="mx-[1.5rem] mt-[-5dvh] flex h-[60dvh] flex-col justify-evenly md:mx-auto md:my-0 md:h-[60dvh] md:w-[80dvw] md:justify-center lg:h-max lg:min-w-[40dvw] lg:max-w-[60dvw] lg:p-20">
				<header className="flex flex-col gap-4">
					<div className="flex items-center justify-between">
						<Link
							as={NextLink}
							className="text-sm font-semibold uppercase text-neutral-800 text-opacity-85 underline decoration-2 underline-offset-4 md:text-[0.9375rem]"
							href={`/gallery?${new URLSearchParams({ tag: props.articleDoc.tag.id }).toString()}`}
						>
							{props.articleDoc.tag.id === 'NONE'
								? ''
								: tagData.text}
						</Link>
						<MaterialSymbol
							className="cursor-pointer"
							color="#404040"
							icon="share"
							size={24}
							onClick={handleShare}
						/>
					</div>
					<div className="text-lg font-semibold text-[#333333] md:text-xl">
						{props.articleDoc.headline}
					</div>
				</header>
				<Linkify
					as={'div'}
					className="text-[1.0625rem] text-neutral-700 md:py-8 md:text-lg"
					options={{ render: RenderLink, format: formatLink }}
				>
					{props.articleDoc.story}
				</Linkify>
				<div className="flex items-center justify-between md:pt-[10dvh] lg:pt-[2.5dvh]">
					<div className="flex items-center gap-1">
						<span className="text-xs md:text-sm">by</span>
						<Link
							as={NextLink}
							className="text-[0.9375rem] font-semibold text-neutral-700 md:text-base"
							href={`/gallery?${new URLSearchParams({ author: props.articleDoc.author }).toString()}`}
						>
							{props.articleDoc.author}
						</Link>
						<span className="timestamp text-sm text-neutral-700 md:text-base">
							•{' '}
							{timeAgo(
								props.articleDoc.publishDate.seconds * 1000,
							)}
						</span>
					</div>
					<div className="flex items-center gap-4">
						<button
							className="flex cursor-pointer items-center gap-[0.1875rem]"
							data-id="${id}"
							onClick={handleLike}
						>
							<MaterialSymbol
								color="#404040"
								fill={isLiked}
								icon="thumb_up"
								size={24}
							/>
							<LikeCounter count={likeCount.toString()} />
						</button>
						<button
							className="flex cursor-pointer items-center gap-[0.1875rem]"
							data-id="${id}"
							onClick={onOpen}
						>
							<MaterialSymbol
								color="#404040"
								icon="comment"
								size={24}
							/>
							<span
								style={{
									width: `${props.articleDoc.comments.length.toString().length}ch`,
								}}
							>
								{props.articleDoc.comments.length}
							</span>
						</button>
					</div>
				</div>
			</div>
			{props.isShared && (
				<Chip
					className="absolute bottom-4 left-6 bg-[rgba(255,255,255,0.25)] text-neutral-700 lg:bottom-6 lg:bg-[rgba(255,255,255,0.625)]"
					size="sm"
				>
					Accessed via Link
				</Chip>
			)}
			<Modal
				isOpen={isOpen}
				scrollBehavior="inside"
				size="xl"
				onOpenChange={onOpenChange}
			>
				<ModalContent>
					{() => (
						<>
							<ModalHeader className="flex flex-col gap-1">
								Comments
							</ModalHeader>
							<ModalBody>
								{props.articleDoc.comments
									.sort(
										(a: any, b: any) =>
											getMillis(b.timestamp) -
											getMillis(a.timestamp),
									)
									.map((comment: any, i: number) => (
										<div key={i} className="flex gap-2">
											<div className="flex gap-4">
												<div>
													<Avatar
														className="text-white dark:text-zinc-900"
														style={{
															backgroundColor:
																getRandomColor(
																	comment.text,
																),
														}}
													/>
												</div>
												<div className="flex flex-col gap-1">
													<div className="text-xs">
														{timeAgo(
															getMillis(
																comment.timestamp,
															),
															false,
														)}
													</div>
													<CommentText
														text={comment.text}
													/>
												</div>
											</div>
										</div>
									))}
							</ModalBody>
							<ModalFooter>
								<form
									className="flex w-full items-center gap-2"
									onSubmit={handleComment}
								>
									<Input
										spellCheck
										color={
											commentSuccess === null
												? 'default'
												: commentSuccess
													? 'success'
													: 'danger'
										}
										isDisabled={commentSuccess !== null}
										placeholder={
											commentSuccess === null
												? 'Add a comment...'
												: commentSuccess
													? 'Submitted, will be reviewed'
													: 'Failed to add comment'
										}
										type="text"
										value={commentText}
										variant="underlined"
										onValueChange={(value) =>
											setCommentText(value)
										}
									/>
									<Button
										isIconOnly
										isDisabled={
											commentText
												.replace(/\s\s+/g, ' ')
												.trim() === '' ||
											commentSuccess !== null
										}
										type="submit"
										variant="light"
									>
										<MaterialSymbol
											className={clsx(
												'text-foreground-700',
												commentSuccess
													? 'animate-send'
													: '',
											)}
											icon="send"
											size={32}
										/>
									</Button>
								</form>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</article>
	)
})

Article.displayName = 'Article'

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

		const observer = new IntersectionObserver(
			(entries) => {
				const first = entries[0]

				if (first.isIntersecting) fetchArticles(lastDoc)
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
				<Article
					key={article.id}
					ref={index === articlesData.length - 1 ? loadMoreRef : null}
					articleDoc={article}
					isShared={false}
					windowDim={windowDim}
				/>
			))}
			<div className="w-full py-4 text-center font-semibold">
				Loading...
			</div>
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
