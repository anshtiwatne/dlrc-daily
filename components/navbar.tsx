'use client'

import {
	Navbar as NextUINavbar,
	NavbarContent,
	NavbarBrand,
	Link,
	Image,
	NavbarMenuToggle,
	NavbarMenu,
	NavbarMenuItem,
	Divider,
} from '@nextui-org/react'
import clsx from 'clsx'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import { Roboto_Slab } from 'next/font/google'
import { MaterialSymbol } from 'react-material-symbols'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGooglePlay } from '@fortawesome/free-brands-svg-icons'
import { useState, Fragment, useEffect } from 'react'
import { useAuth, useSigninCheck } from 'reactfire'

import { ThemeSwitch } from '@/components/theme-switch'

const robotoSlab = Roboto_Slab({ subsets: ['latin'] })
const navItems = [
	{ text: 'Home', icon: 'home', href: '/' },
	{ text: 'Gallery view', icon: 'photo_library', href: '/gallery' },
	{ text: 'Publish', icon: 'newspaper', href: '/publish' },
	{ text: 'Admin', icon: 'shield_person', href: '/admin' },
	{ text: 'About', icon: 'info', href: '/about' },
	{ text: 'Privacy policy', icon: 'shield', href: './privacy' },
]

export function Navbar() {
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const [navTransparency, setNavTransparency] = useState(false)
	const { data: signInCheckResult } = useSigninCheck()
	const auth = useAuth()
	const pathname = usePathname()

	useEffect(() => {
		if (pathname === '/') setNavTransparency(true)
		else setNavTransparency(false)
	}, [pathname])

	return (
		<NextUINavbar
			className={navTransparency && !isMenuOpen ? 'bg-transparent' : ''}
			isBlurred={!navTransparency || isMenuOpen}
			isBordered={!navTransparency}
			maxWidth="full"
			position="sticky"
			onMenuOpenChange={setIsMenuOpen}
		>
			<NavbarContent justify="start">
				<NavbarBrand as="li">
					<button
						className="flex items-center justify-start gap-2"
						onClick={() => (window.location.href = '/')}
					>
						<Image
							alt="logo"
							radius="none"
							src="/logos/dlrc-daily.svg"
							style={{
								boxShadow:
									'0.1rem 0.1rem 1rem rgba(0, 0, 0, 0.125)',
							}}
							width={30}
						/>
						<p
							className={clsx(
								'font-black text-opacity-75',
								navTransparency && !isMenuOpen
									? 'text-animate-disappear text-neutral-200'
									: 'text-black text-opacity-100 dark:text-neutral-300',
								robotoSlab.className,
							)}
							style={{
								textShadow:
									'0.1rem 0.1rem 1rem rgba(0, 0, 0, 0.25)',
							}}
						>
							DLRC DAILY
						</p>
					</button>
				</NavbarBrand>
			</NavbarContent>

			<NavbarContent justify="end">
				<button
					className="flex items-center"
					onClick={() =>
						document.getElementById('menu-toggle')?.click()
					}
					// style={
					// 	navTransparency && !isMenuOpen
					// 		? { background: 'radial-gradient(farthest-corner, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 100%)' }
					// 		: {}
					// }
				>
					<MaterialSymbol
						className={clsx(
							navTransparency && !isMenuOpen
								? 'text-neutral-200 text-opacity-95 lg:text-neutral-700 lg:text-opacity-75'
								: 'text-black text-opacity-100 dark:text-neutral-300',
						)}
						icon={isMenuOpen ? 'close' : 'menu'}
						size={24}
					/>
				</button>
				<NavbarMenuToggle
					aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
					className="hidden"
					id="menu-toggle"
				/>
			</NavbarContent>

			<NavbarMenu className="flex flex-col justify-evenly pb-4 font-semibold scrollbar-hide sm:ml-auto sm:w-max">
				<div className="flex flex-col gap-2">
					{navItems.map((item, i) => (
						<Fragment key={i}>
							<NavbarMenuItem isActive>
								<Link
									as={NextLink}
									className="text-foreground-800"
									color="foreground"
									href={item.href}
									size="lg"
									onClick={() =>
										document
											.getElementById('menu-toggle')
											?.click()
									}
								>
									<span className="flex items-center gap-2">
										<MaterialSymbol
											icon={item.icon as any}
											size={24}
										/>
										<p>{item.text}</p>
									</span>
								</Link>
							</NavbarMenuItem>
							{i < navItems.length - 1 && <Divider />}
						</Fragment>
					))}
				</div>
				<div className="flex flex-col gap-2">
					<NavbarMenuItem className="flex items-center justify-between gap-2">
						<div className="flex items-center gap-2 text-foreground-800">
							<MaterialSymbol icon="contrast" size={24} />
							<p>Dark mode</p>
						</div>
						<ThemeSwitch />
					</NavbarMenuItem>
					<Divider />
					<NavbarMenuItem>
						<Link
							isExternal
							as={NextLink}
							className="text-foreground-800"
							color="foreground"
							href="https://play.google.com/store/apps/details?id=in.dlrc.daily.twa"
							size="lg"
							onClick={() =>
								document.getElementById('menu-toggle')?.click()
							}
						>
							<div className="flex items-center gap-2">
								<FontAwesomeIcon
									className="px-[0.125rem] text-[1.25rem]"
									icon={faGooglePlay}
								/>
								<p>Review</p>
							</div>
						</Link>
					</NavbarMenuItem>
					{signInCheckResult?.signedIn && (
						<>
							<Divider />
							<NavbarMenuItem
								className="flex items-center gap-2 text-foreground-800"
								onClick={() => auth.signOut()}
							>
								<MaterialSymbol icon="logout" size={24} />
								<p>Sign out</p>
							</NavbarMenuItem>
						</>
					)}
				</div>
			</NavbarMenu>
		</NextUINavbar>
	)
}
