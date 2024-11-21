"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Tab, Tabs } from "@nextui-org/react"

import DailyPublish from "@/components/daily-publish"
import MagazinePublish from "@/components/magazine-publish"

export default function Page() {
	const searchParams = useSearchParams()
	const [publishType, setPublishType] = useState(
		searchParams.get("type") ? searchParams.get("type") : "daily",
	)

	useEffect(() => {
		const promptIgnored = localStorage.getItem("publishPrompt") == "1"

		if (!promptIgnored) {
			localStorage.setItem("publishPrompt", "1")
		}
	}, [])

	return (
		<div className="flex h-full w-full flex-grow flex-col p-4">
			<Tabs
				fullWidth
				classNames={{
					panel: "m-0 flex flex-grow flex-col p-0 pt-4",
				}}
				selectedKey={publishType}
				onSelectionChange={(key) => setPublishType(key.toString())}
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
