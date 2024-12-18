importScripts(
	"https://www.gstatic.com/firebasejs/10.1.0/firebase-app-compat.js",
)
importScripts(
	"https://www.gstatic.com/firebasejs/10.1.0/firebase-messaging-compat.js",
)

const firebaseConfig = {
	apiKey: "AIzaSyCO145OUsjafOByFoghuIQdY1HamdYuO0s",
	authDomain: "dlrc-daily.firebaseapp.com",
	projectId: "dlrc-daily",
	storageBucket: "dlrc-daily.appspot.com",
	messagingSenderId: "235007567187",
	appId: "1:235007567187:web:91c604b6d82632c036ada6",
	measurementId: "G-Y8SV4T6C2B",
}

firebase.initializeApp(firebaseConfig)

if ("serviceWorker" in navigator) {
	navigator.serviceWorker
		.register("./firebase-messaging-sw.js")
		.then(function (registration) {
			console.log(
				"Registration successful, scope is:",
				registration.scope,
			)
		})
		.catch(function (err) {
			console.log("Service worker registration failed, error:", err)
		})
}

const messaging = firebase.messaging()
