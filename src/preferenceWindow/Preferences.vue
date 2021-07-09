<template>
  <div id="app" :style="rootColors">
    <Titlebar windowType="preference-window" />
    <Sidebar />
    <div class="main-content">
      <transition name="slide-fade">
        <router-view></router-view>
      </transition>
    </div>
    <div class="footer-buttons">
      <b-button v-on:click="closeWindow">Close</b-button>
      <b-button v-on:click="writePreferences">Apply</b-button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import Titlebar from '@/commonComponents/Titlebar.vue'
import { vxm } from '@/preferenceWindow/store'
import { mixins } from 'vue-class-component'
import ThemeHandler from '@/utils/ui/mixins/ThemeHandler'
import Sidebar from '@/preferenceWindow/components/Sidebar.vue'

@Component({
  components: {
    Titlebar,
    Sidebar
  }
})
export default class App extends mixins(ThemeHandler) {
  created() {
    this.loadPreferences()
  }

  mounted() {
    this.registerDevTools()
  }

  private registerDevTools() {
    document.addEventListener('keydown', function (e) {
      if (e.code === 'F12') {
        window.WindowUtils.toggleDevTools()
      } else if (e.code === 'F5') {
        location.reload()
      }
    })
  }

  private loadPreferences() {
    window.PreferenceUtils.load().then((data) => {
      vxm.preferences.setPreferences(data)
    })
  }

  private closeWindow() {
    window.WindowUtils.closePreferenceWindow()
  }

  private async writePreferences() {
    if (vxm.preferences.preferences) {
      await window.PreferenceUtils.save(vxm.preferences.preferences)
      if (vxm.preferences.pathsChanged) {
        Vue.nextTick(() => window.FileUtils.scan())
      }
    }
  }
}
</script>

<style>
#app {
  font-family: 'Nunito Sans';
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  background: var(--primary);
  color: var(--textPrimary);
  width: 100%;
  height: 100%;
  /* margin-top: 60px */
}

body {
  background-color: var(--primary) !important;
  color: var(--textPrimary) !important;
}

.footer-buttons {
  position: absolute;
  bottom: 0;
  right: 0;
}
</style>

<style lang="sass">
.slide-fade-enter-active
  transition: all .3s ease

.slide-fade-leave-active
  transition: all .2s ease
.slide-fade-enter, .slide-fade-leave-to
  transform: translateY(100px)
  opacity: 0

*::-webkit-scrollbar,
*::-webkit-scrollbar-thumb
  width: 26px
  border-radius: 13px
  background-clip: padding-box
  border: 10px solid transparent

*::-webkit-scrollbar-thumb
  box-shadow: inset 0 0 0 10px

*::-webkit-scrollbar-track
  background: var(--primary)
</style>

<style lang="sass" scoped>
.main-content
  position: absolute
  left: calc(261px + 30px)
  height: calc(100% - (6rem + 30px) - 70px + 16px)
  top: calc(70px + 18px + 4px)
  right: 0
  bottom: calc(6rem + 30px)
  overflow-y: scroll
  overflow-x: hidden
  z-index: -4
  transition: 0.2s
</style>
