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
	arrayUnion,
	arrayRemove,
} from 'firebase/firestore'
import { ref, deleteObject } from 'firebase/storage'
import { User } from 'firebase/auth'
import { MaterialSymbol } from 'react-material-symbols'
import {
	useStorage,
	useFirestore,
	useFirestoreCollectionData,
	useFirestoreDocData,
	useSigninCheck,
	useAuth,
} from 'reactfire'
import clsx from 'clsx'

import { Loader } from '@/components/loader'
import { Login } from '@/components/login'
import { ErrMsg } from '@/components/error'

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
										<p className="w-[30dvw] overflow-clip sm:w-96">
											{submission.comment.text}
										</p>
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

function AdminView({ user }: { user: User }) {
	const db = useFirestore()
	const auth = useAuth()
	const userRef = doc(db, 'users', user.email as string)
	const { status: userDataStatus, data: userData } =
		useFirestoreDocData(userRef)
	const { data: articleSubmissions, status: articleSubmissionsStatus } =
		useFirestoreCollectionData(collection(db, 'submissions'))
	const { data: commentedArticles, status: commentedArticlesStatus } =
		useFirestoreCollectionData(
			query(
				collection(db, 'articles'),
				where('submittedComments', '!=', []),
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
		<div className="flex h-full w-full flex-col items-center gap-6 p-6 md:flex-row md:items-start">
			<ModerateArticles articleSubmissions={articleSubmissions} />
			<Divider className="md:hidden" />
			<ModerateComments commentedArticles={commentedArticles} />
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
