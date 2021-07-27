<template>
  <div>
    <b-container fluid>
      <b-row no-gutters class="w-100">
        <div class="path-selector w-100">
          <DirectoryGroup
            title="Song Directories"
            tooltip="Directories where all your local music is stored"
            :defaultValue="[]"
            prefKey="musicPaths"
          />
          <FilePicker
            title="Downloaded Artwork Path"
            tooltip="Directory where downloaded artworks are stored"
            prefKey="artworkPath"
            defaultValue="''"
            class="mt-5"
          />
          <FilePicker
            title="Generated Thumbnail Path"
            tooltip="Directory where generated thumbnails are stored"
            prefKey="thumbnailPath"
            defaultValue="''"
            class="mt-5"
          />
        </div>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator'
import Vue from 'vue'
import FilePicker from '../FilePicker.vue'
import { vxm } from '@/preferenceWindow/store'
import DirectoryGroup from '../DirectoryGroup.vue'

@Component({
  components: {
    DirectoryGroup,
    FilePicker
  }
})
export default class Paths extends Vue {}
</script>

<style lang="sass" scoped>
.path-selector
  max-width: 750px

.title
  text-align: left
</style>
