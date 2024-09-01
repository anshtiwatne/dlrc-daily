'use client'

import { Tab, Tabs } from '@nextui-org/react'

import { DailyPublish, MagazinePublish } from '@/components/publish-form'

export default function Page() {
	return (
		<div className="flex h-full w-full flex-col p-4">
			<Tabs
				fullWidth
				classNames={{
					panel: 'h-full w-full m-0 p-0',
				}}
			>
				<Tab className="h-full w-full" title="DLRC Daily">
					<DailyPublish />
				</Tab>
				<Tab isDisabled className="h-full w-full" title="Magazine">
					<MagazinePublish />
				</Tab>
			</Tabs>
		</div>
	)
}
