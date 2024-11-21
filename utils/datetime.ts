export function timeAgo(date: Date | number, short = true) {
	const now = new Date()
	const diff = Number(now) - Number(date)
	const minute = 60 * 1000
	const hour = 60 * minute
	const day = 24 * hour
	const week = 7 * day
	const month = 30 * day
	const year = 365 * day

	if (diff < minute) {
		return "now"
	} else if (diff < hour) {
		const minutes = Math.floor(diff / minute)

		return short ? `${minutes}min` : `${minutes} min ago`
	} else if (diff < day) {
		const hours = Math.floor(diff / hour)

		return short ? `${hours}h` : `${hours} hour${hours > 1 ? "s" : ""} ago`
	} else if (diff < week) {
		const days = Math.floor(diff / day)

		return short ? `${days}d` : `${days} day${days > 1 ? "s" : ""} ago`
	} else if (diff < month) {
		const weeks = Math.floor(diff / week)

		return short ? `${weeks}w` : `${weeks} week${weeks > 1 ? "s" : ""} ago`
	} else if (diff < year) {
		const months = Math.floor(diff / month)

		return short
			? `${months}mo`
			: `${months} month${months > 1 ? "s" : ""} ago`
	} else {
		const years = Math.floor(diff / year)

		return short ? `${years}y` : `${years} year${years > 1 ? "s" : ""} ago`
	}
}

export function getMillis(timestamp: Date | { seconds: number }) {
	if (timestamp instanceof Date) {
		return timestamp.getTime()
	} else if (timestamp.seconds) {
		return timestamp.seconds * 1000
	} else {
		throw new Error("Invalid timestamp")
	}
}
