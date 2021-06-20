interface fragmentedData {
  type: string
  message: any
}

interface prefetchData {
  _id: string
  album: string
  artist: string
  sender: string
  type: 'LOCAL' | 'YOUTUBE' | 'SPOTIFY'
}