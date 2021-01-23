import { app } from 'electron'
import AsyncNedb from 'nedb-async'
import * as path from 'path'
import { miniSong, Song } from '@/models/songs'

let switchConnection = (dbString: string) => {
  switch (dbString) {
    case 'songs':
      return 'files.db'
    case 'minisong':
      return 'mini.db'
  }
  return 'undefined'
}

export class SongDBInstance {
  private db = new AsyncNedb<Song>({
    filename: path.join(app.getPath('appData'), app.getName(), 'db', switchConnection('songs')),
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

export class MiniSongDbInstance {
  private db = new AsyncNedb<miniSong>({
    filename: path.join(app.getPath('appData'), app.getName(), 'db', switchConnection('minisong')),
    autoload: true,
  })

  public async getAll(): Promise<miniSong[]> {
    return this.db.asyncFind({})
  }

  public async countByHash(hash: string): Promise<number> {
    return this.db.asyncCount({ hash: hash }) as Promise<number>
  }

  public async store(newDoc: miniSong): Promise<miniSong> {
    return this.db.asyncInsert(newDoc)
  }
}
