"use client"

import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	useDisclosure,
} from "@nextui-org/react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function PublishPrompt() {
	const router = useRouter()
	const { isOpen, onOpen, onOpenChange } = useDisclosure()

	useEffect(() => {
		const promptIgnored = localStorage.getItem("publishPrompt") == "1"

		if (!promptIgnored) {
			setTimeout(() => {
				onOpen()
				localStorage.setItem("publishPrompt", "1")
			}, 100000)
		}
	}, [])

	return (
		<>
			<Modal
				isOpen={isOpen}
				placement="center"
				onOpenChange={onOpenChange}
			>
				<ModalContent>
					{(onClose) => (
						<>
							<ModalHeader className="flex flex-col gap-1">
								Tried Publishing Yet?
							</ModalHeader>
							<ModalBody>
								Did you know you can publish your own articles
								to DLRC Daily.
							</ModalBody>
							<ModalFooter className="flex items-center">
								<Button
									color="primary"
									variant="flat"
									onPress={() => {
										onClose()
										router.push("/publish")
									}}
								>
									Try it now
								</Button>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</>
	)
}
