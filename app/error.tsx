'use client'

import { useEffect } from 'react'
import { Button } from '@nextui-org/button'
import { MaterialSymbol } from 'react-material-symbols'
import NextLink from 'next/link'

export default function Error({
	error,
	reset,
}: {
	error: Error
	reset: () => void
}) {
	useEffect(() => {
		// Log the error to an error reporting service
		// eslint-disable-next-line no-console
		console.error(error)
	}, [error])

	return (
		<div className="flex h-full flex-col items-center justify-center">
			<h1 className="py-4 text-center text-2xl text-foreground-800">
				Something went wrong! 🫤
			</h1>
			<div className="flex gap-2">
				<Button
					color="primary"
					href="#"
					startContent={
						<MaterialSymbol icon="device_reset" size={20} />
					}
					variant="flat"
					onClick={() => reset()}
				>
					Try again
				</Button>
				<Button
					as={NextLink}
					color="primary"
					href="/"
					startContent={<MaterialSymbol icon="home" size={20} />}
					variant="flat"
				>
					Home
				</Button>
			</div>
		</div>
	)
}
