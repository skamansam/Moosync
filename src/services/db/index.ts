import { app } from 'electron'
import AsyncNedb from 'nedb-async'
import * as path from 'path'
import { Song } from '@/services/files/info'

let switchConnection = (dbString: string) => {
  switch (dbString) {
    case 'songs':
      return 'files.db'
  }
  return 'undefined'
}

export class SongDBInstance {
  private db = new AsyncNedb<Song>({
    filename: path.join(app.getPath('appData'), app.getName(), 'db', switchConnection('songs')),
    autoload: true,
  })

  public getAll(): Song[] {
    return this.db.getAllData() as Song[]
  }

  public async countByHash(hash: string): Promise<number> {
    return this.db.asyncCount({ hash: hash }) as Promise<number>
  }

  public async store(newDoc: Song): Promise<Song> {
    return this.db.asyncInsert(newDoc)
  }
}
