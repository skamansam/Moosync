<template>
  <div class="appContainer">
    <TopBar class="topbar" />
    <MusicBar class="musicbar" />
    <Sidebar class="sidebar" />
    <div class="d-flex main-content">
      <transition name="slide-fade">
        <router-view :key="refreshRouter"></router-view>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import MusicBar from '@/mainWindow/components/Musicbar.vue'
import Sidebar from '@/mainWindow/components/Sidebar.vue'
import TopBar from '@/mainWindow/components/TopBar.vue'
import { Component } from 'vue-property-decorator'
import { ipcRendererHolder } from '@/utils/ipc/renderer'
import { PreferenceEvents } from '@/utils/ipc/main/constants'
import PlaylistContextMenuMixin from '@/utils/mixins/PlaylistContextMenuMixin'
import { mixins } from 'vue-class-component'

@Component({
  components: {
    Sidebar,
    TopBar,
    MusicBar,
  },
})
export default class DefaultLayout extends mixins(PlaylistContextMenuMixin) {
  private refreshRouter: boolean = false
  mounted() {
    ipcRendererHolder.listen(PreferenceEvents.PREFERENCE_REFRESH, () => {
      this.refreshRouter = !this.refreshRouter
    })
  }
}
</script>

<style lang="sass" scoped>

.musicbar
  position: fixed
  z-index: -1

.sidebar
  position: relative
  z-index: -2

.topbar
  position: fixed
  z-index: -3

.main-content
  position: absolute
  left: calc(261px + 30px)
  top: calc(70px + 18px + 4px)
  right: 0
  bottom: calc(6rem + 30px)
  height: calc(100% - (6rem + 30px) - 70px)
  overflow-y: scroll
  overflow-x: hidden
  z-index: -4
</style>

<style lang="sass">
.slide-fade-enter-active
  transition: all .3s ease

.slide-fade-leave-active
  transition: all .2s ease
.slide-fade-enter, .slide-fade-leave-to
  transform: translateY(100px)
  opacity: 0

*::-webkit-scrollbar,
*::-webkit-scrollbar-thumb
  width: 26px
  border-radius: 13px
  background-clip: padding-box
  border: 10px solid transparent

*::-webkit-scrollbar-thumb
  box-shadow: inset 0 0 0 10px

*::-webkit-scrollbar-track
  margin-top: calc( 0.75rem * 2 + 18px)
  background: var(--primary)
</style>
