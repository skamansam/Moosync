<template>
  <b-container fluid>
    <b-row class="d-flex">
      <b-col cols="8"><SongList /></b-col>
      <b-col cols="4"><SongDetails /></b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import SongList from './allsongs/SongList.vue'
import SongDetails from './allsongs/SongDetails.vue'

@Component({
  components: {
    SongList,
    SongDetails,
  },
})
export default class AllSongs extends Vue {}
</script>

<style lang="sass" scoped>
@import '@/sass/variables.sass'
</style>
