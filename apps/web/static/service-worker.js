self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(self.registration.showNotification(data.title ?? 'Black Diamond', { body: data.body ?? '', icon: '/apple-touch-icon.png', data: { url: data.url ?? '/' } }));
});
self.addEventListener('notificationclick', (event) => { event.notification.close(); event.waitUntil(clients.openWindow(event.notification.data.url)); });
