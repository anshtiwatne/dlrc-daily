'use client'

import {
	Input,
	Button,
	Select,
	SelectItem,
	Textarea,
	Link,
	useDisclosure,
	Modal,
	ModalBody,
	ModalContent,
	ModalHeader,
	Card,
	CardBody,
	CardFooter,
	Tooltip,
	Checkbox,
} from '@nextui-org/react'
import {
	useFirestore,
	useFirestoreCollectionData,
	useFirestoreCollection,
	useStorage,
} from 'reactfire'
import { collection, doc, setDoc } from 'firebase/firestore'
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage'
import { MaterialSymbol } from 'react-material-symbols'
import { useRef, useState } from 'react'
import { useTheme } from 'next-themes'
// @ts-ignore
import { useExtractColor } from 'react-extract-colors'

import { Loader } from '@/components/loader'
import { generateID } from '@/utils/id'
import { capitalizeTitle } from '@/utils/text'
import { getBgColor } from '@/utils/color'
import { linkifyPreview } from '@/utils/text'
import { dataURLToBlob } from '@/utils/file'
import { webpSupported } from '@/utils/platform'
import { ErrMsg } from '@/components/error'
import { pseudonyms } from '@/utils/constants'
import { sortTags } from '@/utils/sort'

function GuidelinesModal({
	isOpen,
	onOpenChange,
}: {
	isOpen: boolean
	onOpenChange: (open: boolean) => void
}) {
	return (
		<Modal
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			scrollBehavior="inside"
		>
			<ModalContent>
				<ModalHeader>Guidelines</ModalHeader>
				<ModalBody className="pb-6">
					<ul className="flex list-disc flex-col gap-4 pl-4">
						<li>
							Images must be a single 4:3 aspect ratio photo or
							graphic (not a collage), without any watermarks or
							filters
						</li>
						<li>
							Headlines must be in title case and less than or
							equal to 30 characters in length (click the
							<MaterialSymbol
								className="align-bottom"
								icon="keyboard_capslock"
								size={22.5}
							/>
							button to autocapitalize)
						</li>
						<li>
							Stories must be in either English or Hindi and less
							than or equal to 300 characters in length
						</li>
					</ul>
				</ModalBody>
			</ModalContent>
		</Modal>
	)
}

function SuccessModal({
	isOpen,
	onOpenChange,
}: {
	isOpen: boolean
	onOpenChange: (open: boolean) => void
}) {
	return (
		<Modal isOpen={isOpen} onOpenChange={onOpenChange}>
			<ModalContent>
				<ModalHeader className="flex flex-col gap-1 tap-highlight-transparent">
					Article Submitted!
				</ModalHeader>
				<ModalBody className="pb-5">
					Your article has been submitted. It should be reviewed and
					published on DLRC Daily soon, if it isn't please let us
					know.
				</ModalBody>
			</ModalContent>
		</Modal>
	)
}

export function DailyPublish() {
	const { theme } = useTheme()
	const db = useFirestore()
	const storage = useStorage()
	const fileInputRef = useRef<HTMLInputElement>(null)

	const {
		isOpen: isGuidelinesOpen,
		onOpen: onGuidelinesOpen,
		onOpenChange: onGuidelinesOpenChange,
	} = useDisclosure()
	const {
		isOpen: isSubmitSuccessOpen,
		onOpen: onSubmitSuccessOpen,
		onOpenChange: onSubmitSuccessOpenChange,
	} = useDisclosure()
	const {
		isOpen: isPlatformInfoOpen,
		onOpen: onPlatformInfoOpen,
		onOpenChange: onPlatformInfoOpenChange,
	} = useDisclosure()

	const [image, setImage] = useState<string | null>(null)
	const [isImgLoading, setIsImgLoading] = useState(false)
	const [selectedTag, setSelectedTag] = useState('')
	const [headline, setHeadline] = useState('')
	const [story, setStory] = useState('')
	const [firstName, setFirstName] = useState('')
	const [lastName, setLastName] = useState('')
	const [selectedPseudonym, setSelectedPseudonym] = useState('')
	const [isAnonymous, setIsAnonymous] = useState(false)
	const [isSubmitSuccess, setIsSubmitSuccess] = useState<boolean | null>(null)
	const [submitBtnDisabled, setSubmitBtnDisabled] = useState(false)

	const maxHeadlineLength = 30
	const maxStoryLength = 300

	const { data: tags, status: tagsStatus } = useFirestoreCollectionData(
		collection(db, 'tags'),
	)

	const { data: articles, status: articlesStatus } = useFirestoreCollection(
		collection(db, 'articles'),
	)
	const { data: submissions, status: submissionsStatus } =
		useFirestoreCollection(collection(db, 'submissions'))

	const { dominantColor } = useExtractColor(image)

	if (!webpSupported()) {
		return (
			<>
				<ErrMsg
					buttons={[
						{
							text: 'Home',
							href: '/',
							icon: 'home',
						},
						{
							text: 'Info',
							icon: 'info',
							onPress: () => onPlatformInfoOpen(),
						},
					]}
					text="Platform not supported 😔"
				/>
				<Modal
					isOpen={isPlatformInfoOpen}
					onOpenChange={onPlatformInfoOpenChange}
				>
					<ModalContent>
						{() => (
							<>
								<ModalHeader className="flex flex-col gap-1">
									Info
								</ModalHeader>
								<ModalBody className="pb-6">
									Publishing DLRC Daily articles is not
									supported on iOS and macOS running Safari,
									try on a different device or browser
								</ModalBody>
							</>
						)}
					</ModalContent>
				</Modal>
			</>
		)
	}

	if (
		tagsStatus !== 'success' ||
		articlesStatus !== 'success' ||
		submissionsStatus !== 'success'
	)
		return <Loader />

	function getUsedIDs() {
		const articleIDs = articles.docs.map((doc) => doc.id)
		const submissionIDs = submissions.docs.map((doc) => doc.id)
		const usedIDs = [...articleIDs, ...submissionIDs]

		return usedIDs
	}

	function handleSubmit() {
		setSubmitBtnDisabled(true)
		if (
			image &&
			!isImgLoading &&
			selectedTag &&
			headline.trim().length <= 30 &&
			linkifyPreview(story.trim()).length <= 300 &&
			(firstName.trim() || selectedPseudonym)
		) {
			const usedIDs = getUsedIDs()
			const newID = generateID(usedIDs)
			const submissionRef = doc(db, 'submissions', newID)
			const storageRef = ref(storage, `coverImages/${newID}.webp`)
			const author = isAnonymous
				? selectedPseudonym
				: `${firstName.trim()} ${lastName.trim()}`.trim() // if no last name, the center space is trimmed

			fetch(image)
				.then((response) => response.blob())
				.then((blob) => {
					uploadBytes(storageRef, blob).then(() => {
						getDownloadURL(storageRef).then((url) => {
							setDoc(submissionRef, {
								coverImage: url,
								color: getBgColor(dominantColor),
								tag: doc(db, 'tags', selectedTag),
								headline: headline
									.replace(/\s\s+/g, ' ')
									.trim(),
								story: story.replace(/\s\s+/g, ' ').trim(),
								author: author.replace(/\s\s+/g, ' ').trim(),
							}).then(() => {
								handleSubmitSuccess()
							})
						})
					})
				})
		} else {
			handleSubmitFailure()
		}
	}

	function handleSubmitSuccess() {
		setIsSubmitSuccess(true)
		setTimeout(() => {
			setImage(null)
			setSelectedTag('')
			setHeadline('')
			setStory('')
			setFirstName('')
			setLastName('')
			setIsAnonymous(false)
			setSelectedPseudonym('')
			setIsSubmitSuccess(null)
			setSubmitBtnDisabled(false)
			onSubmitSuccessOpen()
		}, 500)
	}

	function handleSubmitFailure() {
		setIsSubmitSuccess(false)
		setTimeout(() => {
			setIsSubmitSuccess(null)
			setSubmitBtnDisabled(false)
		}, 2000)
	}

	function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0]
		const reader = new FileReader()

		if (file) setIsImgLoading(true)
		reader.onload = (event) => {
			const img = new Image()

			img.onload = async () => {
				const canvas = document.createElement('canvas')

				canvas.width = img.width
				canvas.height = img.height

				const ctx = canvas.getContext('2d')

				ctx?.drawImage(img, 0, 0)

				let low = 0,
					high = 1
				const desiredSize = 100000 // 100 kB
				let blob

				while (high - low > 0.01) {
					const quality = (low + high) / 2
					const webpDataUrl = canvas.toDataURL('image/webp', quality)

					blob = dataURLToBlob(webpDataUrl)

					if (blob.size > desiredSize) {
						high = quality
					} else {
						low = quality
					}
				}

				const url = blob ? URL.createObjectURL(blob) : undefined

				setImage(url ?? null)
				setIsImgLoading(false)
			}
			img.src = event.target?.result as string
		}

		if (file) {
			reader.readAsDataURL(file)
		}
	}

	return (
		<div className="flex w-full flex-col items-center justify-center lg:h-full lg:flex-row lg:gap-8">
			<Card
				fullWidth
				className="border-medium dark:border-transparent"
				shadow="none"
			>
				<CardBody onClick={() => fileInputRef.current?.click()}>
					<div
						className="relative w-full rounded-lg bg-cover bg-center pt-[75%] text-white"
						style={{
							backgroundImage: `url(${image ?? `/images/img-placeholder-${theme === 'light' ? 'light' : 'dark'}.svg`})`,
						}}
					/>
				</CardBody>
				<CardFooter className="flex justify-between pt-0">
					<div className="flex items-center gap-2">
						<p className="text-sm text-foreground-500">
							Cover image
						</p>
						{dominantColor && (
							<div
								className="h-4 w-4 rounded-full"
								style={{
									backgroundColor: getBgColor(dominantColor),
								}}
							/>
						)}
					</div>
					<input
						ref={fileInputRef}
						hidden
						accept="image/*"
						type="file"
						onChange={handleFileChange}
					/>
					<Button
						color="primary"
						isDisabled={isImgLoading}
						size="sm"
						startContent={
							!isImgLoading && (
								<MaterialSymbol icon="upload" size={20} />
							)
						}
						variant="flat"
						onPress={() => fileInputRef.current?.click()}
					>
						{isImgLoading ? 'Loading...' : 'Upload'}
					</Button>
				</CardFooter>
			</Card>
			<div className="flex w-full flex-col gap-4 lg:justify-between">
				<div className="flex w-full flex-col gap-2">
					<Select
						isRequired
						label="Tag"
						selectedKeys={[selectedTag]}
						value={selectedTag}
						variant="underlined"
						onChange={(e) => setSelectedTag(e.target.value)}
					>
						{sortTags(tags).map((tag: any) => (
							<SelectItem
								key={tag.NO_ID_FIELD}
								textValue={tag.text}
							>
								<span
									className={
										tag.NO_ID_FIELD === 'NONE'
											? 'text-danger'
											: ''
									}
								>
									{tag.text}
								</span>
							</SelectItem>
						))}
					</Select>
					<div className="flex w-full items-center gap-1">
						<Input
							isRequired
							autoCapitalize="on"
							description={`${headline.trim().length} / ${maxHeadlineLength}`}
							isInvalid={
								headline.trim().length > maxHeadlineLength
							}
							label="Headline"
							value={headline}
							variant="underlined"
							onValueChange={setHeadline}
						/>
						<Tooltip content="Auto capitalize">
							<Button
								isIconOnly
								color="primary"
								size="sm"
								variant="faded"
								onPress={() =>
									setHeadline((prev) => capitalizeTitle(prev))
								}
							>
								<MaterialSymbol
									icon="keyboard_capslock"
									size={20}
								/>
							</Button>
						</Tooltip>
					</div>
					<Textarea
						description={`${linkifyPreview(story.trim()).length} / ${maxStoryLength}`}
						isInvalid={
							linkifyPreview(story.trim()).length > maxStoryLength
						}
						label="Story"
						value={story}
						variant="underlined"
						onValueChange={setStory}
					/>
					<Checkbox
						className="pt-4"
						isSelected={isAnonymous}
						onValueChange={setIsAnonymous}
					>
						<span className="text-foreground-600">
							Submit anonymously
						</span>
					</Checkbox>
					{isAnonymous ? (
						<Select
							isRequired
							label="Pseudonym"
							selectedKeys={[selectedPseudonym]}
							value={selectedPseudonym}
							variant="underlined"
							onChange={(e) =>
								setSelectedPseudonym(e.target.value)
							}
						>
							{pseudonyms.map((pseudonym: string) => (
								<SelectItem key={pseudonym}>
									{pseudonym}
								</SelectItem>
							))}
						</Select>
					) : (
						<div className="flex items-center gap-2">
							<Input
								isRequired
								autoComplete="given-name"
								label="First name"
								name="fname"
								value={firstName}
								variant="underlined"
								onValueChange={(value) =>
									setFirstName(
										value
											.toLowerCase()
											.split(' ')
											.map(
												(word) =>
													word
														.charAt(0)
														.toUpperCase() +
													word.slice(1),
											)
											.join(' '),
									)
								}
							/>
							<Input
								autoComplete="family-name"
								label="Last name"
								name="lname"
								value={lastName}
								variant="underlined"
								onValueChange={(value) =>
									setLastName(
										value
											.toLowerCase()
											.split(' ')
											.map(
												(word) =>
													word
														.charAt(0)
														.toUpperCase() +
													word.slice(1),
											)
											.join(' '),
									)
								}
							/>
						</div>
					)}
				</div>
				<div className="flex w-full flex-col gap-2">
					<Link
						className="my-4 ml-1 w-full cursor-pointer text-left text-sm"
						color="primary"
						onClick={onGuidelinesOpen}
					>
						Guidelines
					</Link>
					<Button
						fullWidth
						color={
							isSubmitSuccess === null
								? 'primary'
								: isSubmitSuccess
									? 'success'
									: 'danger'
						}
						disabled={submitBtnDisabled}
						variant={isSubmitSuccess === null ? 'flat' : 'bordered'}
						onPress={handleSubmit}
					>
						{isSubmitSuccess === null
							? 'Submit'
							: isSubmitSuccess
								? 'Submitted!'
								: 'Check all fields and try again'}
					</Button>
				</div>
			</div>
			<GuidelinesModal
				isOpen={isGuidelinesOpen}
				onOpenChange={onGuidelinesOpenChange}
			/>
			<SuccessModal
				isOpen={isSubmitSuccessOpen}
				onOpenChange={onSubmitSuccessOpenChange}
			/>
		</div>
	)
}
