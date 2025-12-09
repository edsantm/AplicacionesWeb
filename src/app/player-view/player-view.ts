import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { MusicStateService } from '../services/music-state';
import { Track } from '../models/track.models';

@Component({
  selector: 'app-player-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './player-view.html',
  styleUrls: ['./player-view.css']
})
export class PlayerView implements OnInit, OnDestroy {
  currentTrack: Track | null = null;
  isPlaying: boolean = false;
  currentTime: number = 0;
  duration: number = 0;

  private subscriptions: Subscription[] = [];

  constructor(private musicState: MusicStateService) { }

  ngOnInit(): void {
    const trackSub = this.musicState.currentTrack$.subscribe(track => {
      this.currentTrack = track;
      if (track) {
        this.duration = track.duration;
        this.currentTime = 0; // Reset time on new track
        this.isPlaying = false; // Pause on new track load (optional, but safer for mock)
        this.stopProgress();
      }
    });

    // Mock progress for demo (since we don't have real audio playing yet in logic shown)
    // In a real app, this would come from an audio service.
    // I will add a simple interval to simulate progress if playing for UI demo.

    this.subscriptions.push(trackSub);
  }

  togglePlay(): void {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      this.startProgress();
    } else {
      this.stopProgress();
    }
  }

  previous(): void {
    this.musicState.prevTrack();
  }

  next(): void {
    this.musicState.nextTrack();
  }

  seek(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.currentTime = parseInt(input.value);
  }

  formatTime(ms: number): string {
    if (!ms) return '0:00';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Simple mock progress interval
  private progressInterval: any;
  private startProgress() {
    this.stopProgress();
    this.progressInterval = setInterval(() => {
      if (this.currentTime < this.duration) {
        this.currentTime += 100; // Update every 100ms
      } else {
        this.stopProgress();
        this.isPlaying = false;
        this.currentTime = 0;
      }
    }, 100);
  }

  private stopProgress() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.stopProgress();
  }
}
