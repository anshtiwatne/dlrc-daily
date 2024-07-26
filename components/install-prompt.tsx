'use client'

import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	useDisclosure,
	Image,
	Link,
} from '@nextui-org/react'

export function InstallPrompt() {
	const { isOpen, onOpen, onOpenChange } = useDisclosure()
	const isMobile = /iPhone|iPod|iPad|Android/i.test(navigator.userAgent)
	const isPWA = window.matchMedia('(display-mode: standalone)').matches
	const promptIgnored = localStorage.getItem('installPrompt') == '1'

	if (isMobile && !isPWA && !promptIgnored) {
		setTimeout(() => {
			onOpen()
			localStorage.setItem('installPrompt', '1')
		}, 25000)
	}

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
								Install DLRC Daily
							</ModalHeader>
							<ModalBody>
								<p>
									For the best experience, get the DLRC Daily
									app on your device.
								</p>
							</ModalBody>
							<ModalFooter className="flex items-center">
								<Button
									color="danger"
									variant="light"
									onPress={onClose}
								>
									Continue in browser
								</Button>
								<Link href="https://play.google.com/store/apps/details?id=in.dlrc.daily.twa">
									<Image
										alt="Get it on Google Play"
										src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
										width={150}
									/>
								</Link>
							</ModalFooter>
						</>
					)}
				</ModalContent>
			</Modal>
		</>
	)
}
