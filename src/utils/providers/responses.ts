

// These are only the resources used 
export enum ApiResources {
  CHANNELS = 'channels',
  PLAYLISTS = 'playlists',
  PLAYLIST_ITEMS = 'playlistItems',
  VIDEO_DETAILS = 'videos'
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
    maxResults?: number
    pageToken?: string | undefined
  }
}

export type PlaylistItemsRequest = {
  params: {
    part: ['id', 'snippet'?]
    maxResults: number
    playlistId: String,
    pageToken?: string | undefined
  }
}

export type VideoDetailsRequest = {
  params: {
    part: ['contentDetails', 'snippet']
    id: string[]
    maxResults: number
  }
}

export type SearchObject<T extends ApiResources> = T extends ApiResources.CHANNELS
  ? ChannelRequest
  : T extends ApiResources.PLAYLISTS
  ? PlaylistRequest
  : T extends ApiResources.PLAYLIST_ITEMS
  ? PlaylistItemsRequest
  : T extends ApiResources.VIDEO_DETAILS
  ? VideoDetailsRequest
  : undefined


export namespace Thumbnails {
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
export namespace PlaylistItems {
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

  export interface Items {
    kind: string;
    etag: string;
    id: string;
    snippet?: Snippet;
  }

  export interface PlaylistItems {
    kind: string;
    etag: string;
    nextPageToken?: string,
    prevPageToken?: string,
    items: Items[];
    pageInfo: PageInfo;
  }

}

export namespace UserPlaylists {

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
    nextPageToken?: string;
    prevPageToken?: string,
    pageInfo: PageInfo;
    items: Item[];
  }
}
export interface Localized {
  title: string;
  description: string;
}

export namespace ChannelInfo {


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

export namespace VideoDetails {

  export interface RegionRestriction {
    allowed: string[];
  }

  export interface ContentRating {
  }

  export interface ContentDetails {
    duration: string;
    dimension: string;
    definition: string;
    caption: string;
    licensedContent: boolean;
    regionRestriction: RegionRestriction;
    contentRating: ContentRating;
    projection: string;
  }

  export interface Item {
    kind: string;
    etag: string;
    id: string;
    contentDetails: ContentDetails;
    snippet: Snippet
  }

  export interface Snippet {
    publishedAt: Date;
    channelId: string;
    title: string;
    description: string;
    thumbnails: Thumbnails.Thumbnails;
    channelTitle: string;
    tags: string[];
    categoryId: string;
    liveBroadcastContent: string;
    localized: Localized;
  }

  export interface VideoDetails {
    kind: string,
    etag: string,
    nextPageToken?: string,
    prevPageToken?: string,
    items: Item[],
    pageInfo: PageInfo,
  }
}



export type ResponseType<T extends ApiResources> = T extends ApiResources.CHANNELS
  ? ChannelInfo.ChannelInfo
  : T extends ApiResources.PLAYLISTS
  ? UserPlaylists.UserPlaylists
  : T extends ApiResources.PLAYLIST_ITEMS
  ? PlaylistItems.PlaylistItems
  : T extends ApiResources.VIDEO_DETAILS
  ? VideoDetails.VideoDetails
  : undefined
