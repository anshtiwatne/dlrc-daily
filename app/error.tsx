'use client'

import { useEffect } from 'react'

import { ErrMsg } from '@/components/error'

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
		<ErrMsg
			buttons={[
				{
					text: 'Try again',
					href: '#',
					icon: 'refresh',
					onClick: () => reset(),
				},
				{
					text: 'Home',
					href: '/',
					icon: 'home',
				},
			]}
			text="Something went wrong! 🫤"
		/>
	)
}
