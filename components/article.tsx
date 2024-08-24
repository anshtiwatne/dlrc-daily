'use client'

import { useRouter } from 'next/navigation'
import { forwardRef, useEffect, useState } from 'react'
import { doc, increment, updateDoc, DocumentData } from '@firebase/firestore'
import { useFirestore, useFirestoreDocData } from 'reactfire'
import { Chip, Link, useDisclosure, Image } from '@nextui-org/react'
import { MaterialSymbol } from 'react-material-symbols'
import NextLink from 'next/link'
import Linkify from 'linkify-react'

import { Loader } from '@/components/loader'
import { timeAgo } from '@/utils/datetime'
import { CommentsModal } from '@/components/comments-modal'

interface ArticleProps {
	articleDoc: DocumentData
	isShared: boolean
	windowDim: { width: number; height: number }
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

export const Article = forwardRef<HTMLElement, ArticleProps>((props, ref) => {
	const router = useRouter()
	const articleRef = doc(useFirestore(), 'articles', props.articleDoc.id)
	const [isLiked, setIsLiked] = useState(
		localStorage.getItem(`${props.articleDoc.id}_liked`) === '1',
	)
	const [likeCount, setLikeCount] = useState(props.articleDoc.likes)
	const {
		isOpen: isCommentsOpen,
		onOpen: onCommentsOpen,
		onOpenChange: onCommentsOpenChange,
	} = useDisclosure()
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
			{/* <div
				className={`h-[40dvh] w-[${props.windowDim.width}] cursor-pointer bg-cover bg-center lg:h-full lg:w-[60dvw]`}
				style={{
					backgroundImage: `linear-gradient(to ${props.windowDim.width >= 1024 ? 'left' : 'top'}, ${props.articleDoc.color}, transparent, transparent), url(${props.articleDoc.coverImage})`,
				}}
				onClick={() => {
					router.push(props.articleDoc.coverImage)
				}}
			/> */}

			{/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
			<div
				className={`h-[40dvh] w-[${props.windowDim.width}] cursor-pointer bg-cover bg-center lg:h-full lg:w-[40dvw]`}
				onClick={() => {
					router.push(props.articleDoc.coverImage)
				}}
			>
				<div className="relative h-full w-full">
					<div
						className="absolute z-10 h-full w-full"
						style={{
							backgroundImage: `linear-gradient(to ${props.windowDim.width >= 1024 ? 'left' : 'top'}, ${props.articleDoc.color}, transparent, transparent)`,
						}}
					/>
					<Image
						removeWrapper
						alt="cover image"
						className="z-0 h-full w-full object-cover"
						loading="lazy"
						radius="none"
						src={props.articleDoc.coverImage}
					/>
				</div>
			</div>
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
							onClick={onCommentsOpen}
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
			<CommentsModal
				articleDoc={props.articleDoc}
				articleRef={articleRef}
				isOpen={isCommentsOpen}
				onOpenChange={onCommentsOpenChange}
			/>
		</article>
	)
})

Article.displayName = 'Article'
