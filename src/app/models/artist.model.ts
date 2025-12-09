export interface Artist {
  id: string;
  name: string;
  image: string;
  genres: string[];
  popularity: number;
}

export class ArtistMapper {
  static fromSpotifyArtist(spotifyArtist: any): Artist {
    return {
      id: spotifyArtist.id || '',
      name: spotifyArtist.name || 'Artista desconocido',
      image: spotifyArtist.images?.[0]?.url || '',
      genres: spotifyArtist.genres || [],
      popularity: spotifyArtist.popularity || 0
    };
  }
}