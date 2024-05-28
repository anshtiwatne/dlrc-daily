import '@/styles/globals.css'
import { Metadata, Viewport } from 'next'
import { Poppins } from 'next/font/google'
import { Suspense } from 'react'
import clsx from 'clsx'

import { Providers } from '@/app/providers'
import { Navbar } from '@/components/navbar'
import { FirebaseContextProvider } from '@/config/firebase'

import 'react-material-symbols/rounded'

const poppins = Poppins({
	weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
	subsets: ['latin'],
})

export const metadata: Metadata = {
	title: 'DLRC Daily',
	description:
		'Stay updated on the happenings at the DLRC campus through short articles uploaded daily by the DLRC Newsletter',
	appleWebApp: true,
	alternates: {
		canonical: 'https://daily.dlrc.in',
	},
	other: {
		['darkreader-lock']: 'true',
	},
	openGraph: {
		images: [
			{
				url: 'https://daily.dlrc.in/logos/any.png',
			},
		],
	},
}

export const viewport: Viewport = {
	userScalable: false,
	themeColor: [
		{ media: '(prefers-color-scheme: light)', color: 'white' },
		{ media: '(prefers-color-scheme: dark)', color: 'black' },
	],
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html suppressHydrationWarning lang="en">
			<head />
			<body className={clsx('min-h-screen', poppins.className)}>
				<Providers
					themeProps={{ attribute: 'class', defaultTheme: 'light' }}
				>
					<FirebaseContextProvider>
						<div className="relative flex h-screen flex-col">
							<Navbar />
							<main className="flex h-full w-[100dvw] flex-col items-center">
								<Suspense>{children}</Suspense>
							</main>
						</div>
					</FirebaseContextProvider>
				</Providers>
			</body>
		</html>
	)
}
