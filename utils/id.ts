export function generateID(usedIDs: string[]) {
	const invalidIDs = usedIDs.concat([
		"TEST",
		"TEMP",
		"DEMO",
		"NULL",
		"VOID",
		"FAIL",
		"FAKE",
		"TRUE",
		"USER",
		"HELP",
	])
	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
	const generateRandomBase32 = () =>
		chars[Math.floor(Math.random() * chars.length)]

	let newID

	do {
		newID = Array.from({ length: 4 }, generateRandomBase32).join("")
	} while (invalidIDs.includes(newID))

	return newID
}
