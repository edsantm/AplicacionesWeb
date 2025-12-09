export interface Track {
  id: string;
  name: string;
  artistName: string;
  albumName: string;
  albumImage: string;
  duration: number;
  previewUrl: string | null;
}

export class TrackMapper {
  static fromSpotifyTrack(spotifyTrack: any): Track {
    return {
      id: spotifyTrack.id || '',
      name: spotifyTrack.name || 'Desconocido',
      artistName: spotifyTrack.artists?.map((a: any) => a.name).join(', ') || 'Artista desconocido',
      albumName: spotifyTrack.album?.name || 'Álbum desconocido',
      albumImage: spotifyTrack.album?.images?.[0]?.url || '',
      duration: spotifyTrack.duration_ms || 0,
      previewUrl: spotifyTrack.preview_url || null
    };
  }

  static fromSpotifyAlbumTrack(spotifyTrack: any, albumImage: string): Track {
    return {
      id: spotifyTrack.id || '',
      name: spotifyTrack.name || 'Desconocido',
      artistName: spotifyTrack.artists?.map((a: any) => a.name).join(', ') || 'Artista desconocido',
      albumName: '',
      albumImage: albumImage,
      duration: spotifyTrack.duration_ms || 0,
      previewUrl: spotifyTrack.preview_url || null
    };
  }
}