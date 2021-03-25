<template>
  <b-sidebar width="261px" visible id="sidebar" no-header-close no-close-on-route-change sidebar-class="gradient">
    <template #header>
      <div class="d-flex w-100 mt-3 justify-content-between">
        <Toggle />
        <Rooms id="rooms" />
        <b-popover
          :target="`rooms`"
          placement="rightbottom"
          title="Rooms"
          triggers="focus"
          :content="`Placement hello`"
        >
          <div>
            <b-tabs content-class="mt-3">
              <b-tab title="Join" active>
                <b-form-input
                  ref="roomid"
                  :formatter="formatter"
                  class="inputtext"
                  placeholder="Enter room ID"
                  aria-label="room id"
                />
                <button v-on:click="joinRoom()">Join room</button>
                <h3>{{ roomID }}</h3>
              </b-tab>
              <b-tab title="Create">
                <button v-on:click="createRoom()">Create Room</button>
                <h3>{{ roomID }}</h3>
              </b-tab>
            </b-tabs>
            <div></div>
          </div>
        </b-popover>
      </div>
    </template>
    <template #default
      ><div class="extra-margin-top"><Tabs /></div>
    </template>
    <template #footer>
      <div class="footer">
        <Gears @click.native="openSettings" />
      </div>
    </template>
  </b-sidebar>
</template>

<script lang="ts">
import Rooms from '@/mainWindow/components/icons/Rooms.vue'
import Toggle from '@/mainWindow/components/icons/Toggle.vue'
import Tabs from '@/mainWindow/components/sidebar/Tabs.vue'
import Gears from '@/mainWindow/components/icons/Gears.vue'
import { PeerMode, SyncModule } from '@/mainWindow/store/syncState'
import { Component, Ref } from 'vue-property-decorator'
import Colors from '@/utils/mixins/Colors'
import { mixins } from 'vue-class-component'

@Component({
  components: {
    Toggle,
    Rooms,
    Tabs,
    Gears,
  },
})
export default class Sidebar extends mixins(Colors) {
  @Ref('roomid')
  private roomInput!: HTMLInputElement

  get roomID() {
    return SyncModule.roomID
  }

  public formatter(value: string) {
    return value.toUpperCase()
  }

  private setWatcher() {
    SyncModule.setMode(PeerMode.WATCHER)
  }

  private setBroadcaster() {
    SyncModule.setMode(PeerMode.BROADCASTER)
  }

  private joinRoom() {
    this.$root.$emit('join-room', this.roomInput.value)
  }

  private createRoom() {
    this.$root.$emit('create-room')
  }

  private openSettings() {
    window.WindowUtils.openPreferenceWindow()
  }
}
</script>

<style lang="sass">
.gradient
  background: linear-gradient(176.27deg, var(--secondary) 1.69%, var(--primary) 72.01%)
  border-radius: 0px 30px 0px 0px
  top: 32px !important

.b-sidebar-body
  &::-webkit-scrollbar-track
    margin-top: 0
    background: transparent !important
</style>

<style lang="sass" scoped>

.sidebar
  position: absolute

.sidebar-item
  font-family: 'Proxima Nova'

.icon-spacing
  margin-right: 26px
  padding-left: 6px

.extra-margin-top
  margin-top: 1rem

.footer
  margin-bottom: calc(6.5rem + 32px)
</style>
