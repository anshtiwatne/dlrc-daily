"use client"

import {
	Button,
	useDisclosure,
	Modal,
	ModalBody,
	ModalContent,
	ModalHeader,
	Accordion,
	AccordionItem,
	Card,
	CardHeader,
	CardFooter,
	CardBody,
	Link,
} from "@nextui-org/react"

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
			scrollBehavior="inside"
			onOpenChange={onOpenChange}
		>
			<ModalContent>
				<ModalHeader>Guidelines</ModalHeader>
				<ModalBody className="pb-6">
					<Accordion>
						<AccordionItem title="Content">
							<ul className="flex list-disc flex-col gap-4 pl-4">
								<li>
									All articles, stories, poems, and artwork
									must be original work. Plagiarism will not
									be tolerated
								</li>
								<li>
									Content should be relevant to the student
									body and school community, focusing on
									topics like school events, student
									achievements, hobbies, culture, and
									educational tips
								</li>
								<li>
									Articles should maintain a positive,
									respectful, and inclusive tone. Content that
									could be considered offensive,
									discriminatory, or hurtful to any group or
									individual is strictly prohibited
								</li>
								<li>
									Ensure that all facts, figures, and
									statistics are accurate. Sources should be
									cited where necessary
								</li>
							</ul>
						</AccordionItem>
						<AccordionItem title="Submission">
							<ul className="flex list-disc flex-col gap-4 pl-4">
								<li>
									All contributions must be submitted by the
									deadline to allow time for editing and
									layout design
								</li>
								<li>
									Articles should be submitted in a standard
									word processing format (e.g., .docx or
									Google Docs). Artwork should be submitted as
									high-resolution images in .jpeg or .png
									format
								</li>
								<li>
									Articles should be maximum of 500 words,
									depending on the type and scope of the
									content
								</li>
								<li>
									Include the name of the contributor + grade
									and title
								</li>
							</ul>
						</AccordionItem>
						<AccordionItem title="Moderation">
							<ul className="flex list-disc flex-col gap-4 pl-4">
								<li>
									The editorial team reserves the right to
									edit submissions for grammar, clarity,
									length, and content appropriateness. Major
									changes will be discussed with the author
								</li>
								<li>
									Contributors may receive feedback and be
									asked to revise their work before final
									publication
								</li>
							</ul>
						</AccordionItem>
						<AccordionItem title="Design & Layout">
							<ul className="flex list-disc flex-col gap-4 pl-4">
								<li>
									Maintain a consistent design and layout
									throughout the magazine, using the same
									fonts, color schemes, and styles
								</li>
								<li>
									Ensure that text is legible and that the
									layout is visually appealing and easy to
									navigate. Avoid cluttering pages with too
									much content
								</li>
								<li>
									Include images, illustrations, and other
									visual elements that complement the written
									content and enhance the overall appeal of
									the magazine
								</li>
							</ul>
						</AccordionItem>
						<AccordionItem title="Ethical Considerations">
							<ul className="flex list-disc flex-col gap-4 pl-4">
								<li>
									Obtain permission before publishing any
									photos or personal information of students,
									teachers, or staff members
								</li>
								<li>
									Strive for balanced and fair reporting,
									especially in articles that discuss school
									policies, events, or student issues
								</li>
								<li>
									Give proper credit to authors,
									photographers, and artists. Do not use
									copyrighted material without permission
								</li>
							</ul>
						</AccordionItem>
					</Accordion>
				</ModalBody>
			</ModalContent>
		</Modal>
	)
}

export default function MagazinePublish() {
	const {
		isOpen: isGuidelinesOpen,
		onOpen: onGuidelinesOpen,
		onOpenChange: onGuidelinesOpenChange,
	} = useDisclosure()

	return (
		<div className="flex flex-grow flex-col items-center justify-between gap-4">
			<div className="flex flex-col gap-4 md:flex-row">
				<Card shadow="sm">
					<CardHeader className="text-lg font-semibold">
						Content Submission
					</CardHeader>
					<CardBody>
						Share any interesting stories, artwork, or opinions them
						here for a chance to have them included in the next
						edition of the DLRC Echoes Magazine.
					</CardBody>
					<CardFooter className="flex w-full flex-col items-start gap-2">
						<Link
							isExternal
							showAnchorIcon
							href="https://forms.gle/62vr8y76JzrdRuUY7"
						>
							Fill out the form
						</Link>
						<p className="text-foreground-700">
							Submission deadline:{" "}
							<span className="font-semibold">Jan 10, 2025</span>
						</p>
					</CardFooter>
				</Card>
				<Card shadow="sm">
					<CardHeader className="text-lg font-semibold">
						Cover Page Contest
					</CardHeader>
					<CardBody>
						Have a talent for design? Submit us a design for a cover
						page for the next issue of the magazine on the theme
						&quot;Time&quot;.
					</CardBody>
					<CardFooter className="flex w-full flex-col items-start gap-2">
						<Link
							isExternal
							showAnchorIcon
							href="https://forms.gle/F5xgsfkU3iVBqWjz6"
						>
							Fill out the form
						</Link>
						<p className="text-foreground-700">
							Submission deadline:{" "}
							<span className="font-semibold">Jan 10, 2025</span>
						</p>
					</CardFooter>
				</Card>
			</div>
			<Button
				fullWidth
				className="mt-4"
				color="primary"
				variant="flat"
				onPress={onGuidelinesOpen}
			>
				Guidelines
			</Button>
			<GuidelinesModal
				isOpen={isGuidelinesOpen}
				onOpenChange={onGuidelinesOpenChange}
			/>
		</div>
	)
}
