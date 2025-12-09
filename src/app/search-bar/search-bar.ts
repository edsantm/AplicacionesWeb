import { Component, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap, filter } from 'rxjs/operators';
import { SpotifyApiService } from '../services/spotify-api';
import { MusicStateService } from '../services/music-state';
import { SearchResult } from '../models/search-result.model';
import { Track } from '../models/track.models';
import { Album } from '../models/album.model';
import { Artist } from '../models/artist.model';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.html',
  styleUrls: ['./search-bar.css']
})
export class SearchBar implements OnDestroy {
  @Input() overlayResults = true;
  @Input() placeholder = 'Buscar cancelaciones, álbumes...';

  searchResults: SearchResult = {
    tracks: [],
    albums: [],
    artists: [],
    hasResults: false,
    isEmpty: true
  };

  showResults = false;
  isSearching = false;
  searchError: string | null = null;
  currentSearchTerm: string = '';

  private searchTerms = new Subject<string>();
  private subscription: Subscription;

  constructor(
    private spotifyApi: SpotifyApiService,
    private musicState: MusicStateService,
    private router: Router
  ) {
    this.subscription = this.searchTerms.pipe(
      filter(term => term.trim().length > 0),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        this.isSearching = true;
        this.searchError = null;
        return this.spotifyApi.search(term, 3);
      })
    ).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.showResults = true;
        this.isSearching = false;

        if (results.isEmpty) {
          this.searchError = 'No se encontraron resultados';
        }
      },
      error: (error) => {
        console.error('Error en búsqueda:', error);
        this.searchError = 'Error al realizar la búsqueda';
        this.isSearching = false;
        this.showResults = false;
      }
    });
  }

  onSearch(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.currentSearchTerm = term;

    if (term.trim().length === 0) {
      this.showResults = false;
      this.searchError = null;
      this.searchResults = {
        tracks: [],
        albums: [],
        artists: [],
        hasResults: false,
        isEmpty: true
      };
      return;
    }

    this.searchTerms.next(term);
  }

  performSearch(): void {
    this.closeResults();
    if (this.currentSearchTerm.trim().length > 0) {
      this.musicState.search(this.currentSearchTerm);
      this.router.navigate(['/search']);
    }
  }

  selectTrack(track: Track): void {
    if (!track || !track.id) {
      console.error('Canción inválida');
      return;
    }

    this.musicState.selectTrack(track);
    this.closeResults();
    this.router.navigate(['/player']);
  }

  selectAlbum(album: Album): void {
    if (!album || !album.id) {
      console.error('Álbum inválido');
      return;
    }

    this.musicState.selectAlbum(album);
    this.closeResults();
    this.router.navigate(['/player']);
  }

  selectArtist(artist: Artist): void {
    if (!artist || !artist.id) {
      console.error('Artista inválido');
      return;
    }

    this.musicState.selectArtist(artist);
    this.closeResults();
    this.router.navigate(['/player']);
  }

  getImageUrl(item: Track | Album | Artist): string {
    if ('albumImage' in item && item.albumImage) {
      return item.albumImage;
    }
    if ('image' in item && item.image) {
      return item.image;
    }
    return 'assets/default-music.png';
  }

  hasImage(item: Track | Album | Artist): boolean {
    const url = this.getImageUrl(item);
    return url !== 'assets/default-music.png' && url.length > 0;
  }

  closeResults(): void {
    setTimeout(() => {
      this.showResults = false;
      this.searchError = null;
    }, 200);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}