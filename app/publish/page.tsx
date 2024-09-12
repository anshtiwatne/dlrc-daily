'use client'

import { Tab, Tabs } from '@nextui-org/react'

import { DailyPublish } from '@/components/daily-publish'
import { MagazinePublish } from '@/components/magazine-publish'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function Page() {
	const searchParams = useSearchParams()
	const [publishType, setPublishType] = useState<any>(
		searchParams.get('type') ? searchParams.get('type') : 'daily',
	)

	return (
		<div className="flex h-full w-full flex-grow flex-col p-4">
			<Tabs
				fullWidth
				classNames={{
					panel: 'm-0 flex flex-grow flex-col p-0 pt-4',
				}}
				selectedKey={publishType}
				onSelectionChange={setPublishType}
			>
				<Tab key="daily" title="DLRC Daily">
					<DailyPublish />
				</Tab>
				<Tab key="magazine" title="Magazine">
					<MagazinePublish />
				</Tab>
			</Tabs>
		</div>
	)
}
