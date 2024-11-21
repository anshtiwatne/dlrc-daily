"use client"

import ErrMsg from "@/components/error-msg"

export default function Error() {
	return (
		<ErrMsg
			buttons={[
				{
					text: "Home",
					href: "/",
					icon: "home",
				},
			]}
			text="404 | Page not found 🧐"
		/>
	)
}
