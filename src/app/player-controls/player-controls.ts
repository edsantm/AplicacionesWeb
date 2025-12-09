import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { MusicStateService } from '../services/music-state';
import { Track } from '../models/track.models';


@Component({
  selector: 'app-player-controls',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player-controls.html',
  styleUrls: ['./player-controls.css']
})
export class PlayerControlsComponent implements OnInit, OnDestroy {
  currentTrack: Track | null = null;
  isPlaying: boolean = false;
  currentTime: number = 0;
  duration: number = 0;
  volume: number = 80;
  
  private subscription?: Subscription;

  constructor(private musicState: MusicStateService) {}

  ngOnInit(): void {
    this.subscription = this.musicState.currentTrack$.subscribe(track => {
      this.currentTrack = track;
      if (track) {
        this.duration = track.duration;
      }
    });
  }

  togglePlay(): void {
    this.isPlaying = !this.isPlaying;
  }

  previous(): void {
    console.log('⏮Anterior');
  }

  next(): void {
    console.log(' Siguiente');
  }
  seek(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.currentTime = parseInt(input.value);
    console.log('⏱️ Seek to:', this.currentTime);
  }

  changeVolume(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.volume = parseInt(input.value);
    console.log('🔊 Volumen:', this.volume);
  }

  formatTime(ms: number): string {
    if (!ms) return '0:00';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}