<template>
  <div id="app" :style="rootColors">
    <Titlebar windowType="preference-window" />
    <div class="content">
      <router-view></router-view>
    </div>
    <div class="footer-buttons">
      <b-button v-on:click="closeWindow"> Close </b-button>
      <b-button v-on:click="writePreferences"> Apply </b-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator'
import Titlebar from '@/commonComponents/Titlebar.vue'
import { Preferences } from '@/utils/db/constants'
import { ipcRendererHolder } from '@/utils/ipc/renderer'
import { IpcEvents, PreferenceEvents, ScannerEvents, WindowEvents } from '@/utils/ipc/main/constants'
import { PreferencesModule } from './store/preferences'
import { mixins } from 'vue-class-component'
import ThemeHandler from '@/utils/mixins/ThemeHandler'

@Component({
  components: {
    Titlebar,
  },
})
export default class App extends mixins(ThemeHandler) {
  created() {
    this.loadPreferences()
  }

  private loadPreferences() {
    ipcRendererHolder
      .send<Preferences>(IpcEvents.PREFERENCES, { type: PreferenceEvents.LOAD_PREFERENCES })
      .then((data) => {
        PreferencesModule.setPreferences(data)
      })
  }

  private closeWindow() {
    ipcRendererHolder.send<void>(IpcEvents.BROWSER_WINDOWS, { type: WindowEvents.CLOSE_PREF })
  }

  private async writePreferences() {
    ipcRendererHolder.send<void>(IpcEvents.PREFERENCES, {
      type: PreferenceEvents.SAVE_PREFERENCES,
      params: { preferences: PreferencesModule.preferences },
    })

    if (PreferencesModule.pathsChanged) {
      ipcRendererHolder.send<void>(IpcEvents.SCANNER, { type: ScannerEvents.SCAN_MUSIC })
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  background: var(--primary);
  color: var(--textPrimary);
  width: 100%;
  height: 100%;
  /* margin-top: 60px; */
}

body {
  background-color: var(--primary) !important;
  color: var(--textPrimary) !important;
}

.content {
  margin: 0 2rem 0 2rem;
  max-height: calc(100% - 32px);
}

.footer-buttons {
  position: absolute;
  bottom: 0;
  right: 0;
}
</style>
