'use client'

import { CircularProgress } from '@nextui-org/react'

export function Loader() {
	return (
		<main className="flex h-full items-center justify-center overflow-hidden scrollbar-hide">
			<CircularProgress aria-label="loading" size="lg" />
		</main>
	)
}
