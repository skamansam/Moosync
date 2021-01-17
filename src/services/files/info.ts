import * as mm from 'music-metadata'
import { ExtendedIPicture } from '@/utils/types/musicmetadata'

export interface Song {
  title: string | undefined
  album: string | undefined
  artists: string[] | undefined
  date: string | undefined
  year: number | undefined
  genre: string[] | undefined
  lyrics: string[] | undefined
  releaseType: string[] | undefined
  bitrate: number | undefined
  codec: string | undefined
  container: string | undefined
  duration: number | undefined
  sampleRate: number | undefined
  cover: CoverImg | undefined
  hash: string
}

export interface CoverImg {
  data: ArrayBuffer | undefined
  description: string | undefined
  mime: string | undefined
  height: number | undefined
  width: number | undefined
  type: string | undefined
}

export function parseMetadata(data: mm.IAudioMetadata, hash: string): Song {
  let coverDetails: ExtendedIPicture[] | undefined = (data.common.picture as unknown) as ExtendedIPicture[]
  return {
    title: data.common.title,
    album: data.common.album,
    artists: data.common.artists,
    date: data.common.date,
    year: data.common.year,
    genre: data.common.genre,
    lyrics: data.common.lyrics,
    releaseType: data.common.releasetype,
    bitrate: data.format.bitrate,
    codec: data.format.codec,
    container: data.format.container,
    duration: data.format.duration,
    sampleRate: data.format.sampleRate,
    hash: hash,
    cover:
      data.common.picture !== undefined && data.common.picture.length > 0
        ? {
            data: coverDetails[0].data,
            description: coverDetails[0].description,
            mime: coverDetails[0].format,
            height: coverDetails[0].height,
            width: coverDetails[0].width,
            type: coverDetails[0].type,
          }
        : undefined,
  }
}
