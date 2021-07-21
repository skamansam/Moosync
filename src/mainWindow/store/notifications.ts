import { VuexModule } from './module'
import { mutation } from 'vuex-class-component'

export class NotifierStore extends VuexModule.With({ namespaced: 'notification' }) {
  private notificationStore: NotificationObject[] = []

  get notifications() {
    return this.notificationStore
  }

  @mutation
  public emit(notif: NotificationObject) {
    const index = this.notificationStore.findIndex((value) => value.id === notif.id)
    if (index !== -1) {
      this.notificationStore.splice(index, 1)
    }
    this.notificationStore.push(notif)
  }
}
