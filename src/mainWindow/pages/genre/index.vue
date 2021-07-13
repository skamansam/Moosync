<template>
  <b-container fluid class="album-container">
    <b-row class="title">Genres</b-row>
    <b-row class="d-flex">
      <b-col col xl="2" md="3" v-for="genre in genres" :key="genre.genre_id">
        <CardView :title="genre.genre_name" :imgSrc="genre.genre_coverPath" @click.native="gotoGenre(genre)" />
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator'
import CardView from '@/mainWindow/components/generic/CardView.vue'
import { mixins } from 'vue-class-component'
import RouterPushes from '@/utils/ui/mixins/RouterPushes'

@Component({
  components: {
    CardView
  }
})
export default class Genres extends mixins(RouterPushes) {
  private genres: Genre[] = []
  private async getgenres() {
    this.genres = await window.DBUtils.getAllGenres()
  }

  mounted() {
    this.getgenres()
  }
}
</script>

<style lang="sass" scoped>
.album-container
  position: absolute
</style>
