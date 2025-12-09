import { Routes } from '@angular/router';
import { SearchResultsComponent } from './search-results/search-results';
import { PlayerView } from './player-view/player-view';
import { TrackList } from './track-list/track-list';

export const routes: Routes = [
  {
    path: '',
    component: TrackList
  },
  {
    path: 'search',
    component: SearchResultsComponent
  },
  {
    path: 'player',
    component: PlayerView
  },
  {
    path: '**',
    redirectTo: '/search'
  }
];