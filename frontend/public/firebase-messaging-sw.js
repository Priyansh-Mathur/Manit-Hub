/* global importScripts, firebase, clients */
// FCM background-message service worker.
// The Firebase config is passed in via the registration query string
// (see src/lib/push.js) so no keys are hard-coded here.
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

const params = new URLSearchParams(self.location.search);
const config = JSON.parse(params.get("config") || "{}");

if (config.apiKey) {
  firebase.initializeApp(config);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || "Manit Hub";
    const body = payload.notification?.body || "";
    self.registration.showNotification(title, {
      body,
      icon: "/vite.svg",
      data: { url: payload.data?.url || "/notifications" },
    });
  });

  self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const url = event.notification.data?.url || "/notifications";
    event.waitUntil(
      clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
        for (const client of list) {
          if ("focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        return clients.openWindow(url);
      })
    );
  });
}
