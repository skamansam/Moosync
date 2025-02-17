<!-- 
  Details.vue is a part of Moosync.
  
  Copyright 2021-2022 by Sahil Gupte <sahilsachingupte@gmail.com>. All rights reserved.
  Licensed under the GNU General Public License. 
  
  See LICENSE in the project root for license information.
-->

<template>
  <b-row no-gutters class="w-100" align-v="center">
    <b-col cols="auto">
      <b-img
        fluid
        ref="cover"
        class="coverimg"
        v-if="imgSrc && !forceEmptyImg"
        :src="imgSrc"
        alt="cover art"
        @error="handlerImageError(arguments[0], handleError)"
        @dragstart="dragFile"
      />
      <SongDefault v-else class="coverimg" />
    </b-col>
    <b-col class="text-truncate">
      <div id="musicbar-title" :title="title" class="text song-title w-100 text-truncate" @click="onTitleClick">
        {{ title }}
      </div>
      <div class="d-flex">
        <div
          v-for="(artist, index) of artists"
          :key="index"
          :title="artist.artist_name"
          class="text song-subtitle text-truncate"
          :class="index !== 0 ? 'ml-1' : ''"
          @click="onSubtitleClick(artist)"
        >
          {{ artist.artist_name }}{{ index !== artists.length - 1 ? ',' : '' }}
        </div>
      </div>

      <b-popover
        id="clipboard-popover"
        :show.sync="showPopover"
        target="musicbar-title"
        triggers="click blur"
        placement="top"
      >
        Copied!
      </b-popover>
    </b-col>
  </b-row>
</template>

<script lang="ts">
import { mixins } from 'vue-class-component'
import { Component, Prop, Watch } from 'vue-property-decorator'
import SongDefault from '@/icons/SongDefaultIcon.vue'
import ImageLoader from '@/utils/ui/mixins/ImageLoader'
import ErrorHandler from '@/utils/ui/mixins/errorHandler'
import Timestamp from '@/mainWindow/components/musicbar/components/Timestamp.vue'
import FileMixin from '@/utils/ui/mixins/FileMixin'
import RouterPushes from '@/utils/ui/mixins/RouterPushes'

@Component({
  components: {
    SongDefault,
    Timestamp
  }
})
export default class MusicBar extends mixins(ImageLoader, ErrorHandler, FileMixin, RouterPushes) {
  @Prop({ default: '-' })
  title!: string

  @Prop({ default: () => [] })
  artists!: Artists[]

  @Prop({ default: '' })
  private imgSrc!: string

  private showPopover = false

  private forceEmptyImg = false

  private onTitleClick() {
    let str = this.artists.map((val) => val.artist_name).join(', ')
    if (str) {
      str += ' - '
    }
    str += this.title
    navigator.clipboard.writeText(str)
    this.showPopover = true
    setTimeout(() => (this.showPopover = false), 1500)
  }

  private async onSubtitleClick(artist: Artists) {
    this.gotoArtist(artist)
  }

  private handleError() {
    this.forceEmptyImg = true
  }

  @Watch('imgSrc') onImgSrcChange() {
    this.forceEmptyImg = false
  }
}
</script>

<style lang="sass" scoped>
.coverimg
  height: 56px
  width: 56px
  min-width: 56px
  margin-right: 15px
  border-radius: 10px
  object-fit: cover

.text
  text-align: left
  font-weight: normal
  line-height: 170.19%

.song-title
  cursor: pointer
  font-size: 19.1549px
  width: fit-content

.song-subtitle
  font-size: 14.2592px
  color: var(--textSecondary)
  width: fit-content
  cursor: pointer
  text-decoration: none
  &:hover
    text-decoration: underline
</style>
