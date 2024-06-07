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
} from '@nextui-org/react'
import { useEffect, useState } from 'react'
import {
	DocumentData,
	collection,
	doc,
	setDoc,
	deleteDoc,
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

function AdminView({ user }: { user: User }) {
	const db = useFirestore()
	const storage = useStorage()
	const auth = useAuth()
	const userRef = doc(db, 'users', user.email as string)
	const { status: userDataStatus, data: userData } =
		useFirestoreDocData(userRef)
	const { data: submissions, status: submissionStatus } =
		useFirestoreCollectionData(collection(db, 'submissions'))
	const [search, setSearch] = useState('')

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
		submissionStatus !== 'success' ||
		userDataStatus !== 'success' ||
		!userData
	)
		return <Loader />
	if (!userData.isAdmin)
		return (
			<ErrMsg
				buttons={[
					{
						text: 'Sign out',
						href: '#',
						icon: 'logout',
						onClick: () => auth.signOut(),
					},
					{
						text: 'Home',
						href: '/',
						icon: 'home',
					},
				]}
				text="You're not an admin 🥲"
			/>
		)

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
							onClick={onViewOpen}
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
							onClick={handlePublish}
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
							onClick={handleDelete}
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
						{() => (
							<>
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
										onClick={() =>
											setShowBgColor((prev) => !prev)
										}
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
												<MaterialSymbol
													icon="tag"
													size={16}
												/>
											}
											variant={
												showBgColor ? 'flat' : 'faded'
											}
										>
											{tagData.text}
										</Chip>
										<Chip
											className={clsx(
												'py-[0.125rem] pl-[0.625rem]',
												showBgColor
													? 'bg-[rgba(255,255,255,0.09375)] text-neutral-800'
													: '',
											)}
											startContent={
												<MaterialSymbol
													icon="sell"
													size={16}
												/>
											}
											variant={
												showBgColor ? 'flat' : 'faded'
											}
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
												showBgColor
													? 'text-neutral-700'
													: '',
											)}
										>
											{submission.author}
										</span>
									</div>
								</ModalBody>
							</>
						)}
					</ModalContent>
				</Modal>
			</>
		)
	}

	return (
		<div className="flex w-full max-w-2xl flex-col gap-4 p-6">
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
					<TableColumn align="end">ACTIONS</TableColumn>
				</TableHeader>
				<TableBody>
					{submissions
						.filter((submission) =>
							submission.headline
								.toLowerCase()
								.includes(search.trim().toLowerCase()),
						)
						?.map((submission: DocumentData) => (
							<TableRow key={submission.NO_ID_FIELD}>
								<TableCell>{submission.headline}</TableCell>
								<TableCell>
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

export default function Page() {
	const { status, data: signInCheckResult } = useSigninCheck()

	if (status !== 'success') return <Loader />
	const { signedIn, user } = signInCheckResult

	if (!signedIn || !user) return <Login />

	return <AdminView user={user} />
}
