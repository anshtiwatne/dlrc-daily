import type { Config } from 'tailwindcss'

import { nextui } from '@nextui-org/theme'

const config: Config = {
	content: [
		'./components/**/*.{js,ts,jsx,tsx,mdx}',
		'./app/**/*.{js,ts,jsx,tsx,mdx}',
		'./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ['var(--font-sans)'],
				mono: ['var(--font-geist-mono)'],
			},
		},
	},
	darkMode: 'class',
	plugins: [nextui()],
}

export default config
