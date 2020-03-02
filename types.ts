export interface PlaylistTrack {
  added_at: Date,
  added_by: SimplifiedUser,
  is_local: boolean,
  primary_color: any, // not sure what this is
  track: Track,
}

export interface SimplifiedUser {
  external_urls: any,
  href: string,
  id: number,
  type: string,
  uri: string,
}

export interface User {
  display_name: string,
  external_urls: any,
  followers: {
    href: any,
    total: number
  }
  href: string,
  id: number,
  images: Image[],
  type: string,
  uri: string,
}

export interface Track {
  album: SimplifiedAlbum,
  artists: SimplifiedArtist[],
  available_markets: string[],
  disc_number: number,
  duration_ms: number,
  episode: boolean,
  explicit: boolean,
  external_ids: any, // object
  external_urls: any,
  href: string,
  id: string,
  is_local: boolean,
  name: string,
  popularity: number, // 1 - 100
  preview_url: string,
  track: boolean,
  track_number: number,
  type: 'track',
  uri: string
}

export interface SimplifiedAlbum {
  album_group?: 'album' | 'single' | 'compilation' | 'appears_on',
  album_type: 'single' | 'album' | 'compilation',
  artists: SimplifiedArtist[],
  available_markets: string[],
  external_urls: any,
  href: string,
  id: string,
  images: Image[],
  name: string,
  release_date: string,
  release_date_precision: 'year' | 'month' | 'day',
  total_tracks: number,
  type: 'album',
  uri: string
}

export interface SimplifiedArtist {
  external_urls: any,
  href: string,
  id: string,
  name: string,
  type: 'artist',
  uri: string,
}

export interface Image {
  height: number,
  url: string,
  width: number
}

