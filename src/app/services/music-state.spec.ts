import { TestBed } from '@angular/core/testing';

import { MusicState } from './music-state';

describe('MusicState', () => {
  let service: MusicState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MusicState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
