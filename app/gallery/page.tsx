'use client'

import Masonry from '@mui/lab/Masonry'
import { Image, Chip, Input } from '@nextui-org/react'
import { useEffect, useState } from 'react'
import {
	collection,
	query,
	orderBy,
	limit,
	DocumentData,
	where,
	doc,
	getDoc,
} from 'firebase/firestore'
import { useFirestore, useFirestoreCollectionData } from 'reactfire'
import { useRouter, useSearchParams } from 'next/navigation'
import { MaterialSymbol } from 'react-material-symbols'
import NextLink from 'next/link'

import { Loader } from '@/components/loader'
import { ErrMsg } from '@/components/error'
import { abbreviateName } from '@/utils/text'
import { articleSearch } from '@/utils/search'
import { timeAgo } from '@/utils/datetime'

export default function Page() {
	const router = useRouter()
	const db = useFirestore()
	const [isMd, setIsMd] = useState<boolean | null>(null)
	const [tagText, setTagText] = useState('')
	const [search, setSearch] = useState('')
	const searchParams = useSearchParams()
	const tagID = searchParams.get('tag')
	const author = searchParams.get('author')
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
			limit(100),
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
			<ErrMsg
				buttons={[
					{ text: 'Home', icon: 'home', href: '/' },
					{
						text: 'Gallery view',
						icon: 'photo_library',
						href: '/gallery',
					},
				]}
				text={
					tagText
						? `No articles with tag ${tagText} 🧐`
						: author
							? `No articles by ${author} 🧐`
							: 'No articles found 🧐'
				}
			/>
		)

	return (
		<div className="flex h-full w-full flex-col items-center justify-center gap-4 p-4">
			<div className="flex w-full items-center gap-2">
				<Input
					placeholder="Search"
					startContent={<MaterialSymbol icon="search" size={20} />}
					type="text"
					value={search}
					variant="faded"
					onValueChange={setSearch}
				/>
				{tagText || author ? (
					<Chip
						className="h-10 px-2"
						radius="md"
						startContent={
							<MaterialSymbol
								color="#404040"
								icon={tagID ? 'tag' : 'person'}
								size={16}
							/>
						}
						variant="dot"
						onClose={() => router.push('/gallery')}
					>
						<span className="text-primary">
							{tagText || (author && abbreviateName(author))}
						</span>
					</Chip>
				) : (
					<Chip
						className="h-10 pl-2"
						radius="md"
						startContent={
							<MaterialSymbol
								color="#404040"
								icon="calendar_month"
								size={16}
							/>
						}
						variant="dot"
					>
						<span className="text-primary">
							{`Past ${timeAgo(
								new Date(
									articlesData[articlesData.length - 1]
										?.publishDate?.seconds * 1000,
								),
							)}`}
						</span>
					</Chip>
				)}
			</div>
			<Masonry
				columns={isMd ? 4 : 3}
				spacing={isMd ? 2 : 1}
				sx={{ width: 'auto' }}
			>
				{articlesData
					.sort(
						(a, b) => b.publishDate.seconds - a.publishDate.seconds,
					)
					.filter((article: DocumentData) =>
						articleSearch(search, article),
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
	)
}
