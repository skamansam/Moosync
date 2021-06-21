import { Component, Vue } from 'vue-property-decorator'

@Component
export default class PlayerControls extends Vue {
  public gotoAlbum(album: Album) {
    this.$router.push({
      name: 'albums-id',
      params: {
        album_id: album.album_id!,
        album_name: album.album_name!,
        album_coverPath: album.album_coverPath ? album.album_coverPath : '',
      },
    })
  }

  public gotoGenre(genre: Genre) {
    this.$router.push({
      name: 'genre-id',
      params: {
        genre_id: genre.genre_id!,
        genre_name: genre.genre_name!,
      },
    })
  }

  public gotoArtist(artist: artists) {
    this.$router.push({
      name: 'artists-id',
      params: {
        artist_id: artist.artist_id!,
        artist_name: artist.artist_name!,
        artist_coverPath: artist.artist_coverPath ? artist.artist_coverPath : '',
      },
    })
  }

  public gotoPlaylist(playlist: Playlist) {
    this.$router.push({
      name: 'playlists-id',
      params: {
        playlist_id: playlist.playlist_id,
        playlist_name: playlist.playlist_name!,
        playlist_coverPath: playlist.playlist_coverPath!,
        isYoutubePlaylist: playlist.playlist_id.startsWith('youtube-').toString(),
        isSpotifyPlaylist: playlist.playlist_id.startsWith('spotify-').toString(),
      },
    })
  }
}
