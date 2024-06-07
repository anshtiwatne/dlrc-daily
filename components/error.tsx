'use client'

import { Button } from '@nextui-org/react'
import { MaterialSymbol } from 'react-material-symbols'
import NextLink from 'next/link'

type ButtonProps = {
	text: string
	href?: string
	icon: string
	onClick?: () => void
}

export function ErrMsg({
	text,
	buttons,
}: {
	text: string
	buttons: ButtonProps[]
}) {
	return (
		<div className="flex h-full flex-col items-center justify-center">
			<h1 className="py-4 text-center text-2xl text-foreground-800">
				{text}
			</h1>
			<div className="flex gap-2">
				{buttons.map((button) =>
					button.href ? (
						<Button
							key={button.icon}
							as={NextLink}
							color="primary"
							href="/"
							startContent={
								<MaterialSymbol
									icon={button.icon as any}
									size={20}
								/>
							}
							variant="flat"
							onClick={button.onClick}
						>
							{button.text}
						</Button>
					) : (
						<Button
							key={button.icon}
							color="primary"
							startContent={
								<MaterialSymbol
									icon={button.icon as any}
									size={20}
								/>
							}
							variant="flat"
							onClick={button.onClick}
						>
							{button.text}
						</Button>
					),
				)}
			</div>
		</div>
	)
}
