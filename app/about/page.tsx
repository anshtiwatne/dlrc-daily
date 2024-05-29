'use client'

import { Divider, Link } from '@nextui-org/react'
import { MaterialSymbol } from 'react-material-symbols'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { useEffect, useState } from 'react'
import NextLink from 'next/link'

import { Loader } from '@/components/loader'

const aboutLinks = [
	{
		text: 'Developed by Ansh Tiwatne',
		icon: 'code',
		href: 'https://ansht.com',
	},
	{
		text: 'MIT License',
		icon: 'license',
		href: 'https://raw.githubusercontent.com/anshtiwatne/dlrc-daily/main/LICENSE',
	},
	{
		text: 'Contribute on GitHub',
		icon: faGithub,
		href: 'https://github.com/anshtiwatne/dlrc-daily',
	},
	{
		text: `DLRC Foundation ${new Date().getFullYear()}`,
		icon: 'copyright',
		href: 'https://dlrc.in',
	},
	{
		text: `Write to us`,
		icon: 'email',
		href: 'mailto:dev@dlrc.in',
	},
]

export default function Page() {
	const [mounted, setMounted] = useState(false)

	useEffect(() => setMounted(true), [])

	if (!mounted) return <Loader />

	return (
		<div className="flex h-full max-w-2xl flex-col items-center justify-between gap-4 p-6">
			<div className="flex w-full flex-col gap-6">
				<p className="flex-grow">
					DLRC Daily was built to serve short form news from around
					the DLRC campus across our community.
				</p>
				<Divider />
				<div className="flex flex-col gap-4">
					{aboutLinks.map((link) => (
						<Link
							key={link.href}
							isExternal
							as={NextLink}
							className="flex items-center gap-2"
							color="foreground"
							href={link.href}
						>
							{typeof link.icon === 'string' ? (
								<MaterialSymbol
									className="text-foreground-800"
									icon={link.icon as any}
									size={24}
								/>
							) : (
								<FontAwesomeIcon
									className="px-[0.125rem] text-[1.25rem] text-foreground-800"
									icon={link.icon as any}
								/>
							)}
							{link.text}
						</Link>
					))}
				</div>
			</div>
			<p style={{ fontFamily: 'monospace' }}>version 2.0.0-RC</p>
		</div>
	)
}
