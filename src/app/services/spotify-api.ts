import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError, retry, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from './auth';
import { Track, TrackMapper } from '../models/track.models';
import { Album, AlbumMapper } from '../models/album.model';
import { Artist, ArtistMapper } from '../models/artist.model';
import { SearchResult, SearchResultMapper } from '../models/search-result.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SpotifyApiService {
  private readonly API_URL = environment.spotify.API_URL;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private waitForToken(): Observable<string> {
    return this.authService.accessToken$.pipe(
      filter(token => !!token && token.length > 0),
      take(1)
    );
  }

  private handleError(error: HttpErrorResponse, context: string): Observable<never> {
    let errorMessage = `Error en ${context}`;

    if (error.status === 0) {
      errorMessage = 'Error de conexión. Verifica tu internet';
    } else if (error.status === 401) {
      errorMessage = 'Token expirado. Renovando...';
      this.authService.forceRefreshToken().subscribe();
    } else if (error.status === 404) {
      errorMessage = 'Recurso no encontrado';
    } else if (error.status === 429) {
      errorMessage = 'Demasiadas peticiones. Intenta más tarde';
    } else if (error.error?.error?.message) {
      errorMessage = error.error.error.message;
    }

    console.error(`${context}:`, errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  public search(query: string, limit: number = 15): Observable<SearchResult> {
    if (!query || query.trim().length === 0) {
      return of(SearchResultMapper.createEmpty());
    }

    return this.waitForToken().pipe(
      switchMap(token => {
        const url = `${this.API_URL}/search`;
        const params = {
          q: query.trim(),
          type: 'track,album,artist',
          limit: limit.toString(),
          market: 'MX'
        };

        return this.http.get<any>(url, {
          headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }),
          params
        });
      }),
      retry(1),
      map(response => {
        if (!response) {
          return SearchResultMapper.createEmpty();
        }
        return SearchResultMapper.fromSpotifySearch(response);
      }),
      catchError(error => {
        console.error('Error en búsqueda:', error);
        return of(SearchResultMapper.createEmpty());
      })
    );
  }

  public getTrack(trackId: string): Observable<Track | null> {
    if (!trackId) {
      return of(null);
    }

    return this.waitForToken().pipe(
      switchMap(token => {
        const url = `${this.API_URL}/tracks/${trackId}`;
        return this.http.get<any>(url, { headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }) });
      }),
      map(response => {
        if (!response) return null;
        return TrackMapper.fromSpotifyTrack(response);
      }),
      catchError(error => {
        this.handleError(error, 'obtener canción').subscribe();
        return of(null);
      })
    );
  }

  public getAlbumTracks(albumId: string): Observable<Track[]> {
    if (!albumId) {
      return of([]);
    }

    return this.waitForToken().pipe(
      switchMap(token => {
        const url = `${this.API_URL}/albums/${albumId}`;
        return this.http.get<any>(url, { headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }) });
      }),
      map(response => {
        if (!response || !response.tracks || !response.tracks.items) {
          return [];
        }

        const albumImage = response.images?.[0]?.url || '';

        return response.tracks.items.map((track: any) =>
          TrackMapper.fromSpotifyAlbumTrack(track, albumImage)
        );
      }),
      catchError(error => {
        this.handleError(error, 'obtener canciones del álbum').subscribe();
        return of([]);
      })
    );
  }

  public getAlbum(albumId: string): Observable<Album | null> {
    if (!albumId) {
      return of(null);
    }

    return this.waitForToken().pipe(
      switchMap(token => {
        const url = `${this.API_URL}/albums/${albumId}`;
        return this.http.get<any>(url, { headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }) });
      }),
      map(response => {
        if (!response) return null;
        return AlbumMapper.fromSpotifyAlbum(response);
      }),
      catchError(error => {
        this.handleError(error, 'obtener álbum').subscribe();
        return of(null);
      })
    );
  }

  public getArtistTopTracks(artistId: string): Observable<Track[]> {
    if (!artistId) {
      return of([]);
    }

    return this.waitForToken().pipe(
      switchMap(token => {
        const url = `${this.API_URL}/artists/${artistId}/top-tracks`;
        const params = { market: 'US' };

        return this.http.get<any>(url, {
          headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }),
          params
        });
      }),
      map(response => {
        if (!response || !response.tracks) {
          return [];
        }

        return response.tracks.map((track: any) =>
          TrackMapper.fromSpotifyTrack(track)
        );
      }),
      catchError(error => {
        this.handleError(error, 'obtener top tracks del artista').subscribe();
        return of([]);
      })
    );
  }

  public getArtistAlbums(artistId: string): Observable<Album[]> {
    if (!artistId) {
      return of([]);
    }

    return this.waitForToken().pipe(
      switchMap(token => {
        const url = `${this.API_URL}/artists/${artistId}/albums`;
        const params = {
          include_groups: 'album,single',
          limit: '10',
          market: 'MX'
        };

        return this.http.get<any>(url, {
          headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }),
          params
        });
      }),
      map(response => {
        if (!response || !response.items) {
          return [];
        }
        return response.items.map((album: any) => AlbumMapper.fromSpotifyAlbum(album));
      }),
      catchError(error => {
        console.error('Error getting artist albums:', error);
        return of([]);
      })
    );
  }

  public getArtist(artistId: string): Observable<Artist | null> {
    if (!artistId) {
      return of(null);
    }

    return this.waitForToken().pipe(
      switchMap(token => {
        const url = `${this.API_URL}/artists/${artistId}`;
        return this.http.get<any>(url, { headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }) });
      }),
      map(response => {
        if (!response) return null;
        return ArtistMapper.fromSpotifyArtist(response);
      }),
      catchError(error => {
        this.handleError(error, 'obtener artista').subscribe();
        return of(null);
      })
    );
  }

  public isAuthenticated(): boolean {
    return this.authService.hasValidToken();
  }
}
