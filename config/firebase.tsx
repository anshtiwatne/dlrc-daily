'use client'

import { getAuth } from 'firebase/auth'
import { getAnalytics } from 'firebase/analytics'
import { getPerformance } from 'firebase/performance'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import {
	FirebaseAppProvider,
	AuthProvider,
	FirestoreProvider,
	useFirebaseApp,
	StorageProvider,
} from 'reactfire'

const firebaseConfig = {
	apiKey: 'AIzaSyCO145OUsjafOByFoghuIQdY1HamdYuO0s',
	authDomain: 'daily.dlrc.in',
	projectId: 'dlrc-daily',
	storageBucket: 'dlrc-daily.appspot.com',
	messagingSenderId: '235007567187',
	appId: '1:235007567187:web:91c604b6d82632c036ada6',
	measurementId: 'G-Y8SV4T6C2B',
}

export function FirebaseComponents({
	children,
}: {
	children: React.ReactNode
}) {
	const app = useFirebaseApp()
	const auth = getAuth(app)
	const db = getFirestore(app)
	const storage = getStorage(app)

	if (typeof window !== 'undefined') {
		getAnalytics(app)
		getPerformance(app)
	}

	return (
		<AuthProvider sdk={auth}>
			<FirestoreProvider sdk={db}>
				<StorageProvider sdk={storage}>{children}</StorageProvider>
			</FirestoreProvider>
		</AuthProvider>
	)
}

export function FirebaseContextProvider({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<FirebaseAppProvider firebaseConfig={firebaseConfig}>
			<FirebaseComponents>{children}</FirebaseComponents>
		</FirebaseAppProvider>
	)
}
