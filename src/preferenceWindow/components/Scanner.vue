<template>
  <div>
    <div class="d-flex">
      <h5 class="title">Directories</h5>
      <b-button v-on:click="openFileBrowser">Add folder</b-button>
    </div>
    <b-container class="path-container" fluid>
      <b-row v-for="path in musicPaths" :key="path.path">
        <div class="d-flex path">
          <b-form-checkbox :checked="path.enabled" :id="`checkbox-${path.path}`" @change="togglePath(path.path)" />
          <div>{{ path.path }}</div>
          <b-button v-on:click="removePath(path.path)">X</b-button>
        </div>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator'
import Vue from 'vue'
import { PreferencesModule } from '../store/preferences'
import { ipcRendererHolder } from '@/utils/ipc/renderer'
import { IpcEvents, WindowEvents } from '@/utils/ipc/main/constants'

@Component({})
export default class scanner extends Vue {
  get musicPaths() {
    return PreferencesModule.preferences.musicPaths
  }

  private togglePath(path: string) {
    PreferencesModule.togglePath({
      path: path,
      value: (document.getElementById(`checkbox-${path}`) as HTMLInputElement).checked,
    })
  }

  private removePath(path: string) {
    PreferencesModule.removePath(path)
    PreferencesModule.setPathsChanged(true)
    console.log(this.musicPaths)
  }

  private openFileBrowser() {
    ipcRendererHolder
      .send<Electron.OpenDialogReturnValue>(IpcEvents.BROWSER_WINDOWS, { type: WindowEvents.OPEN_FILE_BROWSER })
      .then((data) => {
        PreferencesModule.addPaths(...data.filePaths)
        PreferencesModule.setPathsChanged(true)
      })
  }
}
</script>

<style lang="sass" scoped>
.path-container
  max-height: 320px
  border-radius: 10px
  padding:  3px 25px 3px 25px
  border: 3px solid var(--secondary)
  .path
    flex-grow: 1
    button
      width: 100%

.title
  text-align: left
</style>
