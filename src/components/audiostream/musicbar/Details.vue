<template>
  <b-container fluid class="d-flex flex-column h-100">
    <b-row class="flex-grow-1 align-items-center">
      <b-col cols="2" class="d-flex justify-content-center">
        <img ref="cover" class="coverimg" alt="cover img" :src="'media://' + cover" />
      </b-col>
      <b-col cols="10">
        <div class="text song-title text-truncate">{{ title }}</div>
        <div class="text song-subtitle text-truncate">
          {{ artists ? artists.join(', ') : '-' }}
        </div>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Ref, Watch } from 'vue-property-decorator'

@Component({})
export default class MusicBar extends Vue {
  @Prop({ default: '-' })
  title!: string

  @Prop({ default: () => [] })
  artists!: string[]

  @Prop({ default: null })
  cover!: Buffer | null

  @Prop({ default: null })
  private coverBlob!: Blob | null

  @Ref('cover')
  private imageElement!: HTMLImageElement

  @Watch('coverBlob') onBlobChanged() {
    if (this.coverBlob) {
      this.imageElement.src = URL.createObjectURL(this.coverBlob)
    }
  }
}
</script>

<style lang="sass" scoped>
@import '@/sass/variables.sass'

.coverimg
  height: 56px
  width: 56px

.text
  text-align: left
  font-family: 'Proxima Nova'
  font-style: normal
  font-weight: normal
  line-height: 170.19%

.song-title
  font-size: 19.1549px
  color:  var(--textPrimary)

.song-subtitle
  font-size: 12.2592px
  color:  var(--textSecondary)
</style>
