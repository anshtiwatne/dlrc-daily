'use client'

import { Button } from '@nextui-org/button'
import { MaterialSymbol } from 'react-material-symbols'
import NextLink from 'next/link'

export default function Page() {
	return (
		<div className="flex h-full flex-col items-center justify-center">
			<h1 className="py-4 text-center text-2xl text-foreground-800">
				You seem to be offline 😴
			</h1>
			<div className="flex gap-2">
				<Button
					as={NextLink}
					color="primary"
					href="/"
					startContent={<MaterialSymbol icon="refresh" size={20} />}
					variant="flat"
				>
					Refresh
				</Button>
			</div>
		</div>
	)
}
