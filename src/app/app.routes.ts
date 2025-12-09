import { Routes } from '@angular/router';
import { SearchResultsComponent } from './search-results/search-results';
import { PlayerView } from './player-view/player-view';
import { TrackList } from './track-list/track-list';
import { ArtistDetailComponent } from './artist-detail/artist-detail';
import { AlbumDetailComponent } from './album-detail/album-detail';

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
    path: 'artist/:id',
    component: ArtistDetailComponent
  },
  {
    path: 'album/:id',
    component: AlbumDetailComponent
  },
  {
    path: '**',
    redirectTo: '/search'
  }
];