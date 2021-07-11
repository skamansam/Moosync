<template>
  <b-container fluid class="item-container">
    <b-row class="item-row">
      <b-col cols="auto" class="img-container h-100 d-flex justify-content-start">
        <b-img class="h-100 image" v-if="!forceEmptyImg" :src="getImgSrc(getValidImage(song))" />
        <SongDefault v-else class="h-100" />
        <div class="play-button d-flex justify-content-center"><Play2 class="align-self-center" /></div>
      </b-col>
      <b-col cols="auto">
        <div class="text-left song-title">{{ song.title }}</div>
        <div class="text-left song-subtitle">{{ song.artists.join(', ') }}</div>
      </b-col>
      <b-col class="text-right mr-4 d-flex align-items-center">
        <div class="ml-auto remove-button">Remove</div>
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

@Component({
  components: {
    SongDefault,
    Play2
  }
})
export default class MusicInfo extends mixins(Colors, ImgLoader) {
  @Prop({ default: () => {} })
  private songID!: string

  @Prop({ default: false })
  private current!: boolean

  get song() {
    console.log()
    return vxm.player.queue.data[this.songID]
  }

  private forceEmptyImg: boolean = false
}
</script>

<style lang="sass" scoped>
.item-container
  position: relative
  height: 87px

.image
  border-radius: 10px

.song-title
  font-weight: 600
  font-size: 16px

.song-subtitle
  font-weight: 300
  font-size: 14px

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
</style>
