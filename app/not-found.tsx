'use client'

import { Button } from '@nextui-org/button'
import { MaterialSymbol } from 'react-material-symbols'
import NextLink from 'next/link'

export default function Error() {
	return (
		<div className="flex h-full flex-col items-center justify-center">
			<h1 className="flex gap-1 py-4 text-center text-2xl text-foreground-800">
				<span className="font-medium">404</span>
				<span>| Page not found 🧐</span>
			</h1>
			<div className="flex gap-2">
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
