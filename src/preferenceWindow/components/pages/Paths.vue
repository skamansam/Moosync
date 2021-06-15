<template>
  <div>
    <b-container fluid>
      <b-row no-gutters class="w-100">
        <div class="path-selector w-100">
          <PathSelector />
          <ThumbnailPath class="mt-5" />
          <ArtworkPath class="mt-5" />
        </div>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator'
import Vue from 'vue'
import PathSelector from '../PathSelector.vue'
import ThumbnailPath from '../ThumbnailPath.vue'
import ArtworkPath from '@/preferenceWindow/components/ArtworkPath.vue'

@Component({
  components: {
    PathSelector,
    ThumbnailPath,
    ArtworkPath
  }
})
export default class scanner extends Vue {}
</script>

<style lang="sass" scoped>
.path-selector
  max-width: 750px

.title
  text-align: left
</style>
