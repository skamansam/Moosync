<template>
  <b-container fluid class="album-container">
    <b-row class="title">Albums</b-row>
    <b-row class="d-flex">
      <b-col col xl="2" md="3" v-for="album in filteredAlbumList" :key="album.album_id">
        <CardView :title="album.album_name" :imgSrc="album.album_coverPath" @click.native="gotoAlbum(album)">
          <template #defaultCover>
            <AlbumDefault />
          </template>
        </CardView>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import CardView from '@/mainWindow/components/generic/CardView.vue'
import { mixins } from 'vue-class-component'
import { Component } from 'vue-property-decorator'
import RouterPushes from '@/utils/ui/mixins/RouterPushes'
import AlbumDefault from '@/mainWindow/components/icons/AlbumDefault.vue'

@Component({
  components: {
    CardView,
    AlbumDefault
  }
})
export default class Albums extends mixins(RouterPushes) {
  private albumList: Album[] = []

  private async getAlbums() {
    this.albumList = await window.DBUtils.getAllAlbums()
  }

  get filteredAlbumList() {
    return this.albumList.filter((x) => {
      return x.album_name !== null
    })
  }

  mounted() {
    this.getAlbums()
  }
}
</script>

<style lang="sass" scoped>
.album-container
  position: absolute
.title
  font-style: normal
  font-weight: bold
  font-size: 64px
  line-height: 100px
  padding-left: 15px
  margin-bottom: 50px
</style>
