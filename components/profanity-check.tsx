'use client'

import { Chip } from '@nextui-org/react'
import { useEffect, useState } from 'react'
import { MaterialSymbol } from 'react-material-symbols'

interface ProfanityResult {
	isProfanity: boolean
	score: number
	flaggedFor: string
}

export async function profanityCheck(
	text: string,
	type: 'vector' | 'tensor' = 'vector',
): Promise<any> {
	const res = await fetch(`https://${type}.profanity.dev`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
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

	console.log(profanityResult)

	return profanityResult === null ? (
		<p className="text-foreground-700">Checking for profanity...</p>
	) : (
		<Chip
			className="py-[0.125rem] pl-[0.625rem]"
			startContent={
				<MaterialSymbol
					icon={profanityResult.isProfanity ? 'warning' : 'verified'}
					size={16}
				/>
			}
			color={profanityResult.isProfanity ? 'danger' : 'success'}
			variant="flat"
		>
			{profanityResult.isProfanity
				? 'Profanity detected'
				: 'No profanity detected'}
		</Chip>
	)
}
