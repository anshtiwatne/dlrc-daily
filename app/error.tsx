'use client'

import { useEffect } from 'react'
import {
	Modal,
	ModalContent,
	ModalBody,
	ModalHeader,
	useDisclosure,
} from '@nextui-org/react'

import { ErrMsg } from '@/components/error'

export default function Error({
	error,
	reset,
}: {
	error: Error
	reset: () => void
}) {
	const { isOpen, onOpen, onOpenChange } = useDisclosure()

	useEffect(() => {
		// Log the error to an error reporting service
		// eslint-disable-next-line no-console
		console.error(error)
	}, [error])

	return (
		<>
			<ErrMsg
				buttons={[
					{
						text: 'More info',
						icon: 'info',
						onPress: onOpen,
					},
					{
						text: 'Try again',
						href: '#',
						icon: 'refresh',
						onPress: () => reset(),
					},
				]}
				text="Something went wrong! 🫤"
			/>
			<Modal isOpen={isOpen} onOpenChange={onOpenChange}>
				<ModalContent>
					{() => (
						<>
							<ModalHeader>{error.name}</ModalHeader>
							<ModalBody className="pb-4 pt-0">
								{error.message}
							</ModalBody>
						</>
					)}
				</ModalContent>
			</Modal>
		</>
	)
}
