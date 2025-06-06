"use client"

import { Chip, Progress } from "@nextui-org/react"
import { useEffect, useState } from "react"
import MaterialSymbol from "@/components/material-symbol"

interface ProfanityResult {
	isProfanity: boolean
	score: number
	// flaggedFor: string
}

export async function profanityCheck(
	text: string,
	type: "vector" | "tensor" = "vector",
): Promise<ProfanityResult> {
	const res = await fetch(`https://${type}.profanity.dev`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ message: text }),
	})
	const json = await res.json()

	return json
}

export function ProfanityBadge({ text }: { text: string }) {
	const [profanityResult, setProfanityResult] =
		useState<ProfanityResult | null>(null)

	useEffect(() => {
		const checkProfanity = async () => {
			const result = await profanityCheck(text)

			setProfanityResult(result)
		}

		checkProfanity()
	}, [text])

	return profanityResult === null ? (
		<Progress isIndeterminate label="Checking for profanity..." size="sm" />
	) : (
		<Chip
			className="py-[0.125rem] pl-[0.625rem]"
			color={profanityResult.isProfanity ? "danger" : "success"}
			startContent={
				<MaterialSymbol
					icon={profanityResult.isProfanity ? "warning" : "verified"}
					size={16}
				/>
			}
			variant="flat"
		>
			{profanityResult.isProfanity
				? "Profanity detected"
				: "No profanity detected"}
		</Chip>
	)
}
