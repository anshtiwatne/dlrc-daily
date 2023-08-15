// This is the "Offline page" service worker

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE = "pwabuilder-page";

const offlineFallbackPage = "offline.html";

self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});

self.addEventListener('install', async (event) => {
    event.waitUntil(
        caches.open(CACHE)
            .then((cache) => cache.add(offlineFallbackPage))
    );
});

if (workbox.navigationPreload.isSupported()) {
    workbox.navigationPreload.enable();
}

self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate') {
        event.respondWith((async () => {
            try {
                const preloadResp = await event.preloadResponse;

                if (preloadResp) {
                    return preloadResp;
                }

                const networkResp = await fetch(event.request);
                return networkResp;
            } catch (error) {

                const cache = await caches.open(CACHE);
                const cachedResp = await cache.match(offlineFallbackPage);
                return cachedResp;
            }
        })());
    }
});

// Firebase messaging service worker

importScripts("https://www.gstatic.com/firebasejs/10.1.0/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/10.1.0/firebase-messaging-compat.js")

const firebaseConfig = {
    apiKey: "AIzaSyCO145OUsjafOByFoghuIQdY1HamdYuO0s",
    authDomain: "dlrc-daily.firebaseapp.com",
    projectId: "dlrc-daily",
    storageBucket: "dlrc-daily.appspot.com",
    messagingSenderId: "235007567187",
    appId: "1:235007567187:web:91c604b6d82632c036ada6",
    measurementId: "G-Y8SV4T6C2B"
}

firebase.initializeApp(firebaseConfig)
const messaging = firebase.messaging()