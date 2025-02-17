/*
 *  AccountsMixin.ts is a part of Moosync.
 *
 *  Copyright 2022 by Sahil Gupte <sahilsachingupte@gmail.com>. All rights reserved.
 *  Licensed under the GNU General Public License.
 *
 *  See LICENSE in the project root for license information.
 */

import { Component, Vue } from 'vue-property-decorator'
import { GenericAuth } from '@/utils/ui/providers/generics/genericAuth'
import { vxm } from '@/mainWindow/store'
import { bus } from '@/mainWindow/main'
import { EventBus } from '@/utils/main/ipc/constants'

@Component
export default class AccountsMixin extends Vue {
  private _signoutProvider?: (provider: Providers) => void

  set signoutMethod(signout: ((provider: Providers) => void) | undefined) {
    this._signoutProvider = signout
  }

  get signoutMethod() {
    return this._signoutProvider
  }

  protected providers: {
    name: Providers
    username: string | undefined
    bgColor: string
    icon: string
    provider: GenericAuth
  }[] = [
    {
      name: this.useInvidious ? 'Invidious' : 'Youtube',
      bgColor: this.useInvidious ? '#00B6F0' : '#E62017',
      username: '',
      icon: this.useInvidious ? 'InvidiousIcon' : 'YoutubeIcon',
      provider: this.youtube
    },
    {
      name: 'Spotify',
      bgColor: '#1ED760',
      username: '',
      icon: 'SpotifyIcon',
      provider: this.spotify
    },
    {
      name: 'LastFM',
      bgColor: '#BA0000',
      username: '',
      icon: 'LastFMIcon',
      provider: this.lastFm
    }
  ]

  private get useInvidious() {
    return vxm.providers.useInvidious
  }

  protected getProvider(provider: Providers) {
    return this.providers.find((val) => val.name === provider)
  }

  protected async getUserDetails(provider: Providers) {
    const p = this.getProvider(provider)
    if (p) {
      const username = await p?.provider.getUserDetails()
      this.$set(p, 'username', username)
      if (!p.username) {
        p.provider.signOut()
      }
    }
  }

  protected async handleClick(provider: Providers) {
    const p = this.getProvider(provider)
    if (p) {
      if (!p.provider.loggedIn) {
        const success = await p.provider.updateConfig()
        if (!success) {
          window.WindowUtils.openWindow(false, { page: 'system' })
          return
        }
        return this.login(provider)
      }
      this._signoutProvider && this._signoutProvider(provider)
    }
  }

  protected async login(provider: Providers) {
    const p = this.getProvider(provider)
    if (p) {
      if (await p.provider.login()) {
        try {
          await this.getUserDetails(p.name)
          bus.$emit(EventBus.REFRESH_USERNAMES, provider)

          if (p.name === 'LastFM') this.lastFm.scrobble(vxm.player.currentSong)
        } catch (e) {
          console.error(e)
          await p.provider.signOut()
        }
      }
    }
  }

  get youtube() {
    return vxm.providers.youtubeProvider
  }

  get spotify() {
    return vxm.providers.spotifyProvider
  }

  get lastFm() {
    return vxm.providers.lastfmProvider
  }

  mounted() {
    this.getUserDetails('Youtube')
    this.getUserDetails('Spotify')
    this.getUserDetails('LastFM')

    vxm.providers.$watch(
      'useInvidious',
      (val) => {
        this.getUserDetails(val ? 'Invidious' : 'Youtube')
      },
      { immediate: true, deep: false }
    )

    bus.$on(EventBus.REFRESH_USERNAMES, (provider: Providers) => {
      this.getUserDetails(provider)
    })
  }
}
