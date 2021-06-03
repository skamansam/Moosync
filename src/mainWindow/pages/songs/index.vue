<template>
  <div class="w-100">
    <SongView
      :songList="songList"
      @onRowContext="getSongContextMenu(undefined, arguments[0], ...arguments[1])"
    />
  </div>
</template>

<script lang="ts">
import { Component } from "vue-property-decorator";
import SongView from "@/mainWindow/components/SongView.vue";

import { Song } from "@/models/songs";

import { mixins } from "vue-class-component";
import ContextMenuMixin from "@/utils/mixins/ContextMenuMixin";
import { vxm } from "@/mainWindow/store";

@Component({
  components: {
    SongView,
  },
})
export default class AllSongs extends mixins(ContextMenuMixin) {
  private songList: Song[] = [];
  private currentSong: Song | null = null;

  get playlists() {
    return vxm.playlist.playlists;
  }

  mounted() {
    this.requestSongs();
  }

  private async requestSongs() {
    this.songList = await window.DBUtils.getAllSongs();
  }
}
</script>
