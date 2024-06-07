'use client'

import Masonry from '@mui/lab/Masonry'
import { Button, Image, Chip } from '@nextui-org/react'
import { useEffect, useState } from 'react'
import {
	collection,
	query,
	orderBy,
	DocumentData,
	where,
	doc,
	getDoc,
} from 'firebase/firestore'
import { useFirestore, useFirestoreCollectionData } from 'reactfire'
import { useSearchParams } from 'next/navigation'
import { MaterialSymbol } from 'react-material-symbols'
import NextLink from 'next/link'

import { Loader } from '@/components/loader'
import clsx from 'clsx'

export default function Page() {
	const [isMd, setIsMd] = useState<boolean | null>(null)
	const [tagText, setTagText] = useState('')
	const searchParams = useSearchParams()
	const tagID = searchParams.get('tag')
	const author = searchParams.get('author')
	const db = useFirestore()
	let coverImagesQuery

	async function fetchTagText() {
		if (tagID) {
			const tagDoc = await getDoc(doc(db, 'tags', tagID))

			if (tagDoc.exists()) setTagText(tagDoc.data().text)
		}
	}

	if (tagID) {
		coverImagesQuery = query(
			collection(db, 'articles'),
			where('tag', '==', doc(db, 'tags', tagID)),
		)
		fetchTagText()
	} else if (author) {
		coverImagesQuery = query(
			collection(db, 'articles'),
			where('author', '==', author),
		)
	} else {
		coverImagesQuery = query(
			collection(db, 'articles'),
			orderBy('publishDate', 'desc'),
		)
	}
	const { data: articlesData, status: articlesStatus } =
		useFirestoreCollectionData(coverImagesQuery)

	useEffect(() => {
		if (typeof window === 'undefined') return
		const handleResize = () => setIsMd(window.innerWidth > 768)

		setIsMd(window.innerWidth > 768)
		window.addEventListener('resize', handleResize)

		return () => window.removeEventListener('resize', handleResize)
	}, [])

	if (articlesStatus !== 'success') return <Loader />

	if (!articlesData.length)
		return (
			<main className="flex h-full flex-col items-center justify-center">
				<h1 className="py-4 text-center text-2xl text-foreground-800 md:text-2xl">
					{tagText
						? `No articles with tag ${tagText} 🧐`
						: author
							? `No articles by ${author} 🧐`
							: 'No articles found 🧐'}
				</h1>
				<div className="flex gap-2">
					<Button
						as={NextLink}
						color="primary"
						href="/gallery"
						startContent={
							<MaterialSymbol icon="photo_library" size={20} />
						}
						variant="flat"
					>
						Gallery view
					</Button>
					<Button
						as={NextLink}
						color="primary"
						href="/"
						startContent={<MaterialSymbol icon="home" size={20} />}
						variant="flat"
					>
						Home
					</Button>
				</div>
			</main>
		)

	return (
		<>
			<div className="flex w-full items-center justify-center p-4 md:py-6">
				<Masonry columns={isMd ? 4 : 3} spacing={isMd ? 2 : 1}>
					{articlesData
						.sort(
							(a, b) =>
								b.publishDate.seconds - a.publishDate.seconds,
						)
						?.map((article: DocumentData) => (
							<NextLink
								key={article.NO_ID_FIELD}
								href={`/?article=${article.NO_ID_FIELD}`}
							>
								<Image
									isZoomed
									alt={article.headline}
									loading="lazy"
									radius="sm"
									src={article.coverImage}
								/>
							</NextLink>
						))}
				</Masonry>
			</div>
			{(tagID || author) && (
				<Chip
					className={clsx(
						'fixed bottom-6 left-6 z-50 bg-[rgba(255,255,255,0.625)] pr-1 text-neutral-700',
						tagID ? 'lowercase' : '',
					)}
					size="sm"
					startContent={
						<MaterialSymbol
							color="#404040"
							icon={tagID ? 'tag' : 'person'}
							size={16}
						/>
					}
				>
					{tagText || author}
				</Chip>
			)}
		</>
	)
}
