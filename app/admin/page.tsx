'use client'

import {
	Input,
	Table,
	TableHeader,
	TableBody,
	TableColumn,
	TableRow,
	TableCell,
	Button,
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	useDisclosure,
	Chip,
	Tooltip,
	Link,
	Divider,
	DateRangePicker,
	RangeValue,
	DateValue,
} from '@nextui-org/react'
import { useEffect, useState } from 'react'
import {
	DocumentData,
	collection,
	doc,
	setDoc,
	updateDoc,
	deleteDoc,
	query,
	where,
	and,
	arrayUnion,
	arrayRemove,
} from '@firebase/firestore'
import { ref, deleteObject } from '@firebase/storage'
import { User } from '@firebase/auth'
import { MaterialSymbol } from 'react-material-symbols'
import {
	useStorage,
	useFirestore,
	useFirestoreCollectionData,
	useFirestoreDocData,
	useSigninCheck,
	useAuth,
	useFirestoreDocDataOnce,
} from 'reactfire'
import clsx from 'clsx'
import { parseDate, getLocalTimeZone } from '@internationalized/date'

import { Loader } from '@/components/loader'
import { Login } from '@/components/login'
import { ErrMsg } from '@/components/error'
import { ProfanityBadge } from '@/components/profanity-check'
import { pseudonyms } from '@/utils/constants'

function ModerateArticles({
	articleSubmissions,
}: {
	articleSubmissions: DocumentData[]
}) {
	const db = useFirestore()
	const storage = useStorage()
	const [search, setSearch] = useState('')

	function SubmissionActions({ submission }: { submission: DocumentData }) {
		const submissionRef = doc(db, 'submissions', submission.NO_ID_FIELD)
		const coverImageRef = ref(
			storage,
			`coverImages/${submission.NO_ID_FIELD}.webp`,
		)
		const articleRef = doc(db, 'articles', submission.NO_ID_FIELD)
		const { data: tagData } = useFirestoreDocData<DocumentData>(
			submission.tag,
		)
		const {
			isOpen: isViewOpen,
			onOpen: onViewOpen,
			onOpenChange: onViewOpenChange,
		} = useDisclosure()
		const [showBgColor, setShowBgColor] = useState(false)

		function handlePublish() {
			setDoc(articleRef, {
				coverImage: submission.coverImage,
				color: submission.color,
				tag: submission.tag,
				headline: submission.headline,
				story: submission.story,
				author: submission.author,
				publishDate: new Date(),
				likes: 0,
				comments: [],
				submittedComments: [],
			}).then(() => {
				deleteDoc(submissionRef)
			})
		}

		function handleDelete() {
			deleteObject(coverImageRef).then(() => {
				deleteDoc(submissionRef)
			})
		}

		return (
			<>
				<div className="flex items-center gap-2">
					<Tooltip content="View">
						<Button
							isIconOnly
							size="sm"
							variant="faded"
							onPress={onViewOpen}
						>
							<MaterialSymbol
								className="text-foreground-600"
								icon="visibility"
								size={22}
							/>
						</Button>
					</Tooltip>
					<Tooltip content="Publish">
						<Button
							isIconOnly
							size="sm"
							variant="faded"
							onPress={handlePublish}
						>
							<MaterialSymbol
								className="text-foreground-600"
								icon="publish"
								size={22}
							/>
						</Button>
					</Tooltip>
					<Tooltip content="Delete">
						<Button
							isIconOnly
							color="danger"
							size="sm"
							variant="faded"
							onPress={handleDelete}
						>
							<MaterialSymbol
								className="text-danger"
								icon="delete"
								size={22}
							/>
						</Button>
					</Tooltip>
				</div>
				<Modal
					className={showBgColor ? 'text-neutral-800' : ''}
					isOpen={isViewOpen}
					placement="center"
					scrollBehavior="inside"
					style={
						showBgColor ? { backgroundColor: submission.color } : {}
					}
					onOpenChange={onViewOpenChange}
				>
					<ModalContent>
						<ModalHeader className="flex flex-col gap-1 pb-2">
							{submission.headline}
						</ModalHeader>
						<ModalBody className="pb-6">
							{/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
							<div
								className="relative w-full flex-shrink-0 cursor-pointer rounded-lg bg-cover bg-center pt-[75%] text-white"
								style={{
									backgroundImage: showBgColor
										? `linear-gradient(to top, ${submission.color}, transparent, transparent), url(${submission.coverImage})`
										: `url(${submission.coverImage})`,
								}}
								onClick={() => setShowBgColor((prev) => !prev)}
							/>
							<div className="flex items-center gap-2">
								<Chip
									className={clsx(
										'py-[0.125rem] pl-[0.625rem]',
										showBgColor
											? 'bg-[rgba(255,255,255,0.09375)] text-neutral-800'
											: '',
									)}
									startContent={
										<MaterialSymbol icon="tag" size={16} />
									}
									variant={showBgColor ? 'flat' : 'faded'}
								>
									{tagData?.text}
								</Chip>
								<Chip
									className={clsx(
										'py-[0.125rem] pl-[0.625rem]',
										showBgColor
											? 'bg-[rgba(255,255,255,0.09375)] text-neutral-800'
											: '',
									)}
									startContent={
										<MaterialSymbol icon="sell" size={16} />
									}
									variant={showBgColor ? 'flat' : 'faded'}
								>
									{articleRef.id}
								</Chip>
							</div>
							<p>{submission.story}</p>
							<div className="flex items-center gap-1">
								<span className="text-sm">by</span>
								<span
									className={clsx(
										'font-medium',
										showBgColor ? 'text-neutral-700' : '',
									)}
								>
									{submission.author}
								</span>
							</div>
							<ProfanityBadge
								text={`${submission.headline}\n${submission.story}`}
							/>
						</ModalBody>
					</ModalContent>
				</Modal>
			</>
		)
	}

	return (
		<div className="flex w-full max-w-2xl flex-col gap-4">
			<Input
				aria-label="Search articles"
				className="w-full"
				labelPlacement="outside"
				placeholder="Search articles"
				startContent={<MaterialSymbol icon="search" size={24} />}
				type="text"
				value={search}
				variant="faded"
				onValueChange={setSearch}
			/>
			<Table aria-label="Articles table">
				<TableHeader>
					<TableColumn align="start">HEADLINE</TableColumn>
					<TableColumn
						align="end"
						className="flex items-center justify-end"
					>
						ACTIONS
					</TableColumn>
				</TableHeader>
				<TableBody>
					{articleSubmissions
						.filter((submission) =>
							submission.headline
								.toLowerCase()
								.includes(search.trim().toLowerCase()),
						)
						?.map((submission: DocumentData) => (
							<TableRow key={submission.NO_ID_FIELD}>
								<TableCell>{submission.headline}</TableCell>
								<TableCell className="flex justify-end">
									<SubmissionActions
										submission={submission}
									/>
								</TableCell>
							</TableRow>
						))}
				</TableBody>
			</Table>
		</div>
	)
}

function ModerateComments({ commentedArticles }: { commentedArticles: any[] }) {
	const submittedComments = commentedArticles.reduce(
		(
			acc: { comment: any; articleID: string; articleHeadline: string }[],
			article,
		) => {
			if (
				article.submittedComments &&
				article.submittedComments.length > 0
			) {
				article.submittedComments.forEach((comment: any) => {
					acc.push({
						comment: comment,
						articleID: article.NO_ID_FIELD,
						articleHeadline: article.headline,
					})
				})
			}

			return acc
		},
		[],
	)

	const db = useFirestore()
	const [search, setSearch] = useState('')

	function SubmissionActions({
		submission,
	}: {
		submission: { comment: any; articleID: string; articleHeadline: string }
	}) {
		const articleRef = doc(db, 'articles', submission.articleID)
		const {
			isOpen: isViewOpen,
			onOpen: onViewOpen,
			onOpenChange: onViewOpenChange,
		} = useDisclosure()

		function handlePublish() {
			updateDoc(articleRef, {
				comments: arrayUnion(submission.comment),
				submittedComments: arrayRemove(submission.comment),
			})
		}

		function handleDelete() {
			updateDoc(articleRef, {
				submittedComments: arrayRemove(submission.comment),
			})
		}

		return (
			<>
				<div className="flex items-center gap-2">
					<Tooltip content="View">
						<Button
							isIconOnly
							size="sm"
							variant="faded"
							onPress={onViewOpen}
						>
							<MaterialSymbol
								className="text-foreground-600"
								icon="visibility"
								size={22}
							/>
						</Button>
					</Tooltip>
					<Tooltip content="Publish">
						<Button
							isIconOnly
							size="sm"
							variant="faded"
							onPress={handlePublish}
						>
							<MaterialSymbol
								className="text-foreground-600"
								icon="publish"
								size={22}
							/>
						</Button>
					</Tooltip>
					<Tooltip content="Delete">
						<Button
							isIconOnly
							color="danger"
							size="sm"
							variant="faded"
							onPress={handleDelete}
						>
							<MaterialSymbol
								className="text-danger"
								icon="delete"
								size={22}
							/>
						</Button>
					</Tooltip>
				</div>
				<Modal
					isOpen={isViewOpen}
					placement="center"
					scrollBehavior="inside"
					onOpenChange={onViewOpenChange}
				>
					<ModalContent>
						<ModalHeader className="flex flex-col gap-1 pb-2">
							Comment Info
						</ModalHeader>
						<ModalBody className="pb-6">
							<p className="text-wrap">
								{submission.comment.text}
							</p>
							<div className="flex items-center gap-1">
								<span className="text-sm">on</span>
								<Link
									href={`/?${new URLSearchParams({ article: submission.articleID }).toString()}`}
								>
									{submission.articleHeadline}
								</Link>
							</div>
							<ProfanityBadge text={submission.comment.text} />
						</ModalBody>
					</ModalContent>
				</Modal>
			</>
		)
	}

	return (
		<div className="flex w-full max-w-2xl flex-col gap-4">
			<Input
				aria-label="Search comments"
				className="w-full"
				labelPlacement="outside"
				placeholder="Search comments"
				startContent={<MaterialSymbol icon="search" size={24} />}
				type="text"
				value={search}
				variant="faded"
				onValueChange={setSearch}
			/>
			<Table aria-label="Comments table">
				<TableHeader>
					<TableColumn align="start">COMMENT</TableColumn>
					<TableColumn
						align="end"
						className="flex items-center justify-end"
					>
						ACTIONS
					</TableColumn>
				</TableHeader>
				<TableBody>
					{submittedComments
						.filter((submission) =>
							submission.comment.text
								.toLowerCase()
								.includes(search.trim().toLowerCase()),
						)
						?.map(
							(
								submission: {
									comment: any
									articleID: string
									articleHeadline: string
								},
								i: number,
							) => (
								<TableRow key={i}>
									<TableCell>
										<p>{submission.comment.text}</p>
									</TableCell>
									<TableCell className="flex justify-end">
										<SubmissionActions
											submission={submission}
										/>
									</TableCell>
								</TableRow>
							),
						)}
				</TableBody>
			</Table>
		</div>
	)
}

function AuthorTally({ articleDocs }: { articleDocs: DocumentData[] }) {
	const authors = Object.entries(
		articleDocs.reduce(
			(acc, article) => {
				if (!pseudonyms.includes(article.author)) {
					if (!acc[article.author]) acc[article.author] = 1
					else acc[article.author]++
				}

				return acc
			},
			{} as Record<string, number>,
		),
	)
		.sort(([, a], [, b]) => b - a)
		.reduce(
			(acc, [author, count]) => {
				acc[author] = count

				return acc
			},
			{} as Record<string, number>,
		)

	return (
		<Table title="Author Publications">
			<TableHeader>
				<TableColumn align="start">AUTHOR</TableColumn>
				<TableColumn align="end">ARTICLES</TableColumn>
			</TableHeader>
			<TableBody>
				{Object.entries(authors).map(([author, count]) => (
					<TableRow key={author}>
						<TableCell>{author}</TableCell>
						<TableCell>{count}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	)
}

function AdminView({ user }: { user: User }) {
	const db = useFirestore()
	const auth = useAuth()
	const userRef = doc(db, 'users', user.email as string)

	const [dateRange, setDateRange] = useState<RangeValue<DateValue>>({
		start: parseDate(
			new Date(Date.now() - 604800000).toISOString().split('T')[0],
		),
		end: parseDate(new Date().toISOString().split('T')[0]),
	})

	const { status: userDataStatus, data: userData } =
		useFirestoreDocDataOnce(userRef)
	const { data: articleSubmissions, status: articleSubmissionsStatus } =
		useFirestoreCollectionData(collection(db, 'submissions'))
	const { data: commentedArticles, status: commentedArticlesStatus } =
		useFirestoreCollectionData(
			query(
				collection(db, 'articles'),
				where('submittedComments', '!=', []),
			),
		)
	const { data: recentArticles, status: recentArticlesStatus } =
		useFirestoreCollectionData(
			query(
				collection(db, 'articles'),
				and(
					where(
						'publishDate',
						'>=',
						new Date(
							dateRange.start
								.toDate(getLocalTimeZone())
								.setHours(0, 0, 0, 0),
						),
					),
					where(
						'publishDate',
						'<=',
						new Date(
							dateRange.end
								.toDate(getLocalTimeZone())
								.setHours(23, 59, 59, 999),
						),
					),
				),
			),
		)

	useEffect(() => {
		if (userDataStatus === 'success') {
			setDoc(
				userRef,
				{
					displayName: user.displayName,
					uid: user.uid,
					email: user.email,
					photoURL: user.photoURL,
					lastSession: new Date(),
				},
				{ merge: true },
			)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userDataStatus])

	if (
		articleSubmissionsStatus !== 'success' ||
		commentedArticlesStatus !== 'success' ||
		recentArticlesStatus !== 'success' ||
		userDataStatus !== 'success' ||
		!userData
	)
		return <Loader />
	if (!userData.isAdmin)
		return (
			<ErrMsg
				buttons={[
					{
						text: 'Home',
						href: '/',
						icon: 'home',
					},
					{
						text: 'Sign out',
						href: '#',
						icon: 'logout',
						onPress: () => auth.signOut(),
					},
				]}
				text="You're not an admin 🥲"
			/>
		)

	return (
		<div className="flex h-full w-full flex-grow flex-col gap-6 p-6">
			<div className="flex w-full flex-col items-center gap-6 md:flex-row md:items-start">
				<ModerateArticles articleSubmissions={articleSubmissions} />
				<Divider className="md:hidden" />
				<ModerateComments commentedArticles={commentedArticles} />
			</div>
			<Divider />
			<div className="flex w-full flex-col items-center gap-6 md:flex-row md:items-start">
				<div className="flex w-full items-center gap-2">
					<DateRangePicker
						// label="Date range"
						value={dateRange}
						onChange={setDateRange}
					/>
					<Button
						isIconOnly
						variant="faded"
						onPress={() =>
							setDateRange({
								start: parseDate(
									new Date(Date.now() - 604800000)
										.toISOString()
										.split('T')[0],
								),
								end: parseDate(
									new Date().toISOString().split('T')[0],
								),
							})
						}
					>
						2w
					</Button>
					<Button
						isIconOnly
						className="px-6"
						variant="faded"
						onPress={() =>
							setDateRange({
								start: parseDate('1970-01-01'),
								end: parseDate(
									new Date().toISOString().split('T')[0],
								),
							})
						}
					>
						Max
					</Button>
				</div>
				<AuthorTally articleDocs={recentArticles} />
			</div>
		</div>
	)
}

export default function Page() {
	const { status, data: signInCheckResult } = useSigninCheck()

	if (status !== 'success') return <Loader />
	const { signedIn, user } = signInCheckResult

	if (!signedIn || !user) return <Login />

	return <AdminView user={user} />
}
