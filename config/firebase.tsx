'use client'

import { getAuth } from 'firebase/auth'
import { getAnalytics } from 'firebase/analytics'
import { getPerformance } from 'firebase/performance'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getMessaging, getToken } from 'firebase/messaging'
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
	const messaging = getMessaging()

	if (typeof window !== 'undefined') {
		getAnalytics(app)
		getPerformance(app)
	}

	getToken(messaging, {
		vapidKey:
			'BL1R4Annaua2hasnfjxlLFYoZIn6NaoM45RfddzZxsjby1SQEa-l3mMapA4__Q5zFa5YYvgdPi3NT6tZtUOicxE',
	})
	// .then((currentToken: any) => {
	// 	if (currentToken) {
	// 		console.log('Current token for client: ', currentToken)
	// 	} else {
	// 		console.log(
	// 			'No registration token available. Request permission to generate one.',
	// 		)
	// 	}
	// })
	// .catch((err: any) => {
	// 	console.log('An error occurred while retrieving token. ', err)
	// })

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
