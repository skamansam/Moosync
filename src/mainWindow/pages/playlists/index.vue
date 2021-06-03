<template>
  <b-container fluid class="album-container">
    <b-row class="title">Playlists</b-row>
    <b-row class="d-flex">
      <b-col
        col
        xl="2"
        md="3"
        v-for="playlist in allPlaylists"
        :key="playlist.playlist_id"
      >
        <CardView
          :title="playlist.playlist_name"
          :imgSrc="playlist.playlist_coverPath"
          @click.native="gotoPlaylist(playlist)"
          @contextmenu.native="
            getPlaylistContextMenu(arguments[0], playlist, refreshCallback)
          "
        />
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Playlist } from "@/models/playlists";
import { Component } from "vue-property-decorator";
import CardView from "@/mainWindow/components/generic/CardView.vue";
import { mixins } from "vue-class-component";
import RouterPushes from "@/utils/mixins/RouterPushes";
import ContextMenuMixin from "@/utils/mixins/ContextMenuMixin";
import { vxm } from "@/mainWindow/store";

@Component({
  components: {
    CardView,
  },
})
export default class Albums extends mixins(RouterPushes, ContextMenuMixin) {
  private allPlaylists: Playlist[] = [];
  private async getPlaylists() {
    this.allPlaylists = await window.DBUtils.getAllPlaylists();
  }

  mounted() {
    this.getPlaylists();
  }

  private refreshCallback() {
    this.getPlaylists();
    vxm.playlist.updated = true;
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
