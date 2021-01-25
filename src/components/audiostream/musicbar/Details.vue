/* eslint-disable no-unused-vars */
<template>
  <b-container fluid class="d-flex flex-column h-100">
    <b-row class="flex-grow-1 align-items-center">
      <b-col cols="2" class="d-flex justify-content-center">
        <img ref="cover" :src="'data:image/png;base64, ' + this.cover" class="coverimg" alt="cover img" />
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
// eslint-disable-next-line no-unused-vars

import Vue from 'vue'
import { Component, Prop, Ref } from 'vue-property-decorator'

@Component({})
export default class MusicBar extends Vue {
  @Prop({ default: '-' })
  title!: string

  @Prop({ default: () => [] })
  artists!: string[]

  @Prop({ default: '' })
  cover!: string

  @Ref('cover')
  private imageElement!: HTMLImageElement
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
  color: $text-primary

.song-subtitle
  font-size: 12.2592px
  color: $text-secondary
</style>
