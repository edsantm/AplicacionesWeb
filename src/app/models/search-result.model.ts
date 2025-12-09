import { Track, TrackMapper } from './track.models';
import { Album, AlbumMapper } from './album.model';
import { Artist, ArtistMapper } from './artist.model';

export interface SearchResult {
  tracks: Track[];
  albums: Album[];
  artists: Artist[];
  hasResults: boolean;
  isEmpty: boolean;
}

export class SearchResultMapper {
  static createEmpty(): SearchResult {
    return {
      tracks: [],
      albums: [],
      artists: [],
      hasResults: false,
      isEmpty: true
    };
  }

  static fromSpotifySearch(spotifyResponse: any): SearchResult {
    const tracks = spotifyResponse.tracks?.items?.map((item: any) => 
      TrackMapper.fromSpotifyTrack(item)
    ) || [];
    
    const albums = spotifyResponse.albums?.items?.map((item: any) => 
      AlbumMapper.fromSpotifyAlbum(item)
    ) || [];
    
    const artists = spotifyResponse.artists?.items?.map((item: any) => 
      ArtistMapper.fromSpotifyArtist(item)
    ) || [];

    const hasResults = tracks.length > 0 || albums.length > 0 || artists.length > 0;

    return {
      tracks,
      albums,
      artists,
      hasResults,
      isEmpty: !hasResults
    };
  }
}