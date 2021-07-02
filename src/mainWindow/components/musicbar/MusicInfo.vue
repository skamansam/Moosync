<template>
  <b-container class="d-flex w-100 h-100 musicinfo-container">
    <b-row align-h="around" class="d-flex w-100">
      <b-col cols="7" align-self="center" class="no-gutters w-100">
        <div class="h-100">
          <b-img class="albumart w-100" v-if="getImgSrc(imgSrc)" :src="getImgSrc(imgSrc)" />
          <SongDefault class="albumart w-100" v-if="!getImgSrc(imgSrc)" />
        </div>
      </b-col>
      <b-col cols="5" align-self="center" class="queue-container d-flex no-gutters h-100">
        <div>
          <RecycleScroller class="scroller" :items="queueOrder" :item-size="82" key-field="_id" :direction="'vertical'">
            <template v-slot="{ item, index }">
              <SingleSearchResult
                :set="(song = getQueueItem(item))"
                :first="index == 0"
                :title="song.title"
                :subtitle="getArtists(song)"
                :coverImg="getImg(song)"
                :divider="index != queueOrder.length - 1"
                :id="item"
                :showButtons="true"
              />
            </template>
          </RecycleScroller>
        </div>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import Colors from '@/utils/ui/mixins/Colors'
import { mixins } from 'vue-class-component'
import { Component, Prop, Watch } from 'vue-property-decorator'
import SongDefault from '@/mainWindow/components/icons/SongDefault.vue'
import ImageLoader from '@/utils/ui/mixins/ImageLoader'
import SingleSearchResult from '@/mainWindow/components/generic/SingleSearchResult.vue'
import ModelHelper from '@/utils/ui/mixins/ModelHelper'
import { vxm } from '@/mainWindow/store'

@Component({
  components: {
    SongDefault,
    SingleSearchResult
  }
})
export default class MusicInfo extends mixins(Colors, ImageLoader, ModelHelper) {
  get queueOrder() {
    return vxm.player.queue.order
  }

  private getQueueItem(id: string) {
    return vxm.player.queue.data[id]
  }

  @Prop({ default: '' })
  private imgSrc!: string

  private forceEmptyImg: boolean = false

  @Watch('imgSrc') onImgSrcChange() {
    this.forceEmptyImg = false
  }
}
</script>

<style lang="sass" scoped>
.albumart
  border-radius: 28px
  max-width: min(600px, calc(100vh - 7.5rem - 1rem - 30px))
  max-height: calc(100vh - 7.5rem - 1rem - 30px)
  -webkit-user-select: none
  user-select: none

.musicinfo-container
  max-width: 100% !important
  max-height: calc(100%)

.queue-container
  max-height: calc(100vh - 7.5rem - 1rem - 30px)
  padding-right: 30px
  div
    width: 100% !important

.scroller
  height: 100%
  &::-webkit-scrollbar-track
    margin: 0
</style>

function Prop(arg0: { default: string }) { throw new Error('Function not implemented.') } function Watch(arg0: string) {
throw new Error('Function not implemented.') }
