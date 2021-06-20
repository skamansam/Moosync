// These are only the resources used 
declare module SpotifyResponses {
  enum ApiResources {
    USER_DETAILS = 'me',
    PLAYLISTS = 'me/playlists',
    PLAYLIST_ITEMS = 'playlists/{playlist_id}/tracks',
    VIDEO_DETAILS = 'videos'
  }


  type ChannelRequest = {
    params: undefined
  }

  type PlaylistRequest = {
    params: {
      limit?: number
      offset?: number
    }
  }

  type PlaylistItemsRequest = {
    params: {
      playlist_id: string
      limit?: number
      offset?: number
    }
  }

  type VideoDetailsRequest = {
    params: {
      part: ['contentDetails', 'snippet']
      id: string[]
      maxResults: number
    }
  }

  type SearchObject<T extends ApiResources> = T extends ApiResources.USER_DETAILS
    ? ChannelRequest
    : T extends ApiResources.PLAYLISTS
    ? PlaylistRequest
    : T extends ApiResources.PLAYLIST_ITEMS
    ? PlaylistItemsRequest
    : T extends ApiResources.VIDEO_DETAILS
    ? VideoDetailsRequest
    : undefined

  interface Image {
    height?: any;
    url: string;
    width?: any;
  }

  namespace UserDetails {

    interface ExternalUrls {
      spotify: string;
    }

    interface Followers {
      href?: any;
      total: number;
    }

    interface UserDetails {
      country: string;
      display_name: string;
      email: string;
      external_urls: ExternalUrls;
      followers: Followers;
      href: string;
      id: string;
      images: Image[];
      product: string;
      type: string;
      uri: string;
    }
  }

  namespace UserPlaylists {

    interface ExternalUrls {
      spotify: string;
    }

    interface ExternalUrls2 {
      spotify: string;
    }

    interface Owner {
      external_urls: ExternalUrls2;
      href: string;
      id: string;
      type: string;
      uri: string;
    }

    interface Tracks {
      href: string;
      total: number;
    }

    interface Item {
      collaborative: boolean;
      external_urls: ExternalUrls;
      href: string;
      id: string;
      images: Image[];
      name: string;
      owner: Owner;
      public: boolean;
      snapshot_id: string;
      tracks: Tracks;
      type: string;
      uri: string;
    }

    interface UserPlaylists {
      href: string;
      items: Item[];
      limit: number;
      next?: string;
      offset: number;
      previous?: string;
      total: number;
    }
  }

  namespace PlaylistItems {

    interface ExternalUrls {
      spotify: string;
    }

    interface AddedBy {
      external_urls: ExternalUrls;
      href: string;
      id: string;
      type: string;
      uri: string;
    }

    interface ExternalUrls2 {
      spotify: string;
    }

    interface Artist {
      external_urls: ExternalUrls2;
      href: string;
      id: string;
      name: string;
      type: string;
      uri: string;
    }

    interface ExternalUrls3 {
      spotify: string;
    }

    interface Album {
      album_type: string;
      artists: Artist[];
      available_markets: string[];
      external_urls: ExternalUrls3;
      href: string;
      id: string;
      images: Image[];
      name: string;
      type: string;
      uri: string;
    }

    interface ExternalUrls4 {
      spotify: string;
    }

    interface Artist2 {
      external_urls: ExternalUrls4;
      href: string;
      id: string;
      name: string;
      type: string;
      uri: string;
    }

    interface ExternalIds {
      isrc: string;
    }

    interface ExternalUrls5 {
      spotify: string;
    }

    interface Track {
      album: Album;
      artists: Artist2[];
      available_markets: string[];
      disc_number: number;
      duration_ms: number;
      explicit: boolean;
      external_ids: ExternalIds;
      external_urls: ExternalUrls5;
      href: string;
      id: string;
      name: string;
      popularity: number;
      preview_url: string;
      track_number: number;
      type: string;
      uri: string;
    }

    interface Item {
      added_at: Date;
      added_by: AddedBy;
      is_local: boolean;
      track: Track;
    }

    interface PlaylistItems {
      href: string;
      items: Item[];
      limit: number;
      next: string | null;
      offset: number;
      previous: string | null;
      total: number;
    }
  }



  type ResponseType<T extends ApiResources> = T extends ApiResources.USER_DETAILS
    ? UserDetails.UserDetails
    : T extends ApiResources.PLAYLISTS
    ? UserPlaylists.UserPlaylists
    : T extends ApiResources.PLAYLIST_ITEMS
    ? PlaylistItems.PlaylistItems
    // : T extends ApiResources.VIDEO_DETAILS
    // ? VideoDetails.VideoDetails
    : undefined
}
