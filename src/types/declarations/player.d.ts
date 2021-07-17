type AudioType = 'STREAMING' | 'LOCAL'

type PlayerState = 'PLAYING' | 'PAUSED' | 'STOPPED' | 'LOADING'

type PlayerType = 'LOCAL' | 'YOUTUBE'

interface SongQueue {
  data: { [id: string]: Song }
  order: { id: string, songID: string }[]
  index: number
}


type playlistInfo = { [key: string]: string }
