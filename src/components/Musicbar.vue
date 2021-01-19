<template>
  <div class="background w-100">
    <div class="timeline w-100"></div>
    <b-container fluid class="d-flex flex-column h-100">
      <b-row class="flex-grow-1">
        <b-col cols="3"><Details /></b-col>
        <b-col cols="5"><Controls /></b-col>
        <b-col><ExtraControls /></b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Details from './musicbar/Details.vue'
import Controls from './musicbar/Controls.vue'
import ExtraControls from './musicbar/ExtraControls.vue'
@Component({
  components: {
    Details,
    Controls,
    ExtraControls,
  },
})
export default class MusicBar extends Vue {}
</script>

<style lang="sass" scoped>
@import '@/sass/variables.sass'

.background
  background: $primary
  position: fixed
  bottom: 0
  height: 6rem

.timeline
  background: $tertiary
  background: linear-gradient(90deg, $accent-primary 0%, $accent-primary 60%, $tertiary 0%)
  height: 0.5rem
</style>
