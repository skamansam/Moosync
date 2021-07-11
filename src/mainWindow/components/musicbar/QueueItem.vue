<template>
  <b-container fluid class="item-container" @contextmenu="getItemContextMenu">
    <b-row class="item-row">
      <b-col cols="auto" class="img-container h-100 d-flex justify-content-start">
        <b-img class="h-100 image" v-if="!forceEmptyImg" :src="getImgSrc(getValidImage(song))" />
        <SongDefault v-else class="h-100" />
        <div @click="playSong" class="play-button d-flex justify-content-center">
          <Play2 class="align-self-center" />
        </div>
      </b-col>
      <b-col xl="10" lg="8" sm="7" cols="7">
        <div class="d-flex">
          <div class="text-left song-title text-truncate">{{ song.title }}</div>
          <YoutubeIcon
            v-if="song.type === 'YOUTUBE'"
            :color="'#E62017'"
            :filled="true"
            :dropShadow="true"
            class="provider-icon"
          />
          <SpotifyIcon
            v-if="song.type === 'SPOTIFY'"
            :color="'#1ED760'"
            :filled="true"
            :dropShadow="true"
            class="provider-icon"
          />
        </div>

        <div class="text-left song-subtitle text-truncate">
          {{ song.artists.join(', ') }}
          {{ song.artists.length > 0 && song.album && song.album.album_name ? ' - ' : '' }}
          {{ song.album && song.album.album_name }}
        </div>
      </b-col>
      <b-col cols="auto" class="text-right ml-auto d-flex align-items-center">
        <div class="ml-auto remove-button" @click="removeSong">Remove</div>
      </b-col>
    </b-row>
    <!-- <div class="divider" /> -->
  </b-container>
</template>

<script lang="ts">
import Colors from '@/utils/ui/mixins/Colors'
import { mixins } from 'vue-class-component'
import { Component, Prop } from 'vue-property-decorator'
import SongDefault from '@/mainWindow/components/icons/SongDefault.vue'
import { vxm } from '@/mainWindow/store'
import ImgLoader from '@/utils/ui/mixins/ImageLoader'
import Play2 from '@/mainWindow/components/icons/Play2.vue'
import PlayerControls from '@/utils/ui/mixins/PlayerControls'
import YoutubeIcon from '@/mainWindow/components/icons/Youtube.vue'
import SpotifyIcon from '@/mainWindow/components/icons/Spotify.vue'
import ContextMenuMixin from '@/utils/ui/mixins/ContextMenuMixin'

@Component({
  components: {
    SongDefault,
    Play2,
    YoutubeIcon,
    SpotifyIcon
  }
})
export default class MusicInfo extends mixins(Colors, ImgLoader, PlayerControls, ContextMenuMixin) {
  @Prop({ default: () => {} })
  private songID!: string

  @Prop({ default: false })
  private current!: boolean

  @Prop({ default: -1 })
  private index!: number

  get song() {
    return vxm.player.queue.data[this.songID]
  }

  private playSong() {
    this.playFromQueue(this.index)
  }

  private removeSong() {
    this.removeFromQueue(this.index)
  }

  private getItemContextMenu(event: Event) {
    this.getContextMenu(event, {
      type: 'QUEUE_ITEM',
      args: {
        isRemote: this.song.type === 'YOUTUBE' || this.song.type === 'SPOTIFY',
        song: this.song,
        refreshCallback: () => this.removeSong()
      }
    })
  }

  private forceEmptyImg: boolean = false
}
</script>

<style lang="sass" scoped>
.item-container
  position: relative
  height: 87px

.image
  object-fit: cover
  width: 55px
  height: 55px
  border-radius: 10px

.song-title
  font-weight: 600
  font-size: 16px
  min-width: 0

.song-subtitle
  font-weight: 250
  font-size: 14px
  min-width: 0

.item-row
  height: 80px

.divider
  margin-top: 8px
  border-bottom: 1px solid var(--divider) !important
  width: 100%

.remove-button
  font-size: 14px
  color: var(--accent)
  cursor: pointer
  padding: 10px

.play-button
  width: calc(80px - (12px * 2))
  height: calc(80px - (12px * 2))
  background: rgba(0, 0, 0, 0.6)
  position: absolute
  border-radius: 10px
  opacity: 0
  transition: opacity 0.2s ease
  &:hover
    opacity: 1

.provider-icon
  align-self: center
  margin-left: 10px

.img-container
  min-width: calc(56px + 12px)

.text-content
  min-width: 0%
</style>
