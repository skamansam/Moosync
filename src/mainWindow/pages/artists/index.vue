<template>
  <b-container fluid class="album-container">
    <b-row class="title">Artists</b-row>
    <b-row class="d-flex">
      <b-col col xl="2" md="3" v-for="artist in artistList" :key="artist.artist_id">
        <CardView
          :title="artist.artist_name"
          :imgSrc="artist.artist_coverPath"
          @click.native="gotoArtist(artist)"
        />
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { artists } from "@/models/artists";
import { Component } from "vue-property-decorator";
import CardView from "@/mainWindow/components/generic/CardView.vue";
import { mixins } from "vue-class-component";
import RouterPushes from "@/utils/mixins/RouterPushes";

@Component({
  components: {
    CardView,
  },
})
export default class Artists extends mixins(RouterPushes) {
  private artistList: artists[] = [];
  private async getArtists() {
    this.artistList = await window.DBUtils.getAllArtists();
  }

  mounted() {
    this.getArtists();
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
