import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SpotifyApiService } from '../services/spotify-api';
import { MusicStateService } from '../services/music-state';
import { Album } from '../models/album.model';
import { Track } from '../models/track.models';

@Component({
    selector: 'app-album-detail',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="detail-container" *ngIf="album">
      <div class="header album-header">
        <img [src]="album.image || 'assets/default-music.png'" class="header-image-large shadow">
        <div class="header-info">
          <span class="header-label">Álbum</span>
          <h1>{{album.name}}</h1>
          <p class="header-sub">{{album.artistName}} • {{album.releaseDate | date:'yyyy'}}</p>
        </div>
      </div>

      <div class="content-area">
        <div class="track-list" *ngIf="tracks.length > 0">
           <div class="track-item" *ngFor="let track of tracks; let i = index" (click)="playTrack(track, i)">
               <div class="track-left">
                 <span class="track-index">{{i + 1}}</span>
                 <div class="track-info">
                   <div class="track-name">{{track.name}}</div>
                   <div class="track-artist">{{track.artistName}}</div>
                 </div>
               </div>
               <div class="track-right">
                 <div class="track-duration">{{getDuration(track.duration)}}</div>
               </div>
            </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .detail-container { padding: 24px; padding-bottom: 120px; color: white; }
    .header { display: flex; align-items: center; gap: 24px; margin-bottom: 32px; padding: 24px 0; }
    .header-image-large { width: 160px; height: 160px; border-radius: 4px; object-fit: cover; box-shadow: 0 8px 24px rgba(0,0,0,0.5); }
    .header-info { display: flex; flex-direction: column; justify-content: center; }
    .header-label { font-size: 0.8rem; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; margin-bottom: 4px; }
    .header h1 { font-size: 3rem; font-weight: 800; margin: 0; }
    .header-sub { color: #b3b3b3; font-size: 1rem; margin-top: 8px; }

    .track-list { display: flex; flex-direction: column; }
    .track-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-radius: 6px; cursor: pointer; transition: background-color 0.2s; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .track-item:hover { background-color: rgba(255,255,255,0.1); }
    .track-left { display: flex; align-items: center; gap: 16px; flex: 1; min-width: 0; }
    .track-index { color: #b3b3b3; width: 20px; text-align: center; }
    .track-info { display: flex; flex-direction: column; overflow: hidden; }
    .track-name { color: white; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .track-artist { color: #b3b3b3; font-size: 14px; }
    .track-right { margin-left: 16px; }
    .track-duration { color: #b3b3b3; font-size: 14px; font-variant-numeric: tabular-nums; }
  `]
})
export class AlbumDetailComponent implements OnInit {
    album: Album | null = null;
    tracks: Track[] = [];

    constructor(
        private route: ActivatedRoute,
        private spotifyApi: SpotifyApiService,
        private musicState: MusicStateService
    ) { }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.loadAlbum(id);
            }
        });
    }

    loadAlbum(id: string): void {
        // 1. Get Album Details
        this.spotifyApi.getAlbum(id).subscribe(album => this.album = album);

        // 2. Get Tracks
        this.spotifyApi.getAlbumTracks(id).subscribe(tracks => this.tracks = tracks);
    }

    playTrack(track: Track, index: number): void {
        // Ideally we set the queue here? For now, play track.
        this.musicState.selectTrack(track);
    }

    getDuration(ms: number): string {
        if (!ms) return '0:00';
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}
