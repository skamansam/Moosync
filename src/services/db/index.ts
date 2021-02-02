import { app } from 'electron'
import AsyncNedb from 'nedb-async'
import * as path from 'path'
import { Song } from '@/models/songs'
import { Databases } from './constants'

let switchConnection = (dbString: string) => {
  switch (dbString) {
    case Databases.SONG:
      return 'songs.db'
    case Databases.COVER:
      return 'covers.db'
  }
  return 'undefined.db'
}

class SongDBInstance {
  private db = new AsyncNedb<Song>({
    filename: path.join(app.getPath('appData'), app.getName(), 'db', switchConnection(Databases.SONG)),
    autoload: true,
  })

  public async getAll(): Promise<Song[]> {
    return this.db.asyncFind({})
  }

  public async countByHash(hash: string): Promise<number> {
    return this.db.asyncCount({ hash: hash }) as Promise<number>
  }

  public async store(newDoc: Song): Promise<Song> {
    return this.db.asyncInsert(newDoc)
  }

  public async getByID(id: string): Promise<Song> {
    return this.db.asyncFindOne({ _id: id })
  }
}

export const SongDB = new SongDBInstance()
