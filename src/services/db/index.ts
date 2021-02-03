import { app } from 'electron'
import * as path from 'path'
import { Song } from '@/models/songs'
import { Databases } from './constants'
import DB from 'better-sqlite3-helper'
import { v4 } from 'uuid'

interface marshaledSong {
  _id: string
  path: string
  coverPath: string | undefined
  title: string
  album: string | undefined
  lyrics: string | undefined
  artist_name?: string
  artists_id?: string
  genre_name?: string
  genere_id?: string
  date: string | undefined
  year: number | undefined
  bitrate: number | undefined
  codec: string | undefined
  container: string | undefined
  duration: number | undefined
  sampleRate: number | undefined
  hash: string
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

class SongDBInstance {
  private db = DB({
    path: path.join(app.getPath('appData'), app.getName(), 'db', switchConnection(Databases.SONG)),
    readonly: false,
    fileMustExist: false,
    WAL: false,
    migrate: {
      migrations: [
        `-- Up
        CREATE TABLE artists (
          artist_id VARCHAR(36) PRIMARY KEY,
          artist_name text
        );

        CREATE TABLE genre (
          genre_id VARCHAR(36) PRIMARY KEY,
          genre_name text
        );

        CREATE TABLE allsongs (
          _id VARCHAR(36) PRIMARY KEY,
          path TEXT,
          coverPath TEXT,
          title TEXT,
          album TEXT,
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

        -- Down
        DROP TABLE IF EXISTS 'allsongs';
      `,
      ],
    },
  })

  public async getAll(): Promise<Song[]> {
    return new Promise((resolve, reject) => {
      let marshaled = this.db.query(
        `SELECT P.*, S.*, T.* FROM allsongs P 
        LEFT JOIN genre_bridge Q ON P._id = Q.song
        LEFT JOIN genre T ON T.genre_id = Q.genre
        LEFT JOIN artists_bridge B ON P._id = B.song 
        LEFT JOIN artists S ON S.artist_id = B.artist
        `
      )
      let unmarshaled: { [key: string]: Song } = {}
      for (let m of marshaled) {
        let song = this.unMarshalSong(m as marshaledSong)
        if (unmarshaled[song._id!]) {
          // Merge all duplicate values
          if (song.artists) {
            for (let a of song.artists) {
              if (!unmarshaled[song._id!].artists!.includes(a)) unmarshaled[song._id!].artists!.push(a)
            }
          }
          if (song.genre) {
            for (let a of song.genre) {
              if (!unmarshaled[song._id!].genre!.includes(a)) unmarshaled[song._id!].genre!.push(a)
            }
          }
        } else {
          unmarshaled[song._id!] = song
        }
      }

      let final = []
      for (let n in unmarshaled) {
        final.push(unmarshaled[n])
      }
      resolve(final)
    })
  }

  public async countByHash(hash: string): Promise<number> {
    return new Promise((resolve, reject) => {
      resolve(this.db.queryFirstCell(`SELECT COUNT(*) FROM allsongs WHERE hash = ?`, hash)!)
    })
  }

  private unMarshalSong(dbSong: marshaledSong): Song {
    return {
      _id: dbSong._id,
      path: dbSong.path,
      coverPath: dbSong.coverPath,
      title: dbSong.title,
      album: dbSong.album,
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
    }
  }

  private marshalSong(song: Song): marshaledSong {
    return {
      _id: v4(),
      path: song.path,
      coverPath: song.coverPath,
      title: song.title,
      album: song.album,
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
    }
  }

  private storeArtists(artists?: string[]) {
    let artistID: string[] = []
    if (artists) {
      for (let a of artists) {
        let id = this.db.queryFirstCell(`SELECT artist_id FROM artists WHERE artist_name = ?`, a)
        if (id) artistID.push(id)
        else {
          let id = v4()
          this.db.insert('artists', { artist_id: id, artist_name: a })
          artistID.push(id)
        }
      }
    }
    return artistID
  }

  private storeGenre(genre?: string[]) {
    let genreID: string[] = []
    if (genre) {
      for (let a of genre) {
        let id = this.db.queryFirstCell(`SELECT genre_id FROM genre WHERE genre_name = ?`, a)
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

  public async store(newDoc: Song): Promise<void> {
    let artistID = this.storeArtists(newDoc.artists)
    let genreID = this.storeGenre(newDoc.genre)
    let marshaledSong = this.marshalSong(newDoc)
    this.db.insert('allsongs', marshaledSong)
    this.storeArtistBridge(artistID, marshaledSong._id)
    this.storeGenreBridge(genreID, marshaledSong._id)
  }
}

export const SongDB = new SongDBInstance()
