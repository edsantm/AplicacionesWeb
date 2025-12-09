import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SpotifyApiService } from '../services/spotify-api';
import { MusicStateService } from '../services/music-state';
import { Artist } from '../models/artist.model';
import { Album } from '../models/album.model';
import { Track } from '../models/track.models';

@Component({
    selector: 'app-artist-detail',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="detail-container" *ngIf="artist">
      <div class="header artist-header">
        <img [src]="artist.image || 'assets/default-music.png'" class="header-image-large">
        <div class="header-info">
          <span class="header-label">Artista</span>
          <h1>{{artist.name}}</h1>
          <p class="header-sub">{{artist.genres[0] || 'Artista'}}</p>
        </div>
      </div>

      <div class="content-area">
        <!-- Albums -->
        <div class="section-block" *ngIf="albums.length > 0">
          <h3 class="section-subtitle">Álbumes y Sencillos</h3>
          <div class="albums-scroll-container">
            <div class="album-card-mini" *ngFor="let album of albums" (click)="selectAlbum(album)">
              <img [src]="album.image || 'assets/default-music.png'" class="album-mini-art">
              <div class="album-mini-info">
                <div class="album-mini-name" [title]="album.name">{{album.name}}</div>
                <div class="album-mini-year">{{album.releaseDate | date:'yyyy'}}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Tracks -->
        <div class="section-block" *ngIf="topTracks.length > 0">
          <h3 class="section-subtitle">Canciones Populares</h3>
          <div class="track-list">
            <div class="track-item" *ngFor="let track of topTracks; let i = index" (click)="playTrack(track)">
               <div class="track-left">
                 <span class="track-index">{{i + 1}}</span>
                 <img [src]="track.albumImage || 'assets/default-music.png'" class="track-art">
                 <div class="track-info">
                   <div class="track-name">{{track.name}}</div>
                 </div>
               </div>
               <div class="track-right">
                 <div class="track-duration">{{getDuration(track.duration)}}</div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .detail-container { padding: 24px; padding-bottom: 120px; color: white; }
    .header { display: flex; align-items: center; gap: 24px; margin-bottom: 32px; padding: 24px 0; }
    .header-image-large { width: 160px; height: 160px; border-radius: 50%; object-fit: cover; box-shadow: 0 8px 24px rgba(0,0,0,0.5); }
    .header-info { display: flex; flex-direction: column; justify-content: center; }
    .header-label { font-size: 0.8rem; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; margin-bottom: 4px; }
    .header h1 { font-size: 3rem; font-weight: 800; margin: 0; }
    .header-sub { color: #b3b3b3; font-size: 1rem; margin-top: 8px; }
    
    .section-block { margin-bottom: 32px; }
    .section-subtitle { font-size: 1.5rem; font-weight: 700; margin-bottom: 16px; }
    
    .albums-scroll-container { display: flex; gap: 16px; overflow-x: auto; padding-bottom: 12px; }
    .albums-scroll-container::-webkit-scrollbar { height: 8px; }
    .albums-scroll-container::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 4px; }
    .albums-scroll-container::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.3); border-radius: 4px; }
    
    .album-card-mini { min-width: 140px; width: 140px; cursor: pointer; background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; transition: background 0.2s; flex-shrink: 0; }
    .album-card-mini:hover { background: rgba(255,255,255,0.1); }
    .album-mini-art { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 4px; margin-bottom: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.3); }
    .album-mini-info { overflow: hidden; }
    .album-mini-name { color: white; font-weight: 600; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px; }
    .album-mini-year { font-size: 0.8rem; color: #b3b3b3; }

    .track-list { display: flex; flex-direction: column; }
    .track-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-radius: 6px; cursor: pointer; transition: background-color 0.2s; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .track-item:hover { background-color: rgba(255,255,255,0.1); }
    .track-left { display: flex; align-items: center; gap: 16px; flex: 1; min-width: 0; }
    .track-index { color: #b3b3b3; width: 20px; text-align: center; }
    .track-art { width: 40px; height: 40px; object-fit: cover; border-radius: 4px; }
    .track-info { display: flex; flex-direction: column; overflow: hidden; }
    .track-name { color: white; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .track-right { margin-left: 16px; }
    .track-duration { color: #b3b3b3; font-size: 14px; font-variant-numeric: tabular-nums; }
  `]
})
export class ArtistDetailComponent implements OnInit {
    artist: Artist | null = null;
    topTracks: Track[] = [];
    albums: Album[] = [];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private spotifyApi: SpotifyApiService,
        private musicState: MusicStateService
    ) { }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.loadArtist(id);
            }
        });
    }

    loadArtist(id: string): void {
        // 1. Get Artist Details
        this.spotifyApi.getArtist(id).subscribe(artist => this.artist = artist);

        // 2. Get Top Tracks
        this.spotifyApi.getArtistTopTracks(id).subscribe(tracks => this.topTracks = tracks);

        // 3. Get Albums
        this.spotifyApi.getArtistAlbums(id).subscribe(albums => {
            // Dedup
            this.albums = albums.filter((v, i, a) => a.findIndex(v2 => (v2.name === v.name)) === i);
        });
    }

    playTrack(track: Track): void {
        this.musicState.selectTrack(track); // Just play
        // Optionally set the whole list as context? 
        // For now simple play. Use musicState to update currentTrack.
    }

    selectAlbum(album: Album): void {
        this.router.navigate(['/album', album.id]);
    }

    getDuration(ms: number): string {
        if (!ms) return '0:00';
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}
