<template>
  <div class="d-flex flex-column">
    <div
      v-for="(item, i) in componentNames"
      v-bind:key="item.component"
      class="d-flex button-bar"
      v-on:click="setActive(i)"
      v-bind:class="{ 'button-active': active == i }"
    >
      <div class="whitebar" v-if="active == i"></div>
      <div
        class="d-flex align-items-center icon-padding"
        v-bind:class="{ 'icon-active': active == i, 'icon-transition': active != i }"
      >
        <component v-bind:is="item.component"></component>
        <div class="text-padding text-format">{{ item.title }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { ActiveTab } from '@/services/ui/enums'
import Playlists from './Playlists.vue'
import AllSongs from './AllSongs.vue'
import Artists from './Artists.vue'
import Fav from './Fav.vue'
import Genre from './Genre.vue'
import Albums from './Albums.vue'
import Toggle from './Toggle.vue'
import Rooms from './Rooms.vue'

@Component({
  components: {
    Playlists,
    AllSongs,
    Artists,
    Fav,
    Genre,
    Albums,
    Toggle,
    Rooms,
  },
})
export default class Sidebar extends Vue {
  private componentNames = [
    { component: 'AllSongs', title: 'All Songs' },
    { component: 'Playlists', title: 'Playlists' },
    { component: 'Albums', title: 'Albums' },
    { component: 'Artists', title: 'Artists' },
    { component: 'Genre', title: 'Genre' },
    { component: 'Fav', title: 'Favourites' },
  ]

  private active: ActiveTab = ActiveTab.ALLSONGS

  private setActive(i: number): void {
    console.log(i)
    this.active = i
  }
}
</script>

<style lang="sass" scoped>
@import "@/sass/variables.sass"

.icon-padding
  padding: 0.25rem 0rem 0.25rem 1.8rem

.icon-transition
  transition: 0.1s

.icon-transition:hover
  margin-left: 0.6rem

.text-padding
  padding-left: 2rem
  user-select: none

.text-format
  color: $text-primary
  font-family: 'Proxima Nova'

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
