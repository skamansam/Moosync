import { Component, Vue } from 'vue-property-decorator'

@Component
export default class PlayerControls extends Vue {
  public gotoAlbum(album: Album) {
    this.$router.push({
      name: 'albums-id',
      params: {
        id: album.album_id!,
      },
    })
  }

  public gotoGenre(genre: Genre) {
    this.$router.push({
      name: 'genre-id',
      params: {
        id: genre.genre_id!,
      },
    })
  }

  public gotoArtist(artist: artists) {
    this.$router.push({
      name: 'artists-id',
      params: {
        id: artist.artist_id!,
      },
    })
  }

  public gotoPlaylist(playlist: Playlist) {
    this.$router.push({
      name: 'playlists-id',
      params: {
        id: playlist.playlist_id,
      },
    })
  }
}
