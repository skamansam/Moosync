<template>
  <div class="w-100">
    <SongView :songList="songList" @onRowContext="getSongMenu(arguments[0], arguments[1], undefined)" />
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator'
import SongView from '@/mainWindow/components/SongView.vue'

import { Song } from '@/utils/models/songs'

import { mixins } from 'vue-class-component'
import ContextMenuMixin, { ContextTypes } from '@/utils/ui/mixins/ContextMenuMixin'
import { vxm } from '@/mainWindow/store'

@Component({
  components: {
    SongView
  }
})
export default class AllSongs extends mixins(ContextMenuMixin) {
  private songList: Song[] = []
  private currentSong: Song | null = null

  get playlists() {
    return vxm.playlist.playlists
  }

  mounted() {
    this.requestSongs()
  }

  private async requestSongs() {
    this.songList = await window.DBUtils.getAllSongs()
  }

  private getSongMenu(event: Event, songs: Song[], exclude: string | undefined) {
    this.getContextMenu(event, { type: ContextTypes.SONGS, args: { songs: songs, exclude: exclude } })
  }
}
</script>
