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
      <SongView
        :songList="songList"
        @onRowContext="getSongContextMenu(undefined, arguments[0], ...arguments[1])"
      />
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Component, Prop } from "vue-property-decorator";
import SongView from "@/mainWindow/components/SongView.vue";
import { Song } from "@/models/songs";
import { Genre } from "@/models/genre";

import { mixins } from "vue-class-component";
import ContextMenuMixin from "@/utils/mixins/ContextMenuMixin";

@Component({
  components: {
    SongView,
  },
})
export default class SingleAlbumView extends mixins(ContextMenuMixin) {
  private genre: Genre | null = null;
  private songList: Song[] = [];

  @Prop({ default: "" })
  private genre_id!: string;

  @Prop({ default: "" })
  private genre_name!: string;

  @Prop({ default: "" })
  private genre_coverPath!: string;

  mounted() {
    this.fetchgenre();
  }

  private async fetchgenre() {
    this.songList = await window.DBUtils.getSingleGenre(this.genre_id);
  }
}
</script>
