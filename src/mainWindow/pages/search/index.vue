<template>
  <div class="search-content w-100">
    <v-card color="var(--primary)">
      <v-tabs fixed-tabs v-model="tab" dark background-color="primary" show-arrows>
        <v-tab v-for="item in items" :key="item.tab" :href="`#${item.tab}`"> {{ item.tab }} </v-tab>
      </v-tabs>
    </v-card>

    <v-tabs-items v-model="tab" class="tab-content-holder">
      <v-tab-item v-for="item in items" :id="item.tab" :key="item.tab" :eager="true" class="tab-content-holder">
        <RecycleScroller
          class="scroller"
          :items="ComputeTabContent(item.tab)"
          :item-size="82"
          key-field="_id"
          v-slot="{ item, index }"
          v-if="result"
          :direction="'vertical'"
        >
          <SingleSearchResult
            :first="index == 0"
            :title="ComputeTabTitle(tab, item)"
            :subtitle="ComputeTabSubTitle(tab, item)"
            :coverImg="ComputeTabImage(tab, item)"
            :divider="index != result.songs.length - 1"
            :id="item"
            :showButtons="true"
            @imgClick="imgClickHandler(tab, $event)"
            @titleClick="titleClickHandler(tab, $event)"
          />
        </RecycleScroller>
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script lang="ts">
import { SearchResult } from '@/models/searchResult'
import {
  AlbumEvents,
  ArtistEvents,
  GenreEvents,
  IpcEvents,
  PlaylistEvents,
  SearchEvents,
} from '@/utils/ipc/main/constants'
import { ipcRendererHolder } from '@/utils/ipc/renderer'
import { Component, Watch } from 'vue-property-decorator'
import SingleSearchResult from '@/mainWindow/components/generic/SingleSearchResult.vue'
import { Album } from '@/models/albums'
import { artists } from '@/models/artists'
import { Genre } from '@/models/genre'
import { Playlist } from '@/models/playlists'
import { Song } from '@/models/songs'
import PlayerControls from '@/utils/mixins/PlayerControls'
import { mixins } from 'vue-class-component'
import RouterPushes from '@/utils/mixins/RouterPushes'
import { YoutubeItem } from '@/models/youtube'

@Component({
  components: {
    SingleSearchResult,
  },
})
export default class SearchPage extends mixins(PlayerControls, RouterPushes) {
  private term: string = ''
  private tab = null
  private result: SearchResult | null = null
  private items = [
    { tab: 'Songs' },
    { tab: 'Albums' },
    { tab: 'Artists' },
    { tab: 'Genres' },
    { tab: 'Playlists' },
    { tab: 'Youtube' },
  ]

  private fetchData() {
    ipcRendererHolder
      .send<SearchResult>(IpcEvents.SEARCH, {
        type: SearchEvents.SEARCH_ALL,
        params: { searchTerm: this.term },
      })
      .then((result) => {
        this.result = result
        console.log(this.result)
      })
  }

  private ComputeTabContent(tab: string) {
    if (this.result) {
      switch (tab) {
        case 'Songs':
          return this.result.songs || []
        case 'Albums':
          return this.result.albums || []
        case 'Artists':
          return this.result.artists || []
        case 'Genres':
          return this.result.genres || []
        case 'Playlists':
          return this.result.playlists || []
        case 'Youtube':
          return this.result.youtube || []
      }
    }
    return []
  }

  private ComputeTabTitle(tab: string, item: Song | Album | artists | Genre | Playlist) {
    if (item) {
      switch (tab) {
        case 'Songs':
          return (item as Song).title
        case 'Albums':
          return (item as Album).album_name
        case 'Artists':
          return (item as artists).artist_name
        case 'Genres':
          return (item as Genre).genre_name
        case 'Playlists':
          return (item as Playlist).playlist_name
        case 'Youtube':
          return (item as YoutubeItem).yt_title
      }
    }
    return ''
  }

  private ComputeTabSubTitle(tab: string, item: Song | Album | artists | Genre | Playlist) {
    if (item) {
      switch (tab) {
        case 'Songs':
          return (item as Song).artists ? (item as Song).artists!.join(', ') : ''
        case 'Albums':
          return `${(item as Album).album_song_count} Songs`
        case 'Artists':
          return `${(item as artists).artist_song_count} Songs`
        case 'Genres':
          return `${(item as Genre).genre_song_count} Songs`
        case 'Playlists':
          return `${(item as Playlist).playlist_songs} Songs`
        case 'Youtube':
          return `${(item as YoutubeItem).yt_album} - ${(item as YoutubeItem).yt_artist}`
      }
    }
    return ''
  }

  private ComputeTabImage(tab: string, item: Song | Album | artists | Genre | Playlist) {
    if (item) {
      switch (tab) {
        case 'Songs':
          return (item as Song).album ? (item as Song).album!.album_coverPath : ''
        case 'Albums':
          return (item as Album).album_coverPath
        case 'Artists':
          return (item as artists).artist_coverPath
        case 'Genres':
          return ''
        case 'Playlists':
          return (item as Playlist).playlist_coverPath
        case 'Youtube':
          return (item as YoutubeItem).yt_coverImage
      }
    }
    return ''
  }

  private titleClickHandler(tab: string, item: any) {
    switch (tab) {
      case 'Songs':
        // TODO: Redirect to a seperate page with song details
        return
      case 'Albums':
        this.gotoAlbum(item as Album)
        return
      case 'Artists':
        this.gotoArtist(item as artists)
        return
      case 'Genres':
        this.gotoGenre(item as Genre)
        return ''
      case 'Playlists':
        this.gotoPlaylist(item as Playlist)
        return
    }
  }

  private imgClickHandler(tab: string, item: any) {
    switch (tab) {
      case 'Songs':
        this.playTop(item as Song)
        return
      case 'Albums':
        this.playAlbum(item as Album)
        return
      case 'Artists':
        this.playArtist(item as artists)
        return
      case 'Genres':
        this.playGenre(item as Genre)
        return ''
      case 'Playlists':
        this.playPlaylist(item as Playlist)
        return
      case 'Youtube':
        this.playYoutube(item as YoutubeItem)
    }
  }

  private playAlbum(item: Album) {
    ipcRendererHolder
      .send<Song[]>(IpcEvents.ALBUM, { type: AlbumEvents.GET_ALBUM, params: { id: item.album_id } })
      .then((songs) =>
        songs.forEach((value) => {
          this.queueSong(value)
        })
      )
  }

  private playArtist(item: artists) {
    ipcRendererHolder
      .send<Song[]>(IpcEvents.ARTIST, { type: ArtistEvents.GET_ARTIST, params: { id: item.artist_id } })
      .then((songs) =>
        songs.forEach((value) => {
          this.queueSong(value)
        })
      )
  }

  private playGenre(item: Genre) {
    ipcRendererHolder
      .send<Song[]>(IpcEvents.GENRE, { type: GenreEvents.GET_GENRE, params: { id: item.genre_id } })
      .then((songs) =>
        songs.forEach((value) => {
          console.log(value)
          this.queueSong(value)
        })
      )
  }

  private playPlaylist(item: Playlist) {
    ipcRendererHolder
      .send<Song[]>(IpcEvents.PLAYLIST, { type: PlaylistEvents.GET_PLAYLIST, params: { id: item.playlist_id } })
      .then((songs) =>
        songs.forEach((value) => {
          this.queueSong(value)
        })
      )
  }

  private playYoutube(item: YoutubeItem) {
    this.playTop({
      _id: item._id,
      title: item.yt_title,
      album: {
        album_name: item.yt_album,
        album_coverPath: item.yt_coverImage,
      },
      artists: [item.yt_artist],
      duration: item.duration,
      type: 'YOUTUBE',
      url: item._id,
    })
  }

  created() {
    this.term = this.$route.query['search_term'] as string
    this.fetchData()
  }

  @Watch('$route.query.search_term') onTermChanged(newValue: string) {
    this.term = newValue
    this.fetchData()
  }
}
</script>

<style lang="sass" scoped>
.tab-content, .tab-holder, .tab-content-holder
  background: var(--primary)

.tab-content-holder
  height: calc(100% - 16px)

.tab-content
  height: 100%

.fixed-tabs-bar .v-tabs__bar
  position: -webkit-sticky
  position: sticky
  top: 4rem
  z-index: 2


.search-content
  margin-left: 30px
  margin-top: 30px
  overflow: hidden

.scroller
  height: 100%
  &::-webkit-scrollbar-track
    margin-top: 0
    background: var(--primary)
</style>
