import { Song } from '@/utils/models/songs'
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class ModelHelper extends Vue {
  public isAlbumCoverExists(song: Song | null) {
    return song && song.album && song.album.album_coverPath
  }

  public isAlbumExists(song: Song | null) {
    return song && song.album
  }

  public isArtistExists(song: Song | null) {
    return song && song.artists
  }

  public getImg(song: Song | null): String {
    return this.isAlbumExists(song) && song!.album!.album_coverPath ? song!.album!.album_coverPath : ''
  }

  public getAlbumName(song: Song | null): String {
    return this.isAlbumExists(song) ? song!.album!.album_name! : ''
  }

  public getArtists(song: Song | null) {
    return this.isArtistExists(song) ? song!.artists!.join(', ') : '-'
  }
}
