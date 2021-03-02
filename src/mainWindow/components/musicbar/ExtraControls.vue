<template>
  <b-container fluid class="d-flex flex-column h-100">
    <b-row class="flex-grow-1 align-items-center justify-content-sm-start justify-content-xl-end">
      <b-col cols="9" class="d-flex volume-container justify-content-end">
        <div class="slider-container d-flex">
          <input
            type="range"
            min="0"
            max="100"
            value="50"
            class="slider w-100 align-self-center test"
            v-bind:style="{
              background: ComputedGradient,
            }"
            id="myRange"
            aria-label="volume"
            v-model="volume"
            v-on:input="emitVolume"
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
import { Component } from 'vue-property-decorator'
import VolumeIcon from '@/mainWindow/components/icons/Volume.vue'
import ExpandIcon from '@/mainWindow/components/icons/Expand.vue'
import Colors from '@/utils/mixins/Colors'
import { mixins } from 'vue-class-component'

@Component({
  components: {
    VolumeIcon,
    ExpandIcon,
  },
})
export default class MusicBar extends mixins(Colors) {
  // TODO: Load last used volume
  private volume: number = 50

  private emitVolume() {
    this.$emit('onVolumeChange', this.volume)
  }

  get ComputedGradient(): string {
    return `linear-gradient(90deg, ${this.rootColors['--accentPrimary']} 0%, ${this.rootColors['--accentPrimary']} ${this.volume}%, ${this.rootColors['--quaternary']} 0%)`
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
