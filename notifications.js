// ========================================
// Firebase Push Notification - notifications.js
// Smart Study for Toppers Physics Class 12
// ========================================

const firebaseConfig = {
  apiKey: "AIzaSyBxH4lGkVHXQGnVSWy1TDr",
  authDomain: "smart-study-for-toppers.firebaseapp.com",
  projectId: "smart-study-for-toppers",
  storageBucket: "smart-study-for-toppers.appspot.com",
  messagingSenderId: "797534179941",
  appId: "1:797534179941:web:9764abba7"
};

const VAPID_KEY = "BDCh5x6LJNlxHzAjO-CrsGQ5vaJT6HktVNAHyRkqT1FTHjB9hR-7E4TMs3HXWnW4OXHvTlkRdOO4isgfBVJ2Rv8";

// Firebase load hone ka wait karo
window.addEventListener('load', async () => {
  try {
    // Firebase initialize
    const app = firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    // Service Worker register karo
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.register('/smart-study-for-toppers-physics-12/firebase-messaging-sw.js');
      console.log('Service Worker registered:', reg);

      // Permission maango
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted!');

        // Token lo
        const token = await messaging.getToken({ 
          vapidKey: VAPID_KEY, 
          serviceWorkerRegistration: reg 
        });

        if (token) {
          console.log('FCM Token:', token);
          saveTokenToFirestore(token);
        }
      } else {
        console.log('Notification permission denied.');
      }
    }

    // Foreground notification
    messaging.onMessage((payload) => {
      console.log('Foreground message:', payload);
      const { title, body, icon } = payload.notification;
      if (Notification.permission === 'granted') {
        new Notification(title, { body, icon: icon || '/icon.png' });
      }
    });

  } catch (err) {
    console.error('Firebase notification error:', err);
  }
});

// Token ko Firestore mein save karo
async function saveTokenToFirestore(token) {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/smart-study-for-toppers/databases/(default)/documents/subscribers`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          token: { stringValue: token },
          createdAt: { stringValue: new Date().toISOString() },
          page: { stringValue: window.location.href }
        }
      })
    });
    console.log('Token saved to Firestore!');
  } catch (err) {
    console.error('Token save error:', err);
  }
}
