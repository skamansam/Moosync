<template>
  <div id="app" :style="rootColors">
    <div class="titlebar titlebar-style-dark">
      <div class="titlebar-resize-handle top"></div>
      <div class="titlebar-resize-handle right"></div>
      <div class="titlebar-resize-handle left"></div>
      <div class="titlebar-header">
        <div class="titlebar-icon">
          <slot name="icon"></slot>
        </div>

        <div class="titlebar-name">
          <slot name="title"></slot>
        </div>
      </div>

      <div class="titlebar-menu">
        <div class="titlebar-menu-item" v-for="(item, index) in menu" :key="index">
          <button @click="item.click()">
            {{ item.label }}
          </button>
        </div>
      </div>

      <div class="titlebar-buttons">
        <button aria-label="minimize" title="Minimize" tabindex="-1" @click="onMinimize()">
          <svg aria-hidden="true" version="1.1" width="10" height="10">
            <path d="M 0,5 10,5 10,6 0,6 Z"></path>
          </svg>
        </button>

        <button aria-label="maximize" title="Maximize" tabindex="-1" @click="onMaximize()">
          <svg aria-hidden="true" version="1.1" width="10" height="10">
            <path d="M 0,0 0,10 10,10 10,0 Z M 1,1 9,1 9,9 1,9 Z"></path>
          </svg>
        </button>

        <button aria-label="close" title="Close" tabindex="-1" class="close" @click="onClose()">
          <svg aria-hidden="true" version="1.1" width="10" height="10">
            <path
              d="M 0,0 0,0.7 4.3,5 0,9.3 0,10 0.7,10 5,5.7 9.3,10 10,10 10,9.3 5.7,5 10,0.7 10,0 9.3,0 5,4.3 0.7,0 Z"
            ></path>
          </svg>
        </button>
      </div>
    </div>
    <!-- <button v-on:click="scan()">Scan</button> -->
    <div class="router">
      <router-view></router-view>
    </div>
  </div>
</template>

<script lang="ts">
// import {Themes} from '@/commonStore/themeState'
import { ThemesModule } from '@/mainWindow/store/themeState'

import { Playlist } from '@/models/playlists'
import { IpcEvents, PlaylistEvents, ScannerEvents } from '@/utils/ipc/main/constants'

import { playlistInfo, PlaylistModule } from '@/mainWindow/store/playlists'
import { Component, Vue } from 'vue-property-decorator'
import { ipcRendererHolder } from '@/utils/ipc/renderer'

const stun = require('stun')

@Component({})
export default class App extends Vue {
  private root = document.documentElement
  get rootColors() {
    return ThemesModule.rootVars
  }

  private setDefaultTheme() {
    ThemesModule.setRootVars({
      '--primary': '#212121',
      '--secondary': '#282828',
      '--tertiary': '#202730',
      '--quaternary': '#404040',
      '--textPrimary': '#ffffff',
      '--textPrimaryTransparent': '#ffffff03',
      '--textSecondary': '#565656',
      '--accentPrimary': '#65CB88',
    })
  }

  mounted() {
    this.registerThemeListeners()
    this.setDefaultTheme()
    this.watchPlaylistUpdates()
    this.populatePlaylists()

    // this.testStun()
  }

  private scan() {
    ipcRendererHolder
      .send<void>(IpcEvents.SCANNER, { params: ['/mnt/g/Songs/Playlist/Daily Dose'], type: ScannerEvents.SCAN_MUSIC })
      .then((data) => {
        console.log(data)
      })
  }

  public testStun(): void {
    stun.request('stun.l.google.com:19302', (err: any, res: any) => {
      if (err) {
        console.error(err)
      } else {
        const { address } = res.getXorAddress()
        console.log('ip: ', address)
      }
    })
  }

  private registerThemeListeners() {
    ThemesModule.$watch(
      (themesModule) => themesModule.rootVars,
      async (newColors: { [key: string]: string }) => {
        this.root.style.setProperty('--primary', newColors['--primary'])
      }
    )
  }

  private watchPlaylistUpdates() {
    PlaylistModule.$watch(
      (playlistModule) => playlistModule.updated,
      (updated: boolean) => {
        if (updated) {
          PlaylistModule.setUpdated(false)
          this.populatePlaylists()
        }
      }
    )
  }

  private populatePlaylists() {
    ipcRendererHolder
      .send<Playlist[]>(IpcEvents.PLAYLIST, { type: PlaylistEvents.GET_ALL_PLAYLISTS })
      .then((data) => {
        let playlists: playlistInfo = {}
        for (let p of data) {
          playlists[p.playlist_id] = p.playlist_name
        }
        PlaylistModule.setPlaylists(playlists)
      })
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

.router {
  margin-top: 32px;
}

body {
  background-color: var(--primary) !important;
  color: var(--textPrimary) !important;
}

.titlebar {
  position: relative;
  flex-grow: 0;
  flex-shrink: 0;
  width: 100%;
  display: flex;
  flex-direction: row;
  top: 0;
  left: 0;
  right: 0;
  z-index: 99999;
  height: 32px;
  -webkit-app-region: drag;
  &.titlebar-style-dark {
    color: #fff;
    background: #2d3135;
  }
  &.titlebar-style-light {
    color: #2c2c2c;
    background: #f6f6f6;
  }
  .titlebar-resize-handle {
    position: absolute;
    top: 0;
    left: 0;
    -webkit-app-region: no-drag;
    &.top {
      width: 100%;
      height: 3px;
    }
    &.right {
      left: auto;
      right: 0;
      width: 3px;
      height: $titlebar-height;
    }
    &.left {
      width: 3px;
      height: $titlebar-height;
    }
  }
  .titlebar-header {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .titlebar-icon,
  .titlebar-name {
    display: flex;
    align-content: center;
    align-self: center;
    flex-grow: 0;
    flex-shrink: 0;
    font-size: 14px;
    line-height: $titlebar-height;
    padding: 0 12px;
    height: $titlebar-height;
    > svg,
    > img {
      display: block;
      align-content: center;
      align-self: center;
      width: auto;
      height: 16px;
    }
  }
  .titlebar-icon ~ .titlebar-name {
    padding-left: 0;
  }
  &.titlebar-platform-darwin {
    .titlebar-header {
      width: 100%;
      text-align: center;
      position: absolute;
      pointer-events: none;
    }
  }
  .titlebar-menu {
    display: flex;
    -webkit-app-region: no-drag;
    .titlebar-menu-item {
      min-width: 0;
      position: relative;
      cursor: pointer;
      button {
        border: none;
        box-shadow: none;
        background: transparent;
        height: 100%;
        width: 100%;
        position: relative;
        display: flex;
        flex-direction: row;
        align-items: center;
        margin: 0;
        color: currentColor;
        font-size: 13px;
        padding: 0 10px;
        outline: none;
        &:hover {
          background-color: rgba(0, 0, 0, 0.2);
        }
      }
    }
  }
  .titlebar-buttons {
    display: flex;
    flex-direction: row;
    flex-grow: 0;
    flex-shrink: 0;
    margin-left: auto;
    button {
      -webkit-app-region: no-drag;
      display: inline-block;
      position: relative;
      width: 45px;
      height: 100%;
      padding: 0;
      margin: 0;
      overflow: hidden;
      border: none;
      box-shadow: none;
      border-radius: 0;
      color: currentColor;
      background-color: transparent;
      line-height: 10px;
      outline: none;
      svg {
        fill: currentColor;
      }
      &:hover {
        background-color: rgba(0, 0, 0, 0.2);
        color: currentColor;
      }
      &.close:hover {
        background-color: #e81123;
        color: #fff;
      }
    }
  }
  .titlebar-buttons-osx {
    display: flex;
    box-sizing: border-box;
    padding: 10px;
    width: 70px;
    flex-direction: row;
    -webkit-box-pack: justify;
    justify-content: space-between;
    align-items: center;
    .macButton {
      -webkit-app-region: no-drag;
      -webkit-box-sizing: border-box;
      border-radius: 50%;
      box-sizing: border-box;
      height: 12px;
      width: 12px;
      background-color: #dcdcdc;
      border-color: #d1d1d1;
      &.macButtonClose {
        background-color: #fc615d;
      }
      &.macButtonMinimize {
        background-color: #fdbc40;
      }
      &.macButtonMaximize {
        background-color: #34c749;
      }
      svg {
        display: block;
        visibility: hidden;
      }
    }
    &:hover {
      .macButton {
        svg {
          visibility: visible;
        }
      }
    }
  }
}
</style>
