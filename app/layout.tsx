import '@/app/globals.css'
import 'react-material-symbols/rounded'
import clsx from 'clsx'
import { Metadata, Viewport } from 'next'
import { Poppins } from 'next/font/google'
import { Suspense } from 'react'

import { Providers } from '@/app/providers'
import { FirebaseContextProvider } from '@/config/firebase'
import { Navbar } from '@/components/navbar'
import { InstallPrompt } from '@/components/install-prompt'

const poppins = Poppins({
	weight: ['400', '500', '600', '700', '800', '900'],
	subsets: ['latin'],
})

export const dynamic = 'force-static'

export const metadata: Metadata = {
	title: 'DLRC Daily',
	applicationName: 'DLRC Daily',
	description:
		'Stay updated on the happenings at the DLRC campus through short articles uploaded daily by the DLRC Newsletter',
	metadataBase: new URL('https://daily.dlrc.in'),
	alternates: {
		canonical: 'https://daily.dlrc.in',
	},
	appleWebApp: true,
	formatDetection: {
		telephone: false,
	},
	other: {
		['darkreader-lock']: 'true',
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
			<body className={clsx('min-h-[100dvh]', poppins.className)}>
				<Providers
					themeProps={
						{
							attribute: 'class',
							defaultTheme: 'light',
						} as any
					}
				>
					<FirebaseContextProvider>
						<div className="relative flex h-[100dvh] flex-col">
							<Navbar />
							<main className="flex h-full w-[100dvw] flex-col items-center">
								<Suspense>{children}</Suspense>
							</main>
							<InstallPrompt />
						</div>
					</FirebaseContextProvider>
				</Providers>
			</body>
		</html>
	)
}
