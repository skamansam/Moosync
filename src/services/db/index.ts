import { app } from 'electron'
import * as path from 'path'
import { marshaledSong, Song } from '@/models/songs'
import { Databases } from './constants'
import DB, { BetterSqlite3Helper } from 'better-sqlite3-helper'
import { v4 } from 'uuid'
import { Album } from '@/models/albums'
import { artists } from '@/models/artists'
import { Playlist } from '../../models/playlists'

function unMarshalSong(dbSong: marshaledSong): Song {
  return {
    _id: dbSong._id,
    path: dbSong.path,
    size: dbSong.size,
    title: dbSong.title,
    album: {
      album_id: dbSong.album_id,
      album_name: dbSong.album_name,
      album_coverPath: dbSong.album_coverPath,
    },
    date: dbSong.date,
    year: dbSong.year,
    artists: dbSong.artist_name ? dbSong.artist_name.split(',') : [],
    genre: dbSong.genre_name ? dbSong.genre_name.split(',') : [],
    lyrics: dbSong.lyrics,
    releaseType: undefined,
    bitrate: dbSong.bitrate,
    codec: dbSong.codec,
    container: dbSong.container,
    duration: dbSong.duration,
    sampleRate: dbSong.sampleRate,
    hash: dbSong.hash,
    inode: '',
    deviceno: '',
  }
}

function marshalSong(song: Song): marshaledSong {
  return {
    _id: v4(),
    path: song.path,
    size: song.size,
    title: song.title,
    date: song.date,
    year: song.year,
    lyrics: song.lyrics,
    // releaseType: newDoc.releaseType,
    bitrate: song.bitrate,
    codec: song.codec,
    container: song.container,
    duration: song.duration,
    sampleRate: song.sampleRate,
    hash: song.hash,
    inode: song.inode,
    deviceno: song.deviceno,
  }
}

let switchConnection = (dbString: string) => {
  switch (dbString) {
    case Databases.SONG:
      return 'songs.db'
    case Databases.ALBUMS:
      return 'albums.db'
  }
  return 'undefined.db'
}

export class SongDBInstance {
  private db: BetterSqlite3Helper.DBInstance

  constructor() {
    this.db = DB({
      path: path.join(app.getPath('appData'), app.getName(), 'databases', switchConnection(Databases.SONG)),
      readonly: false,
      fileMustExist: false,
      WAL: false,
      migrate: {
        migrations: [
          `-- Up
        CREATE TABLE artists (
          artist_id VARCHAR(36) PRIMARY KEY,
          artist_mbid TEXT,
          artist_name TEXT,
          artist_coverPath TEXT
        );

        CREATE TABLE genre (
          genre_id VARCHAR(36) PRIMARY KEY,
          genre_name text
        );

        CREATE TABLE albums (
          album_id VARCHAR(36) PRIMARY KEY,
          album_name TEXT,
          album_artist TEXT,
          album_coverPath TEXT
        );

        CREATE TABLE allsongs (
          _id VARCHAR(36) PRIMARY KEY,
          path TEXT,
          size TEXT NOT NULL,
          inode TEXT NOT NULL,
          deviceno TEXT NOT NULL,
          title TEXT,
          date TEXT,
          year TEXT,
          lyrics TEXT,
          releaseType TEXT,
          bitrate NUMBER,
          codec TEXT,
          container TEXT,
          duration NUMBER,
          sampleRate NUMBER,
          hash TEXT
        );

        CREATE TABLE artists_bridge (
          id integer PRIMARY KEY AUTOINCREMENT,
          song VARCHAR(36),
          artist VARCHAR(36),
          FOREIGN KEY(song) REFERENCES allsongs(_id),
          FOREIGN KEY(artist) REFERENCES artists(artist_id)
        );

        CREATE TABLE genre_bridge (
          id integer PRIMARY KEY AUTOINCREMENT,
          song VARCHAR(36),
          genre VARCHAR(36),
          FOREIGN KEY(song) REFERENCES allsongs(_id),
          FOREIGN KEY(genre) REFERENCES genre(genre_id)
        );

        CREATE TABLE album_bridge (
          id integer PRIMARY KEY AUTOINCREMENT,
          song VARCHAR(36),
          album VARCHAR(36),
          FOREIGN KEY(song) REFERENCES allsongs(_id),
          FOREIGN KEY(album) REFERENCES albums(album_id)
        );

        -- Down
        DROP TABLE IF EXISTS 'allsongs';
        DROP TABLE IF EXISTS 'artists';
        DROP TABLE IF EXISTS 'genre';
        DROP TABLE IF EXISTS 'albums';
        DROP TABLE IF EXISTS 'artists_bridge';
        DROP TABLE IF EXISTS 'genre_bridge';
        DROP TABLE IF EXISTS 'album_bridge';
      `,
          `-- Up
        CREATE TABLE playlists (
          playlist_id integer PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          coverPath TEXT
        );

        CREATE TABLE playlist_bridge (
          id integer PRIMARY KEY AUTOINCREMENT,
          song VARCHAR(36),
          playlist VARCHAR(36),
          FOREIGN KEY(song) REFERENCES allsongs(_id),
          FOREIGN KEY(playlist) REFERENCES genre(playlist_id)
        );

        -- Down
        DROP TABLE IF EXISTS 'playlists';
        DROP TABLE IF EXISTS 'playlist_bridge';
          `,
        ],
      },
    })
  }

  private pushIfUnique(tag: 'artists' | 'genre', list: string[] | undefined, song: Song) {
    if (song[tag]) {
      for (let s of list!) {
        if (!song[tag]!.includes(s)) song[tag]!.push(s)
      }
    } else {
      song[tag] = list
    }
  }

  private mergeSongs(marshaled: marshaledSong[]) {
    let unmarshaled: { [key: string]: Song } = {}
    for (let m of marshaled) {
      let song = unMarshalSong(m)
      if (unmarshaled[song._id!]) {
        // Merge all duplicate values
        this.pushIfUnique('artists', song.artists, unmarshaled[song._id!])
        this.pushIfUnique('genre', song.genre, unmarshaled[song._id!])
      } else {
        unmarshaled[song._id!] = song
      }
    }
    return unmarshaled
  }

  private flattenDict(dict: { [key: string]: Song }) {
    let final = []
    for (let n in dict) {
      final.push(dict[n])
    }
    return final
  }

  public async getAllSongs(): Promise<Song[]> {
    let marshaled: marshaledSong[] = this.db.query(
      `SELECT P.*, S.*, T.*, V.* FROM allsongs P 
        LEFT JOIN genre_bridge Q ON P._id = Q.song
        LEFT JOIN genre T ON T.genre_id = Q.genre
        LEFT JOIN artists_bridge B ON P._id = B.song 
        LEFT JOIN artists S ON S.artist_id = B.artist
        LEFT JOIN album_bridge U ON P._id = U.song 
        LEFT JOIN albums V ON V.album_id = U.album
        `
    )
    return this.flattenDict(this.mergeSongs(marshaled))
  }

  public async getAllAlbums(): Promise<Album[]> {
    return this.db.query(`SELECT * from albums`)
  }

  public async getAllArtists(): Promise<artists[]> {
    return this.db.query(`SELECT * FROM artists`)
  }

  public async getDefaultCoverByArtist(id: string): Promise<string | undefined> {
    return (this.db.queryFirstRow(
      `SELECT album_coverPath from albums WHERE album_id = (SELECT album FROM album_bridge WHERE song = (SELECT song FROM artists_bridge WHERE artist = ?))`,
      id
    ) as marshaledSong).album_coverPath
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

  private storeArtistBridge(artistID: string[], songID: string) {
    for (let i of artistID) {
      this.db.insert('artists_bridge', { song: songID, artist: i })
    }
  }

  private storeGenreBridge(genreID: string[], songID: string) {
    for (let i of genreID) {
      this.db.insert('genre_bridge', { song: songID, genre: i })
    }
  }

  private storeAlbumBridge(albumID: string, songID: string) {
    if (albumID) this.db.insert('album_bridge', { song: songID, album: albumID })
  }

  public async store(newDoc: Song): Promise<void> {
    let artistID = newDoc.artists ? this.storeArtists(...newDoc.artists) : []
    let albumID = newDoc.album ? this.storeAlbum(newDoc.album) : ''
    let genreID = this.storeGenre(newDoc.genre)
    let marshaledSong = marshalSong(newDoc)
    this.db.insert('allsongs', marshaledSong)
    this.storeArtistBridge(artistID, marshaledSong._id)
    this.storeGenreBridge(genreID, marshaledSong._id)
    this.storeAlbumBridge(albumID, marshaledSong._id)
    return
  }

  public async getPlaylists(): Promise<Playlist[]> {
    return this.db.query(`SELECT * FROM playlists`)
  }

  public async getPlaylistSongs(id: string) {
    //TODO: Get songs for single playlist
  }

  public async createPlaylist(name: string): Promise<void> {
    this.db.insert('playlists', { name: name })
  }

  public async addInPlaylist(playlist: string, ...songs: string[]) {
    //Todo: Use transactions
    for (let s in songs) {
      this.db.insert('playlist_bridge', { playlist: playlist, song: s })
    }
  }

  public async getGenres() {
    return this.db.query(`SELECT * FROM genre`)
  }

  public async removeFromPlaylist(playlist: string, ...songs: string[]) {
    //Todo: Use transactions
    for (let s in songs) {
      this.db.delete('playlist_bridge', { playlist: playlist, song: s })
    }
  }
}

export const SongDB = new SongDBInstance()
