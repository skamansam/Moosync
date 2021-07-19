<template>
  <div>
    <b-container fluid>
      <b-row no-gutters class="w-100">
        <b-col>
          <div class="add-extension-button" @click="openFileBrowser">Add New Directory...</div>
          <div v-for="ext of extensions" :key="ext.packageName">{{ ext }}</div>
        </b-col>
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
import { vxm } from '@/preferenceWindow/store'

@Component({
  components: {
    PathSelector,
    ThumbnailPath,
    ArtworkPath
  }
})
export default class Extensions extends Vue {
  private extensions: ExtensionDetails[] = []

  created() {
    this.fetchExtensions()
  }

  private openFileBrowser() {
    window.WindowUtils.openFileBrowser(true).then((data) => {
      if (!data.canceled) {
        window.ExtensionUtils.install(...data.filePaths).then((result) => {
          if (result.success) {
            Vue.nextTick().then(() => this.fetchExtensions())
          }
        })
      }
    })
  }

  private async fetchExtensions() {
    this.extensions = await window.ExtensionUtils.getAllExtensions()
  }
}
</script>

<style lang="sass" scoped>
.add-extension-button
  font-size: 22px
  color: var(--textPrimary)
</style>
