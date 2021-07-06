interface NotificationObject {
  id: string
  type: 'info' | 'error'
  message: string
}

interface NotificationEvents {
  gotNotif: (notif: NotificationObject) => void
}