

// These are only the resources used 
export enum ApiResources {
  CHANNELS = 'channels',
  PLAYLISTS = 'playlists',
  PLAYLIST_ITEMS = 'playlistItems'
}

export type ChannelRequest = {
  params: {
    part: ['id', 'snippet'?]
    mine: true
  }
}

export type PlaylistRequest = {
  params: {
    part: ['id', 'snippet'?]
    mine: true
  }
}

export type PlaylistItemsRequest = {
  params: {
    part: ['id', 'snippet'?]
    maxResults: Number
    playlistId: String
  }
}

export type SearchObject<T extends ApiResources> = T extends ApiResources.CHANNELS
  ? ChannelRequest
  : T extends ApiResources.PLAYLISTS
  ? PlaylistRequest
  : T extends ApiResources.PLAYLIST_ITEMS
  ? PlaylistItemsRequest
  : undefined


declare namespace Thumbnails {
  export interface ThumbDefault {
    url: string;
    width: number;
    height: number;
  }

  export interface ThumbMedium {
    url: string;
    width: number;
    height: number;
  }

  export interface ThumbHigh {
    url: string;
    width: number;
    height: number;
  }

  export interface ThumbStandard {
    url: string;
    width: number;
    height: number;
  }

  export interface ThumbMaxres {
    url: string;
    width: number;
    height: number;
  }

  export interface Thumbnails {
    default: ThumbDefault;
    medium: ThumbMedium;
    high: ThumbHigh;
    standard: ThumbStandard;
    maxres: ThumbMaxres;
  }
}

export interface PageInfo {
  totalResults: number;
  resultsPerPage: number;
}
declare namespace PlaylistItems {
  export interface ResourceId {
    kind: string;
    videoId: string;
  }

  export interface Snippet {
    publishedAt: Date;
    channelId: string;
    title: string;
    description: string;
    thumbnails: Thumbnails.Thumbnails;
    channelTitle: string;
    playlistId: string;
    position: number;
    resourceId: ResourceId;
    videoOwnerChannelTitle: string;
    videoOwnerChannelId: string;
  }

  export interface PlaylistDetails {
    kind: string;
    etag: string;
    id: string;
    snippet?: Snippet;
  }

  export interface PlaylistItems {
    kind: string;
    etag: string;
    nextPageToken: string;
    items: PlaylistDetails[];
    pageInfo: PageInfo;
  }

}

declare namespace UserPlaylists {

  export interface Localized {
    title: string;
    description: string;
  }

  export interface Snippet {
    publishedAt: Date;
    channelId: string;
    title: string;
    description: string;
    thumbnails: Thumbnails.Thumbnails;
    channelTitle: string;
    localized: Localized;
  }

  export interface Item {
    kind: string;
    etag: string;
    id: string;
    snippet?: Snippet;
  }

  export interface UserPlaylists {
    kind: string;
    etag: string;
    nextPageToken: string;
    pageInfo: PageInfo;
    items: Item[];
  }
}

declare namespace ChannelInfo {

  export interface Localized {
    title: string;
    description: string;
  }

  export interface Snippet {
    title: string;
    description: string;
    publishedAt: Date;
    thumbnails: Thumbnails.Thumbnails;
    localized: Localized;
  }

  export interface Item {
    kind: string;
    etag: string;
    id: string;
    snippet?: Snippet;
  }

  export interface ChannelInfo {
    kind: string;
    etag: string;
    pageInfo: PageInfo;
    items: Item[];
  }
}

export type ResponseType<T extends ApiResources> = T extends ApiResources.CHANNELS
  ? ChannelInfo.ChannelInfo
  : T extends ApiResources.PLAYLISTS
  ? UserPlaylists.UserPlaylists
  : T extends ApiResources.PLAYLIST_ITEMS
  ? PlaylistItems.PlaylistItems
  : undefined
