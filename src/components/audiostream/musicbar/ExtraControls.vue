<template>
  <b-container fluid class="d-flex flex-column h-100">
    <b-row class="flex-grow-1 align-items-center justify-content-sm-start justify-content-xl-end">
      <b-col cols="9" class="d-flex volume-container justify-content-end">
        <div class="slider-container d-flex">
          <input
            type="range"
            min="1"
            max="100"
            value="50"
            class="slider w-100 align-self-center test"
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
      <b-col cols="2">
        <div class="expand-icon ml-auto"><ExpandIcon /></div
      ></b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import VolumeIcon from './controls/Volume.vue'
import ExpandIcon from './controls/Expand.vue'
import { ThemesModule } from '@/store/themeState'

@Component({
  components: {
    VolumeIcon,
    ExpandIcon,
  },
})
export default class MusicBar extends Vue {
  private volume: number = 69

  private setVolume(n: number) {
    this.volume = n
  }

  get rootColors() {
    return ThemesModule.rootVars
  }

  get ComputedGradient(): string {
    return (
      'linear-gradient(90deg, ' +
      this.rootColors.accentPrimary +
      ' 0%, ' +
      this.rootColors.accentPrimary +
      ' ' +
      this.volume +
      '%, ' +
      this.rootColors.quaternary +
      ' 0%)'
    )
  }
}
</script>

<style lang="sass" scoped>
@import '@/sass/variables.sass'

.slider-container
  padding-right: 20px

.slider
  -webkit-appearance: none
  height: 2px
  outline: none

.slider::-webkit-slider-thumb
  -webkit-appearance: none
  appearance: none
  width: 12px
  height: 12px
  border-radius: 50%
  background:  var(--accentPrimary)

.slider::-ms-fill-upper
  background-color:  var(--primary)

.volume-icon
  height: 22px
  width: 22px
  margin-top: -5px

.expand-icon
  height: 27px
  width: 18px

.test
  min-width: 0
</style>
