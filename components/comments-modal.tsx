'use client'

import {
	Avatar,
	Button,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
} from '@nextui-org/react'
import clsx from 'clsx'
import { MaterialSymbol } from 'react-material-symbols'
import { useState } from 'react'
import {
	arrayUnion,
	updateDoc,
	DocumentData,
	DocumentReference,
} from '@firebase/firestore'

import { getMillis, timeAgo } from '@/utils/datetime'
import { getRandomColor } from '@/utils/color'

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

export function CommentsModal({
	articleDoc,
	articleRef,
	isOpen,
	onOpenChange,
}: {
	articleDoc: DocumentData
	articleRef: DocumentReference
	isOpen: boolean
	onOpenChange: (isOpen: boolean) => void
}) {
	const [commentText, setCommentText] = useState('')
	const [commentSuccess, setCommentSuccess] = useState<boolean | null>(null)

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

	return (
		<Modal
			isOpen={isOpen}
			scrollBehavior="inside"
			size="xl"
			onOpenChange={onOpenChange}
		>
			<ModalContent>
				<ModalHeader className="flex flex-col gap-1">
					Comments
				</ModalHeader>
				<ModalBody>
					{articleDoc.comments
						.sort(
							(a: any, b: any) =>
								getMillis(b.timestamp) - getMillis(a.timestamp),
						)
						.map((comment: any, i: number) => (
							<div key={i} className="flex gap-2">
								<div className="flex gap-4">
									<div>
										<Avatar
											className="text-white dark:text-zinc-900"
											style={{
												backgroundColor: getRandomColor(
													comment.text,
												),
											}}
										/>
									</div>
									<div className="flex flex-col gap-1">
										<div className="text-xs">
											{timeAgo(
												getMillis(comment.timestamp),
												false,
											)}
										</div>
										<CommentText text={comment.text} />
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
							onValueChange={(value) => setCommentText(value)}
						/>
						<Button
							isIconOnly
							isDisabled={
								commentText.replace(/\s\s+/g, ' ').trim() ===
									'' || commentSuccess !== null
							}
							type="submit"
							variant="light"
						>
							<MaterialSymbol
								className={clsx(
									'text-foreground-700',
									commentSuccess ? 'animate-send' : '',
								)}
								icon="send"
								size={32}
							/>
						</Button>
					</form>
				</ModalFooter>
			</ModalContent>
		</Modal>
	)
}
