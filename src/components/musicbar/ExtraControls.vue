<template>
  <b-container fluid class="d-flex flex-column h-100">
    <b-row class="flex-grow-1 align-items-center">
      <b-col cols="8" class="d-flex">
        <div class="slider-container">
          <input
            type="range"
            min="1"
            max="100"
            value="50"
            class="slider w-100 ml-auto"
            v-bind:style="{
              background: ComputedGradient,
            }"
            id="myRange"
            aria-label="volume"
            v-model="volume"
          />
        </div>
        <div class="volume-icon">
          <VolumeIcon />
        </div>
      </b-col>
      <b-col cols="1" class="ml-auto expand-icon"> <ExpandIcon /> </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import VolumeIcon from './controls/Volume.vue'
import ExpandIcon from './controls/Expand.vue'
import exported from '@/sass/variables.sass'

@Component({
  components: {
    VolumeIcon,
    ExpandIcon,
  },
})
export default class MusicBar extends Vue {
  private volume: number = 69

  private setVolume(n: number) {
    console.log(n)
    this.volume = n
  }

  get ComputedGradient(): string {
    return (
      'linear-gradient(90deg, ' +
      exported.accentPrimary +
      ' 0%, ' +
      exported.accentPrimary +
      ' ' +
      this.volume +
      '%, ' +
      exported.quaternary +
      ' 0%)'
    )
  }
}
</script>

<style lang="sass" scoped>
@import '@/sass/variables.sass'

.slider-container
  width: 85%
  padding-left: 30px

.slider
  -webkit-appearance: none
  height: 2px
  outline: none

.slider::-webkit-slider-thumb
  -webkit-appearance: none
  appearance: none
  width: 18.39px
  height: 18.39px
  border-radius: 50%
  background: $accent-primary

.slider::-ms-fill-upper
  background-color: $primary

.volume-icon
  padding-left: 30px

.expand-icon
  margin-right: 28px
</style>
