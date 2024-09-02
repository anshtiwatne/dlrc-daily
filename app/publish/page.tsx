'use client'

import { Tab, Tabs } from '@nextui-org/react'

import { DailyPublish, MagazinePublish } from '@/components/publish-form'

export default function Page() {
	return (
		<div className="flex h-full w-full flex-grow flex-col p-4">
			<Tabs
				fullWidth
				classNames={{
					panel: 'm-0 flex flex-grow flex-col p-0',
				}}
			>
				<Tab title="DLRC Daily">
					<DailyPublish />
				</Tab>
				<Tab isDisabled title="Magazine">
					<MagazinePublish />
				</Tab>
			</Tabs>
		</div>
	)
}
