<template>
  <div>
    <div v-if="computedImg" class="dark-overlay"></div>
    <b-img class="bg-img" v-if="computedImg" :src="computedImg"></b-img>
    <b-container fluid class="w-100 h-100 main-container">
      <b-row no-gutters class="h-100">
        <b-col class="h-100" cols="4">
          <div class="image-container h-100">
            <b-img class="albumart w-100" v-if="computedImg" :src="computedImg" />
            <SongDefault class="albumart w-100" v-if="!computedImg" />
            <div v-if="currentSong" class="song-info-container">
              <div class="song-title">{{ currentSong.title }}</div>
              <div class="song-subtitle">{{ currentSong.artists ? currentSong.artists.join(', ') : 'Unknown' }}</div>
              <div class="song-timestamp">{{ formattedDuration(currentSong.duration) }}</div>
            </div>
          </div>
        </b-col>
        <b-col class="right-container h-100">
          <div class="h-100" v-if="queueOrder.length > 0">
            <b-row>
              <b-col cols="auto" class="d-flex">
                <div class="rounded-btn" @click="saveAsPlaylist">Save as playlist</div>
                <div class="rounded-btn" @click="clear">Clear</div>
              </b-col>
            </b-row>
            <b-row class="queue-container-outer">
              <b-col class="h-100 queue-container mr-4">
                <draggable
                  class="h-100"
                  v-model="queueOrder"
                  ghost-class="ghost"
                  @start="drag = true"
                  @end="drag = false"
                >
                  <transition-group name="flip-list">
                    <QueueItem
                      v-for="(element, index) in queueOrder"
                      :key="element.id"
                      :songID="element.songID"
                      :current="index === currentIndex"
                    />
                  </transition-group>
                </draggable>
              </b-col>
            </b-row>
          </div>
          <div v-else class="h-100 w-100 d-flex justify-content-center">
            <div class="align-self-center empty-message">Queue is empty...</div>
          </div>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts">
import Colors from '@/utils/ui/mixins/Colors'
import { mixins } from 'vue-class-component'
import { Component, Prop, Watch } from 'vue-property-decorator'
import SongDefault from '@/mainWindow/components/icons/SongDefault.vue'
import ImageLoader from '@/utils/ui/mixins/ImageLoader'
import ModelHelper from '@/utils/ui/mixins/ModelHelper'
import { vxm } from '@/mainWindow/store'
import { convertDuration } from '@/utils/common'
import QueueItem from './QueueItem.vue'
import draggable from 'vuedraggable'
import { bus } from '@/mainWindow/main'
import { EventBus } from '@/utils/main/ipc/constants'

@Component({
  components: {
    SongDefault,
    QueueItem,
    draggable
  }
})
export default class MusicInfo extends mixins(Colors, ImageLoader, ModelHelper) {
  get queueOrder() {
    return vxm.player.queueOrder
  }

  get currentIndex() {
    return vxm.player.queue.index
  }

  set queueOrder(value: { id: string; songID: string }[]) {
    vxm.player.queueOrder = value
  }

  get computedImg() {
    return this.getImgSrc(this.imgSrc)
  }

  private clear() {
    if (this.queueOrder.length > 0) {
      if (this.queueOrder.length === 1) {
        this.queueOrder = []
      } else {
        this.queueOrder = [this.queueOrder[0]]
      }
    }
  }

  private parseQueueItems(): Song[] {
    const songs = []
    for (const i of this.queueOrder) {
      songs.push(vxm.player.queue.data[i.songID])
    }
    return songs
  }

  private saveAsPlaylist() {
    bus.$emit(EventBus.SHOW_NEW_PLAYLIST_MODAL, this.parseQueueItems())
  }

  @Prop({ default: '' })
  private imgSrc!: string

  @Prop({ default: () => {} })
  private currentSong!: Song

  private forceEmptyImg: boolean = false

  @Watch('imgSrc') onImgSrcChange() {
    this.forceEmptyImg = false
  }

  private formattedDuration = convertDuration
}
</script>

<style lang="sass" scoped>
.albumart
  border-radius: 28px
  max-width: min(600px, calc(100vh - 7.5rem - 1rem - 30px))
  max-height: calc(100vh - 7.5rem - 1rem - 30px)
  -webkit-user-select: none
  user-select: none

.image-container
  max-height: 10%
  margin-left: 72px

.song-info-container
  text-align: left
  margin-top: 15px
  .song-title
    font-weight: bold
    font-size: 24px
  .song-subtitle
    font-weight: 250
    font-size: 18px
  .song-timestamp
    font-weight: 600
    font-size: 16px
.scroller
  height: 100%
  &::-webkit-scrollbar-track
    margin: 0

.main-container
  position: absolute
  left: 0
  top: 0
  padding-top: 72px
  padding-bottom: 30px

.queue-container
  overflow-y: scroll
  &::-webkit-scrollbar-track
    background: transparent
    margin: 0

.right-container
  margin-left: 5rem

.bg-img
  height: 100vh
  width: 100vw
  object-fit: cover
  filter: blur(10px)
  position: absolute
  top: 0
  left: 0
  z-index: -9999

.dark-overlay
  height: 100vh
  width: 100vw
  z-index: -9998
  position: absolute
  left: 0
  top: -26px
  background: rgba(0,0,0,.75)


.flip-list-move
  transition: transform 0.3s

.ghost
  opacity: 0.3

.rounded-btn
  background: var(--primary)
  border-radius: 17px
  padding: 8px 17px 8px 17px
  margin-right: 17px

.queue-container-outer
  height: 95%

.empty-message
  margin-left: -30px
  font-size: 36px
</style>
