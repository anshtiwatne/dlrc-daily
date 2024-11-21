"use client"

import { Button } from "@nextui-org/react"
import MaterialSymbol from "@/components/material-symbol"
import NextLink from "next/link"

type ButtonProps = {
	text: string
	href?: string
	icon: string
	onPress?: () => void
}

export default function ErrMsg({
	text,
	buttons,
}: {
	text: string
	buttons?: ButtonProps[]
}) {
	return (
		<div
			className="flex flex-grow flex-col items-center justify-center gap-4"
			style={{ height: "100% !important" }}
		>
			<h1 className="text-center text-2xl text-foreground-800">{text}</h1>
			{buttons && (
				<div className="flex gap-2">
					{buttons.map((button) =>
						button.href ? (
							<Button
								key={button.icon}
								as={NextLink}
								color="primary"
								href={button.href}
								startContent={
									<MaterialSymbol
										icon={button.icon}
										size={20}
									/>
								}
								variant="flat"
								onPress={button.onPress}
							>
								{button.text}
							</Button>
						) : (
							<Button
								key={button.icon}
								color="primary"
								startContent={
									<MaterialSymbol
										icon={button.icon}
										size={20}
									/>
								}
								variant="flat"
								onPress={button.onPress}
							>
								{button.text}
							</Button>
						),
					)}
				</div>
			)}
		</div>
	)
}
