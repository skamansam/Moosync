<template>
  <b-container fluid class="album-container">
    <b-row class="title">genres</b-row>
    <b-row class="d-flex">
      <b-col col xl="2" md="3" v-for="genre in genres" :key="genre.genre_id">
        <CardView :title="genre.genre_name" :imgSrc="genre.genre_coverPath" @click.native="itemSelected(genre)" />
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Genre } from '@/models/genre'
import { GenreEvents, IpcEvents } from '@/utils/ipc/main/constants'
import { Component, Vue } from 'vue-property-decorator'
import CardView from '@/components/generic/CardView.vue'
import { ipcRendererHolder } from '@/utils/ipc/renderer'

@Component({
  components: {
    CardView,
  },
})
export default class Genres extends Vue {
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

  private itemSelected(genre: Genre) {
    this.$router.push({
      name: 'genre-id',
      params: {
        genre_id: genre.genre_id!,
        genre_name: genre.genre_name!,
      },
    })
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
