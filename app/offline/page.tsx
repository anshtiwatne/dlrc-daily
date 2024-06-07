'use client'

import { ErrMsg } from '@/components/error'

export default function Page() {
	return (
		<ErrMsg
			buttons={[
				{
					text: 'Refresh',
					href: '/',
					icon: 'refresh',
				},
			]}
			text="You seem to be offline 😴"
		/>
	)
}