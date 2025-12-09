// services/music-state.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SpotifyApiService } from './spotify-api';
import { Track } from '../models/track.models';
import { Album } from '../models/album.model';
import { Artist } from '../models/artist.model';
import { SearchResult, SearchResultMapper } from '../models/search-result.model';

@Injectable({
  providedIn: 'root'
})
export class MusicStateService {

  private currentTrackSubject = new BehaviorSubject<Track | null>(null);
  public currentTrack$ = this.currentTrackSubject.asObservable();

  private trackListSubject = new BehaviorSubject<Track[]>([]);
  public trackList$ = this.trackListSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  private searchResultsSubject = new BehaviorSubject<SearchResult>(
    SearchResultMapper.createEmpty()
  );
  public searchResults$ = this.searchResultsSubject.asObservable();

  private searchTermSubject = new BehaviorSubject<string>('');
  public searchTerm$ = this.searchTermSubject.asObservable();

  private searchingSubject = new BehaviorSubject<boolean>(false);
  public searching$ = this.searchingSubject.asObservable();

  private artistAlbumsSubject = new BehaviorSubject<Album[]>([]);
  public artistAlbums$ = this.artistAlbumsSubject.asObservable();

  private selectedArtistSubject = new BehaviorSubject<Artist | null>(null);
  public selectedArtist$ = this.selectedArtistSubject.asObservable();

  private selectedAlbumSubject = new BehaviorSubject<Album | null>(null);
  public selectedAlbum$ = this.selectedAlbumSubject.asObservable();

  constructor(private spotifyApi: SpotifyApiService) { }

  public selectTrack(track: Track): void {
    if (!track || !track.id) {
      this.setError('Canción inválida');
      return;
    }

    this.clearError();
    this.currentTrackSubject.next(track);
    // Don't clear track list if we are just selecting a song from the list
  }

  public selectAlbum(album: Album): void {
    if (!album || !album.id) {
      this.setError('Álbum inválido');
      return;
    }

    this.clearError();
    this.loadingSubject.next(true);

    // Set Context
    this.selectedAlbumSubject.next(album);
    this.selectedArtistSubject.next(null); // Clear artist context if viewing album specifically?
    // Or keep artist if it's their album? For simplicity, strict modes: Home | Artist | Album.

    this.spotifyApi.getAlbumTracks(album.id).subscribe({
      next: (tracks) => {
        if (tracks.length === 0) {
          this.setError('No se encontraron canciones en este álbum');
          this.loadingSubject.next(false);
          return;
        }

        this.currentTrackSubject.next(tracks[0]);
        this.trackListSubject.next(tracks);
        this.artistAlbumsSubject.next([]);
        this.loadingSubject.next(false);
      },
      error: (error) => {
        this.setError('Error al cargar las canciones del álbum');
        this.loadingSubject.next(false);
        console.error('Error al cargar álbum:', error);
      }
    });
  }

  public selectArtist(artist: Artist): void {
    if (!artist || !artist.id) {
      this.setError('Artista inválido');
      return;
    }

    this.clearError();
    this.loadingSubject.next(true);

    // Set Context
    this.selectedArtistSubject.next(artist);
    this.selectedAlbumSubject.next(null);

    // 1. Get Top Tracks
    this.spotifyApi.getArtistTopTracks(artist.id).subscribe({
      next: (tracks) => {
        if (tracks.length > 0) {
          this.currentTrackSubject.next(tracks[0]);
          this.trackListSubject.next(tracks);
        } else {
          this.setError('No se encontraron canciones de este artista');
        }
        this.loadingSubject.next(false);
      },
      error: (error) => {
        this.setError('Error al cargar las canciones del artista');
        this.loadingSubject.next(false);
        console.error('Error al cargar artista:', error);
      }
    });

    // 2. Get Albums
    this.spotifyApi.getArtistAlbums(artist.id).subscribe({
      next: (albums) => {
        const uniqueAlbums = albums.filter((v, i, a) => a.findIndex(v2 => (v2.name === v.name)) === i);
        this.artistAlbumsSubject.next(uniqueAlbums);
      },
      error: (err) => console.error(err)
    });
  }

  public getCurrentTrack(): Track | null {
    return this.currentTrackSubject.value;
  }

  public getTrackList(): Track[] {
    return this.trackListSubject.value;
  }

  public hasTrackList(): boolean {
    return this.trackListSubject.value.length > 0;
  }

  public clearSelection(): void {
    this.currentTrackSubject.next(null);
    this.trackListSubject.next([]);
    this.artistAlbumsSubject.next([]);
    this.selectedArtistSubject.next(null);
    this.selectedAlbumSubject.next(null);
    this.clearError();
  }

  public search(query: string, limit?: number): void {
    if (!query || query.trim().length === 0) {
      this.clearSearchResults();
      return;
    }

    this.searchingSubject.next(true);
    this.searchTermSubject.next(query.trim());
    const searchLimit = limit || 15; // Increased default limit

    this.spotifyApi.search(query.trim(), searchLimit).subscribe({
      next: (results) => {
        this.searchResultsSubject.next(results);
        this.searchingSubject.next(false);
      },
      error: (error) => {
        console.error('Error en búsqueda:', error);
        this.searchResultsSubject.next(SearchResultMapper.createEmpty());
        this.searchingSubject.next(false);
      }
    });
  }

  public loadHomeTracks(query: string = 'top hits 2024'): void {
    this.loadingSubject.next(true);
    // Clear contexts to show "Explorar Música"
    this.selectedArtistSubject.next(null);
    this.selectedAlbumSubject.next(null);

    this.spotifyApi.search(query, 50).subscribe({
      next: (results) => {
        // Use tracks from search result for home list
        if (results.tracks.length > 0) {
          this.trackListSubject.next(results.tracks);
        } else {
          this.setError('No se encontraron recomendaciones');
        }
        this.loadingSubject.next(false);
      },
      error: (error) => {
        console.error('Error loadHomeTracks:', error);
        this.setError('Error cargando recomendaciones');
        this.loadingSubject.next(false);
      }
    });
  }

  public setSearchResults(results: SearchResult): void {
    this.searchResultsSubject.next(results);
  }

  public getSearchResults(): SearchResult {
    return this.searchResultsSubject.value;
  }

  public getSearchTerm(): string {
    return this.searchTermSubject.value;
  }

  public hasSearchResults(): boolean {
    return this.searchResultsSubject.value.hasResults;
  }

  public clearSearchResults(): void {
    this.searchResultsSubject.next(SearchResultMapper.createEmpty());
    this.searchTermSubject.next('');
  }

  private setError(message: string): void {
    this.errorSubject.next(message);
  }

  public clearError(): void {
    this.errorSubject.next(null);
  }

  public hasError(): boolean {
    return this.errorSubject.value !== null;
  }

  public nextTrack(): void {
    const current = this.getCurrentTrack();
    const list = this.getTrackList();
    if (!current || list.length === 0) return;

    const index = list.findIndex(t => t.id === current.id);
    if (index === -1) return;

    const nextIndex = (index + 1) % list.length; // Loop to start
    this.selectTrack(list[nextIndex]);
  }

  public prevTrack(): void {
    const current = this.getCurrentTrack();
    const list = this.getTrackList();
    if (!current || list.length === 0) return;

    const index = list.findIndex(t => t.id === current.id);
    if (index === -1) return;

    const prevIndex = (index - 1 + list.length) % list.length; // Loop to end
    this.selectTrack(list[prevIndex]);
  }

  public getError(): string | null {
    return this.errorSubject.value;
  }
}