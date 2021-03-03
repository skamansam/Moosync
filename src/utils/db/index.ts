import { Song, marshaledSong } from '@/models/songs'

import { Album } from '../../models/albums'
import { DBUtils } from './utils'
import { Genre } from '@/models/genre'
import { Playlist } from '../../models/playlists'
import { SearchResult } from '../../models/searchResult'
import { artists } from '@/models/artists'
import { v4 } from 'uuid'

export class SongDBInstance extends DBUtils {
  /* ============================= 
                ALLSONGS
     ============================= */

  public async getAllSongs(exclude?: string[]): Promise<Song[]> {
    let marshaled: marshaledSong[] = this.db.query(
      `SELECT * FROM allsongs
      ${this.addLeftJoinClause(undefined, 'allsongs')}
      ${this.addExcludeWhereClause(true, exclude)}`
    )
    return this.flattenDict(this.mergeSongs(marshaled))
  }

  public async store(newDoc: Song): Promise<void> {
    let artistID = newDoc.artists ? this.storeArtists(...newDoc.artists) : []
    let albumID = newDoc.album ? this.storeAlbum(newDoc.album) : ''
    let genreID = this.storeGenre(newDoc.genre)
    let marshaledSong = this.marshalSong(newDoc)
    this.db.insert('allsongs', marshaledSong)
    this.storeArtistBridge(artistID, marshaledSong._id)
    this.storeGenreBridge(genreID, marshaledSong._id)
    this.storeAlbumBridge(albumID, marshaledSong._id)
    return
  }

  public async removeSong(song_id: string) {
    this.db.transaction((song_id: string) => {
      this.db.delete('artists_bridge', { song: song_id })
      this.db.delete('album_bridge', { song: song_id })
      this.db.delete('genre_bridge', { song: song_id })
      this.db.delete('playlist_bridge', { song: song_id })
      this.db.delete('allsongs', { _id: song_id })
    })(song_id)
  }

  public async searchSongs(term: string, exclude?: string[]): Promise<SearchResult> {
    let songs: marshaledSong[] = []
    songs = this.db.query(
      `SELECT * FROM allsongs
      ${this.addLeftJoinClause(undefined, 'allsongs')}
        WHERE allsongs.path LIKE ? 
        OR albums.album_name LIKE ?
        OR artists.artist_name LIKE ?
        ${this.addExcludeWhereClause(false, exclude)}`,
      `%${term}%`,
      `%${term}%`,
      `%${term}%`
    )
    return { songs: this.flattenDict(this.mergeSongs(songs)) }
  }

  public async countByHash(hash: string): Promise<number> {
    return new Promise((resolve) => {
      resolve(this.db.queryFirstCell(`SELECT COUNT(*) FROM allsongs WHERE hash = ?`, hash)!)
    })
  }

  public async getBySize(size: string): Promise<{ _id: string }[]> {
    return new Promise((resolve) => {
      resolve(this.db.query(`SELECT _id FROM allsongs WHERE size = ?`, size))
    })
  }

  public async getInfoByID(id: string): Promise<{ path: string; inode: string; deviceno: string }[]> {
    return this.db.query(`SELECT path, inode, deviceno FROM allsongs WHERE _id = ?`, id)
  }

  /* ============================= 
                ALBUMS
     ============================= */

  public async getAllAlbums(exclude?: string[]): Promise<Album[]> {
    return this.db.query(
      `SELECT * from albums A
        INNER JOIN album_bridge B ON A.album_id = B.album
        INNER JOIN allsongs C ON B.song = C._id
        ${this.addExcludeWhereClause(true, exclude)}
        GROUP BY A.album_id`
    )
  }

  public async getAlbumSongs(id: string, exclude?: string[]): Promise<Song[]> {
    let marshaled: marshaledSong[] = this.db.query(
      `SELECT * FROM album_bridge
      ${this.addLeftJoinClause('album_bridge', 'album')} 
      WHERE album_bridge.album = ? 
      ${this.addExcludeWhereClause(false, exclude)}`,
      id
    )
    return this.flattenDict(this.mergeSongs(marshaled))
  }

  private storeAlbum(album: Album): string {
    let id: string | undefined
    if (album.album_name) {
      id = this.db.queryFirstCell(
        `SELECT album_id FROM albums WHERE album_name = ? COLLATE NOCASE`,
        album.album_name.trim()
      )
      if (!id) {
        id = v4()
        this.db.insert('albums', {
          album_id: id,
          album_name: album.album_name.trim(),
          album_coverPath: album.album_coverPath,
        })
      }
    }
    return id as string
  }

  private storeAlbumBridge(albumID: string, songID: string) {
    if (albumID) this.db.insert('album_bridge', { song: songID, album: albumID })
  }

  /* ============================= 
                GENRE
     ============================= */

  public async getAllGenres(exclude?: string[]): Promise<Genre[]> {
    return this.db.query(
      `SELECT * from genre A
        INNER JOIN genre_bridge B ON A.genre_id = B.genre
        INNER JOIN allsongs C ON B.song = C._id
        ${this.addExcludeWhereClause(true, exclude)}
        GROUP BY A.genre_id`
    )
  }

  public async getGenreSongs(id: string, exclude?: string[]) {
    let marshaled: marshaledSong[] = this.db.query(
      `SELECT * FROM genre_bridge 
      ${this.addLeftJoinClause('genre_bridge', 'genre')}
      WHERE genre_bridge.genre = ? 
      ${this.addExcludeWhereClause(false, exclude)}`,
      id
    )
    return this.flattenDict(this.mergeSongs(marshaled))
  }

  private storeGenre(genre?: string[]) {
    let genreID: string[] = []
    if (genre) {
      for (let a of genre) {
        let id = this.db.queryFirstCell(`SELECT genre_id FROM genre WHERE genre_name = ? COLLATE NOCASE`, a)
        if (id) genreID.push(id)
        else {
          let id = v4()
          this.db.insert('genre', { genre_id: id, genre_name: a })
          genreID.push(id)
        }
      }
    }
    return genreID
  }

  private storeGenreBridge(genreID: string[], songID: string) {
    for (let i of genreID) {
      this.db.insert('genre_bridge', { song: songID, genre: i })
    }
  }

  public async getGenres() {
    return this.db.query(`SELECT * FROM genre`)
  }

  /* ============================= 
                ARTISTS
     ============================= */

  public async getAllArtists(exclude?: string[]): Promise<artists[]> {
    return this.db.query(
      `SELECT * FROM artists A
        INNER JOIN artists_bridge B ON A.artist_id = B.artist
        INNER JOIN allsongs C ON B.song = C._id
        ${this.addExcludeWhereClause(true, exclude)}
        GROUP BY A.artist_id`
    )
  }

  public async getArtistSongs(id: string, exclude?: string[]): Promise<Song[]> {
    let marshaled: marshaledSong[] = this.db.query(
      `SELECT * FROM artists_bridge 
      ${this.addLeftJoinClause('artists_bridge', 'artists')}  
      WHERE artists_bridge.artist = ? 
      ${this.addExcludeWhereClause(false, exclude)}`,
      id
    )
    return this.flattenDict(this.mergeSongs(marshaled))
  }

  public async updateArtists(artist: artists) {
    return new Promise((resolve) => {
      resolve(
        this.db.updateWithBlackList(
          'artists',
          artist,
          ['artist_id = ?', artist.artist_id],
          ['artist_id', 'artist_name']
        )
      )
    })
  }

  private storeArtists(...artists: string[]): string[] {
    let artistID: string[] = []
    for (let a of artists) {
      let id = this.db.queryFirstCell(`SELECT artist_id FROM artists WHERE artist_name = ? COLLATE NOCASE`, a.trim())
      if (id) artistID.push(id)
      else {
        let id = v4()
        this.db.insert('artists', { artist_id: id, artist_name: a.trim() })
        artistID.push(id)
      }
    }
    return artistID
  }

  private storeArtistBridge(artistID: string[], songID: string) {
    for (let i of artistID) {
      this.db.insert('artists_bridge', { song: songID, artist: i })
    }
  }

  public async getDefaultCoverByArtist(id: string): Promise<string | undefined> {
    return (this.db.queryFirstRow(
      `SELECT album_coverPath from albums WHERE album_id = (SELECT album FROM album_bridge WHERE song = (SELECT song FROM artists_bridge WHERE artist = ?))`,
      id
    ) as marshaledSong).album_coverPath
  }

  /* ============================= 
                PLAYLISTS
     ============================= */

  public async getPlaylistSongs(id: string, exclude?: string[]) {
    let marshaled: marshaledSong[] = this.db.query(
      `SELECT * FROM playlist_bridge 
      ${this.addLeftJoinClause('playlist_bridge')} 
      WHERE playlist_bridge.playlist = ? 
      ${this.addExcludeWhereClause(false, exclude)}`,
      id
    )
    return this.flattenDict(this.mergeSongs(marshaled))
  }

  public async getPlaylists(): Promise<Playlist[]> {
    return this.db.query(`SELECT * FROM playlists`)
  }

  public async createPlaylist(name: string): Promise<void> {
    this.db.insert('playlists', { playlist_id: v4(), playlist_name: name })
  }

  public updatePlaylistCoverPath(playlist_id: string, coverPath: string) {
    this.db.update('playlists', { playlist_coverPath: coverPath }, ['playlist_id = ?', playlist_id])
  }

  private isPlaylistCoverExists(playlist_id: string) {
    return (
      (this.db.query(`SELECT playlist_coverPath FROM playlists WHERE playlist_id = ?`, playlist_id)[0] as Playlist)
        .playlist_coverPath !== null
    )
  }

  public async addToPlaylist(playlist_id: string, ...songs: Song[]) {
    let coverExists = this.isPlaylistCoverExists(playlist_id)
    this.db.transaction((songs: Song[]) => {
      for (let s of songs) {
        if (!coverExists) {
          if (s.album && s.album.album_coverPath) {
            this.updatePlaylistCoverPath(playlist_id, s.album.album_coverPath)
          }
        }
        this.db.insert('playlist_bridge', { playlist: playlist_id, song: s._id })
      }
    })(songs)
  }

  public async removeFromPlaylist(playlist: string, ...songs: string[]) {
    this.db.transaction((songs: string[]) => {
      for (let s in songs) {
        this.db.delete('playlist_bridge', { playlist: playlist, song: s })
      }
    })(songs)
  }
}

export const SongDB = new SongDBInstance()
