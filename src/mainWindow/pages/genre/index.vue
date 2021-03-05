<template>
  <b-container fluid class="album-container">
    <b-row class="title">genres</b-row>
    <b-row class="d-flex">
      <b-col col xl="2" md="3" v-for="genre in genres" :key="genre.genre_id">
        <CardView :title="genre.genre_name" :imgSrc="genre.genre_coverPath" @click.native="gotoGenre(genre)" />
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Genre } from '@/models/genre'
import { GenreEvents, IpcEvents } from '@/utils/ipc/main/constants'
import { Component } from 'vue-property-decorator'
import CardView from '@/mainWindow/components/generic/CardView.vue'
import { ipcRendererHolder } from '@/utils/ipc/renderer'
import { mixins } from 'vue-class-component'
import RouterPushes from '@/utils/mixins/RouterPushes'

@Component({
  components: {
    CardView,
  },
})
export default class Genres extends mixins(RouterPushes) {
  private genres: Genre[] = []
  private getgenres() {
    ipcRendererHolder
      .send<Genre[]>(IpcEvents.GENRE, { type: GenreEvents.GET_ALL_GENRE })
      .then((data) => {
        this.genres = data
      })
  }

  mounted() {
    this.getgenres()
  }
}
</script>

<style lang="sass" scoped>
.album-container
  position: absolute
.title
  font-family: Proxima Nova
  font-style: normal
  font-weight: bold
  font-size: 64px
  line-height: 100px
  padding-left: 15px
  margin-bottom: 50px
</style>
