'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Switch } from '@nextui-org/react'
import { MaterialSymbol } from 'react-material-symbols'

export function ThemeSwitch() {
	const [mounted, setMounted] = useState(false)
	const { theme, setTheme } = useTheme()

	useEffect(() => {
		setMounted(true)
	}, [])

	if (!mounted) return null

	return (
		<Switch
			aria-label="Toggle theme"
			color="primary"
			isSelected={theme === 'dark'}
			size="lg"
			thumbIcon={({ isSelected, className }) =>
				isSelected ? (
					<MaterialSymbol
						fill
						className={className}
						icon="dark_mode"
					/>
				) : (
					<MaterialSymbol
						fill
						className={className}
						icon="light_mode"
					/>
				)
			}
			onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
		/>
	)
}
