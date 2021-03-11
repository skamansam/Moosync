<route>
{
  "props": true
}
</route>
<template>
  <b-container fluid>
    <b-row>
      <div>{{ genre_name }}</div>
    </b-row>
    <b-row>
      <SongView :songList="songList" @onRowContext="getSongContextMenu(undefined, ...arguments)" />
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator'
import SongView from '@/mainWindow/components/SongView.vue'
import { ipcRendererHolder } from '@/utils/ipc/renderer'
import { IpcEvents, GenreEvents } from '@/utils/ipc/main/constants'
import { Song } from '@/models/songs'
import { Genre } from '@/models/genre'

import { mixins } from 'vue-class-component'
import ContextMenuMixin from '@/utils/mixins/ContextMenuMixin'

@Component({
  components: {
    SongView,
  },
})
export default class SingleAlbumView extends mixins(ContextMenuMixin) {
  private genre: Genre | null = null
  private songList: Song[] = []

  @Prop({ default: '' })
  private genre_id!: string

  @Prop({ default: '' })
  private genre_name!: string

  @Prop({ default: '' })
  private genre_coverPath!: string

  mounted() {
    this.fetchgenre()
  }

  private fetchgenre() {
    ipcRendererHolder
      .send<Song[]>(IpcEvents.GENRE, {
        type: GenreEvents.GET_GENRE,
        params: { id: this.genre_id },
      })
      .then((data) => {
        this.songList = data
      })
  }
}
</script>
