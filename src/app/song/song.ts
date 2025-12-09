import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { MusicStateService } from '../services/music-state';
import { Track } from '../models/track.models';

@Component({
  selector: 'app-song',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './song.html',
  styleUrls: ['./song.css']
})
export class Song implements OnInit, OnDestroy {
  currentTrack: Track | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  
  private subscriptions: Subscription[] = [];

  constructor(private musicState: MusicStateService) {}

  ngOnInit(): void {
    const trackSub = this.musicState.currentTrack$.subscribe(track => {
      this.currentTrack = track;
    });

    const loadingSub = this.musicState.loading$.subscribe(loading => {
      this.isLoading = loading;
    });

    const errorSub = this.musicState.error$.subscribe(error => {
      this.errorMessage = error;
    });

    this.subscriptions.push(trackSub, loadingSub, errorSub);
  }

  getImageUrl(): string {
    if (this.currentTrack?.albumImage) {
      return this.currentTrack.albumImage;
    }
    return 'assets/default-music.png';
  }

  hasImage(): boolean {
    const url = this.getImageUrl();
    return url !== 'assets/default-music.png' && url.length > 0;
  }

  getDuration(): string {
    if (!this.currentTrack?.duration) return '0:00';
    
    const minutes = Math.floor(this.currentTrack.duration / 60000);
    const seconds = Math.floor((this.currentTrack.duration % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  hasPreview(): boolean {
    return !!this.currentTrack?.previewUrl;
  }

  clearError(): void {
    this.musicState.clearError();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}