<template>
  <b-row align-v="center" class="justify-content-center">
    <b-col cols="auto" class="timestamp">{{ formattedDuration(timestamp) }} / {{ formattedDuration(duration) }}</b-col>
    <b-col cols="auto" v-on:click="prevSong()">
      <LastTrack />
    </b-col>
    <b-col cols="auto" v-on:click="toggleRepeat()">
      <Repeat />
    </b-col>
    <b-col cols="auto" v-if="loading">
      <b-spinner label="Loading..."></b-spinner>
    </b-col>
    <b-col cols="auto" v-if="!loading" v-on:click="togglePlayerState()">
      <Play :play="playing" />
    </b-col>
    <b-col cols="auto" v-on:click="nextSong()">
      <NextTrack />
    </b-col>
    <b-col cols="auto" v-on:click="shuffle()">
      <Shuffle />
    </b-col>
    <!-- <b-col cols="2" class="d-none d-xl-block"></b-col> -->
  </b-row>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator'
import LastTrack from '@/mainWindow/components/icons/LastTrack.vue'
import NextTrack from '@/mainWindow/components/icons/NextTrack.vue'
import Play from '@/mainWindow/components/icons/Play.vue'
import Repeat from '@/mainWindow/components/icons/Repeat.vue'
import Shuffle from '@/mainWindow/components/icons/Shuffle.vue'
import { mixins } from 'vue-class-component'
import PlayerControls from '@/utils/ui/mixins/PlayerControls'
import { vxm } from '@/mainWindow/store'
import { convertDuration } from '@/utils/common'

@Component({
  components: {
    LastTrack,
    NextTrack,
    Play,
    Repeat,
    Shuffle
  }
})
export default class MusicBar extends mixins(PlayerControls) {
  @Prop({ default: 0 })
  private duration!: number

  @Prop({ default: 0 })
  private timestamp!: number

  @Prop({ default: true })
  private playing!: boolean

  @Prop({ default: false })
  private loading!: boolean

  get repeat() {
    return vxm.player.Repeat
  }

  private formattedDuration = convertDuration

  private toggleRepeat() {
    vxm.player.repeat = !this.repeat
  }
}
</script>

<style lang="sass" scoped>
@import '@/sass/variables.sass'

.timestamp
  color: var(--textSecondary)
  font-style: normal
  font-weight: normal
  font-size: 18px
  line-height: 170.19%
  overflow: hidden
  width: 150px

.invisible
  min-width: 0%
</style>
