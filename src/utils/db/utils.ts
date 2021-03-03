import DB, { BetterSqlite3Helper } from 'better-sqlite3-helper'
import { Song, marshaledSong } from '@/models/songs'

import { app } from 'electron'
import { migrations } from './migrations'
import path from 'path'
import { v4 } from 'uuid'

export class DBUtils {
  protected db: BetterSqlite3Helper.DBInstance

  constructor() {
    this.db = DB({
      path: path.join(app.getPath('appData'), app.getName(), 'databases', 'songs.db'),
      readonly: false,
      fileMustExist: false,
      WAL: true,
      migrate: {
        migrations: migrations,
      },
    })
    this.registerRegexp()
  }

  protected unMarshalSong(dbSong: marshaledSong): Song {
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

  protected marshalSong(song: Song): marshaledSong {
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

  protected pushIfUnique(tag: 'artists' | 'genre', list: string[] | undefined, song: Song) {
    if (song[tag]) {
      for (let s of list!) {
        if (!song[tag]!.includes(s)) song[tag]!.push(s)
      }
    } else {
      song[tag] = list
    }
  }

  protected mergeSongs(marshaled: marshaledSong[]) {
    let unmarshaled: { [key: string]: Song } = {}
    for (let m of marshaled) {
      let song = this.unMarshalSong(m)
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

  protected flattenDict(dict: { [key: string]: Song }) {
    let final = []
    for (let n in dict) {
      final.push(dict[n])
    }
    return final
  }

  protected registerRegexp() {
    this.db.function('regexp', (pattern: string = '*', str: string) => {
      return str.match(new RegExp(pattern, 'i')) ? 1 : 0
    })
  }

  protected addExcludeWhereClause(where: boolean, exclude?: string[]): string {
    return exclude && exclude.length > 0
      ? `${where ? 'WHERE' : 'AND '} allsongs.path NOT REGEXP '${exclude.join('|')}'`
      : ''
  }

  private leftJoinSongs(bridgeTable?: string, exclude_table?: string) {
    if (exclude_table !== 'allsongs') {
      return ` LEFT JOIN allsongs ON ${bridgeTable}.song = allsongs._id`
    }
    return ''
  }

  private leftJoinAlbums(exclude_table?: string) {
    if (exclude_table !== 'album') {
      return ` LEFT JOIN album_bridge ON allsongs._id = album_bridge.song`
    }
    return ''
  }

  private leftJoinArtists(exclude_table?: string) {
    if (exclude_table !== 'artists') {
      return ` LEFT JOIN artists_bridge ON allsongs._id = artists_bridge.song`
    }
    return ''
  }

  private leftJoinGenre(exclude_table?: string) {
    if (exclude_table !== 'genre') {
      return ` LEFT JOIN genre_bridge ON allsongs._id = genre_bridge.song`
    }
    return ''
  }

  private leftJoinCommon(tableName: string, rowName: string, bridgeTable?: string) {
    return ` LEFT JOIN ${tableName} ON ${bridgeTable}.${rowName} = ${tableName}.${rowName}_id`
  }

  protected addLeftJoinClause(bridgeTable?: string, exclude_table?: 'album' | 'artists' | 'genre' | 'allsongs') {
    return (
      this.leftJoinSongs(bridgeTable, exclude_table) +
      this.leftJoinAlbums(exclude_table) +
      this.leftJoinArtists(exclude_table) +
      this.leftJoinGenre(exclude_table) +
      this.leftJoinCommon('albums', 'album', 'album_bridge') +
      this.leftJoinCommon('artists', 'artist', 'artists_bridge') +
      this.leftJoinCommon('genre', 'genre', 'genre_bridge')
    )
  }
}
