<template>
  <div class="topbar-container d-flex align-items-center">
    <b-container fluid class="d-flex">
      <b-row class="flex-grow-1 justify-content-start">
        <b-col col sm="8" md="9">
          <Search />
        </b-col>
        <b-col cols="auto" class="my-auto">
          <Navigation />
        </b-col>
        <b-col col md="auto" align-self="center">
          <Person id="account" class="accounts-icon" />
          <b-popover :target="`account`" placement="bottom" triggers="focus" custom-class="accounts-popover">
            <div class="buttons">
              <IconButton
                @click.native="handleYoutubeClick"
                bgColor="#E62017"
                :title="youtubeName ? youtubeName : 'Connect'"
                :hoverText="loggedInYoutube ? 'Sign Out' : 'Youtube'"
              >
                <template slot="icon"> <YoutubeIcon /> </template>
              </IconButton>
              <IconButton
                @click.native="handleSpotifyClick"
                bgColor="#1ED760"
                :title="spotifyName ? spotifyName : 'Connect'"
                :hoverText="loggedInSpotify ? 'Sign Out' : 'Spotify'"
              >
                <template slot="icon"> <SpotifyIcon /> </template>
              </IconButton>
              <IconButton bgColor="#737373" title="Settings" @click.native="openSettings">
                <template slot="icon"> <GearIcon /> </template>
              </IconButton>
            </div>
          </b-popover>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts">
import Navigation from '@/mainWindow/components/topbar/Navigation.vue'
import Search from '@/mainWindow/components/topbar/Search.vue'
import Colors from '@/utils/ui/mixins/Colors'
import { mixins } from 'vue-class-component'
import { Component } from 'vue-property-decorator'
import Person from '@/mainWindow/components/icons/Person.vue'
import IconButton from '@/mainWindow/components/generic/IconButton.vue'
import YoutubeIcon from '@/mainWindow/components/icons/Youtube.vue'
import SpotifyIcon from '@/mainWindow/components/icons/Spotify.vue'
import GearIcon from '@/mainWindow/components/icons/Gears.vue'
import { vxm } from '../store'

@Component({
  components: {
    Search,
    Navigation,
    Person,
    IconButton,
    YoutubeIcon,
    SpotifyIcon,
    GearIcon
  }
})
export default class TopBar extends mixins(Colors) {
  private youtubeName = ''
  private loggedInYoutube = false

  private spotifyName = ''
  private loggedInSpotify = false

  mounted() {
    this.getUserDetailsYoutube()
    this.getUserDetailsSpotify()
  }

  get youtube() {
    return vxm.providers.youtubeProvider
  }

  get spotify() {
    return vxm.providers.spotifyProvider
  }

  private handleSpotifyClick() {
    if (!this.loggedInSpotify) {
      this.loginSpotify()
      return
    }
    this.signOutSpotify()
  }

  private async loginSpotify() {
    await this.spotify.login()
    this.getUserDetailsSpotify()
  }

  private async signOutSpotify() {
    await this.spotify.signOut()
    this.spotifyName = ''
    this.loggedInSpotify = false
  }

  private getUserDetailsSpotify() {
    this.spotify
      .getUserDetails()
      .then((name) => {
        if (name) {
          this.spotifyName = name
          this.loggedInSpotify = true
        }
      })
      .catch((err) => console.error(err))
  }

  private handleYoutubeClick() {
    if (!this.loggedInYoutube) {
      this.loginYoutube()
      return
    }
    this.signOutYoutube()
  }

  private getUserDetailsYoutube() {
    this.youtube
      .getUserDetails()
      .then((name) => {
        if (name) {
          this.youtubeName = name
          this.loggedInYoutube = true
        }
      })
      .catch((err) => console.error(err))
  }

  private async loginYoutube() {
    await this.youtube.login()
    this.getUserDetailsYoutube()
  }

  private async signOutYoutube() {
    await this.youtube.signOut()
    this.youtubeName = ''
    this.loggedInYoutube = false
  }

  private openSettings() {
    window.WindowUtils.openPreferenceWindow()
  }
}
</script>

<style lang="sass">
.accounts-popover
  background-color: var(--tertiary)
  border-radius: 16px
  border: none
  .arrow
    &::after
      border-bottom-color: var(--tertiary)
</style>

<style lang="sass" scoped>

.buttons
  > div
    margin-bottom: 15px
    &:first-child
      margin-top: 15px

.topbar-container
  background: var(--primary)
  height: 70px

.accounts-icon
  height: 22px
  width: 22px
  margin-left: 0.5rem
</style>
