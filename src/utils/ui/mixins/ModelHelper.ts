import { Component, Vue } from 'vue-property-decorator'

@Component
export default class ModelHelper extends Vue {
  public isAlbumExists(song: Song | null | undefined) {
    return song && song.album
  }

  public isArtistExists(song: Song | null | undefined) {
    return song && song.artists
  }

  public getAlbumName(song: Song | null | undefined): String {
    return this.isAlbumExists(song) ? song!.album!.album_name! : ''
  }

  public getArtists(song: Song | null | undefined) {
    return this.isArtistExists(song) ? song!.artists!.join(', ') : '-'
  }
}
