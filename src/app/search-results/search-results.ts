import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MusicStateService } from '../services/music-state';
import { SearchResult } from '../models/search-result.model';
import { Track } from '../models/track.models';
import { Album } from '../models/album.model';
import { Artist } from '../models/artist.model';

import { FormsModule } from '@angular/forms';
import { SearchBar } from '../search-bar/search-bar';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchBar],
  templateUrl: './search-results.html',
  styleUrls: ['./search-results.css']
})
export class SearchResultsComponent implements OnInit, OnDestroy {
  searchResults: SearchResult = {
    tracks: [],
    albums: [],
    artists: [],
    hasResults: false,
    isEmpty: true
  };

  searchTerm: string = '';
  isSearching: boolean = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private musicState: MusicStateService
  ) { }

  ngOnInit(): void {
    const resultsSub = this.musicState.searchResults$.subscribe(results => {
      this.searchResults = results;
    });

    const termSub = this.musicState.searchTerm$.subscribe(term => {
      this.searchTerm = term;
    });

    const searchingSub = this.musicState.searching$.subscribe(searching => {
      this.isSearching = searching;
    });

    this.subscriptions.push(resultsSub, termSub, searchingSub);
  }

  selectTrack(track: Track): void {
    if (!track || !track.id) {
      console.error('Canción inválida');
      return;
    }

    this.musicState.selectTrack(track);
    this.router.navigate(['/player']);
  }

  selectAlbum(album: Album): void {
    if (!album || !album.id) {
      console.error('Álbum inválido');
      return;
    }

    this.musicState.selectAlbum(album);
    this.router.navigate(['/player']);
  }

  selectArtist(artist: Artist): void {
    if (!artist || !artist.id) {
      console.error('Artista inválido');
      return;
    }

    this.musicState.selectArtist(artist);
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

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}