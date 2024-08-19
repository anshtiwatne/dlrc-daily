'use client'

import Image from 'next/image'
import { Button } from '@nextui-org/react'
import { useAuth } from 'reactfire'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { Roboto } from 'next/font/google'

const RobotoFont = Roboto({
	weight: '500',
	style: 'normal',
	display: 'swap',
	subsets: ['latin'],
})

export function Login() {
	const auth = useAuth()

	async function signIn() {
		const provider = new GoogleAuthProvider()

		await signInWithPopup(auth, provider)
	}

	return (
		<main className="flex h-full items-center justify-center">
			<Button
				className="h-[40px] gap-[10px] border-1 border-[#747775] bg-white px-[12px] text-[#1F1F1F] hover:shadow dark:border-[#E3E3E3] dark:bg-[#131314] dark:text-[#E3E3E3]"
				radius="full"
				variant="flat"
				onPress={signIn}
			>
				<Image
					alt="Google logo"
					height={20}
					src="/images/google-g.png"
					width={20}
				/>
				<div className={`whitespace-nowrap" ${RobotoFont.className}`}>
					Sign in with Google
				</div>
			</Button>
		</main>
	)
}
