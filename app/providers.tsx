"use client"

import { NextUIProvider } from "@nextui-org/system"
// import { useRouter } from 'next/navigation'
import { ThemeProvider, ThemeProviderProps } from "next-themes"

export interface ProvidersProps {
	children: React.ReactNode
	themeProps?: ThemeProviderProps
}

export function Providers({ children, themeProps }: ProvidersProps) {
	// const router = useRouter()

	return (
		<NextUIProvider>
			{/* <NextUIProvider navigate={router.push}> */}
			<ThemeProvider {...themeProps}>{children}</ThemeProvider>
		</NextUIProvider>
	)
}
