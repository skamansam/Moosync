<template>
  <div class="d-flex flex-column">
    <router-link
      v-for="item in componentNames"
      v-bind:key="item.component"
      :to="{ path: item.link }"
      custom
      v-slot="{ navigate, isActive }"
    >
      <div class="d-flex button-bar" v-on:click="navigate" v-bind:class="{ 'button-active': isActive }">
        <div class="whitebar" v-if="isActive"></div>
        <div
          class="d-flex align-items-center icon-transition icon-padding-open"
          v-bind:class="{
            'icon-active': isActive
          }"
        >
          <div class="icon">
            <component v-bind:is="item.component"></component>
          </div>
          <div class="text-padding text-format">{{ item.title }}</div>
        </div>
      </div>
    </router-link>
  </div>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator'
import { ActiveTab } from '@/utils/ui/enums'
import Playlists from '@/mainWindow/components/icons/Playlists.vue'
import AllSongs from '@/mainWindow/components/icons/AllSongs.vue'
import Artists from '@/mainWindow/components/icons/Artists.vue'
import Fav from '@/mainWindow/components/icons/Fav.vue'
import Genre from '@/mainWindow/components/icons/Genre.vue'
import Albums from '@/mainWindow/components/icons/Albums.vue'
import Toggle from '@/mainWindow/components/icons/Toggle.vue'
import Rooms from '@/mainWindow/components/icons/Rooms.vue'
import Colors from '@/utils/ui/mixins/Colors'
import { mixins } from 'vue-class-component'

@Component({
  components: {
    Playlists,
    AllSongs,
    Artists,
    Fav,
    Genre,
    Albums,
    Toggle,
    Rooms
  }
})
export default class Sidebar extends mixins(Colors) {
  private componentNames = [
    { component: 'AllSongs', title: 'Paths', link: '/paths' },
    { component: 'Playlists', title: 'Cache', link: '/cache' },
    { component: 'Albums', title: 'Interface', link: '/interface' },
    { component: 'Artists', title: 'System', link: '/system' }
  ]

  private active: ActiveTab = ActiveTab.ALLSONGS

  private setActive(i: number, navigate: Function): void {
    this.active = i
    navigate(this)
  }
}
</script>

<style lang="sass" scoped>

.icon
  width: 38px
  height: 38px

.icon-padding-open
  padding: 0.25rem 0rem 0.25rem 1.8rem

.icon-padding-closed
  padding: 0.5rem 0rem 0.25rem 1rem

.icon-transition
  transition: 0.1s

.icon-padding-open.icon-transition:hover
  margin-left: 0.6rem

.text-padding
  padding-left: 2rem
  user-select: none

.text-format
  color: var(--textPrimary) !important

.button-bar
  margin-top: 1.25rem
  vertical-align: middle

.whitebar
  width: 3px
  height: auto
  background: #FFFFFF

.button-active
  background: linear-gradient(270deg, rgba(55, 60, 66, 0) 0%, #373C42 100%)

.icon-active
  padding-left: calc(1.8rem - 3px)
</style>
