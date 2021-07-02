import { Component, Vue } from 'vue-property-decorator'

@Component
export default class ModelHelper extends Vue {
  public isCoverExists(song: Song | null) {
    return song && (song.song_coverPath || (song.album && song.album.album_coverPath))
  }

  public isAlbumExists(song: Song | null) {
    return song && song.album
  }

  public isArtistExists(song: Song | null) {
    return song && song.artists
  }

  public getImg(song: Song | null): string | undefined | null {
    if (song)
      return song.song_coverPath ?? (this.isAlbumExists(song) && song!.album!.album_coverPath)
    return ''
  }

  public getAlbumName(song: Song | null): String {
    return this.isAlbumExists(song) ? song!.album!.album_name! : ''
  }

  public getArtists(song: Song | null) {
    return this.isArtistExists(song) ? song!.artists!.join(', ') : '-'
  }
}
