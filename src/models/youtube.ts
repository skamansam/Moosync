import { Song } from '@/models/songs'
import { v4 } from 'uuid'
export interface YoutubeItem {
  _id: string
  yt_title: string
  yt_album?: string
  yt_artist?: string
  yt_coverImage?: string
  duration: number
}

export function toSong(...item: YoutubeItem[]): Song[] {
  let songs: Song[] = []
  for (const s of item) {
    songs.push({
      _id: v4(),
      title: s.yt_title ? s.yt_title.trim() : '',
      album: {
        album_name: s.yt_album ? s.yt_album.trim() : '',
        album_coverPath: s.yt_coverImage?.replace('w60', 'w300').replace('h60', 'h300')!,
      },
      artists: s.yt_artist ? s.yt_artist.trim().split(/,|&/) : [],
      duration: s.duration,
      url: s._id.trim(),
      type: 'YOUTUBE',
    })
  }
  return songs
}
