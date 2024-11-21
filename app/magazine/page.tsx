import ErrMsg from "@/components/error-msg"

export default function Page() {
	return (
		<ErrMsg
			buttons={[
				{
					text: "Home",
					icon: "home",
					href: "/",
				},
			]}
			text="Work in progress 🚧"
		/>
	)
}
