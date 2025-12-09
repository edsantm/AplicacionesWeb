export interface Album {
  id: string;
  name: string;
  artistName: string;
  image: string;
  releaseDate: string;
  totalTracks: number;
}

export class AlbumMapper {
  static fromSpotifyAlbum(spotifyAlbum: any): Album {
    return {
      id: spotifyAlbum.id || '',
      name: spotifyAlbum.name || 'Álbum desconocido',
      artistName: spotifyAlbum.artists?.map((a: any) => a.name).join(', ') || 'Artista desconocido',
      image: spotifyAlbum.images?.[0]?.url || '',
      releaseDate: spotifyAlbum.release_date || '',
      totalTracks: spotifyAlbum.total_tracks || 0
    };
  }
}