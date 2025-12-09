import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly CLIENT_ID = environment.spotify.CLIENT_ID;
  private readonly CLIENT_SECRET = environment.spotify.CLIENT_SECRET; 
  private readonly TOKEN_URL = environment.spotify.AUTH_API_URL;
  
  private accessTokenSubject = new BehaviorSubject<string>('');
  private tokenExpirationTimer: any;
  
  public accessToken$ = this.accessTokenSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    this.authenticate().subscribe({
      next: () => console.log('Autenticación exitosa con Spotify'),
      error: (error) => console.error('Error en autenticación inicial:', error)
    });
  }

  public authenticate(): Observable<SpotifyTokenResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${this.CLIENT_ID}:${this.CLIENT_SECRET}`)
    });

    const body = 'grant_type=client_credentials';

    return this.http.post<SpotifyTokenResponse>(this.TOKEN_URL, body, { headers }).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => this.handleAuthError(error))
    );
  }

  private handleAuthSuccess(response: SpotifyTokenResponse): void {
    this.accessTokenSubject.next(response.access_token);
    this.scheduleTokenRefresh(response.expires_in);
  }

  private scheduleTokenRefresh(expiresIn: number): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }

    const refreshTime = (expiresIn - 60) * 1000;
    
    this.tokenExpirationTimer = setTimeout(() => {
      console.log('Renovando token de acceso...');
      this.authenticate().subscribe({
        next: () => console.log('Token renovado exitosamente'),
        error: (error) => console.error('Error al renovar token:', error)
      });
    }, refreshTime);
  }

  private handleAuthError(error: any): Observable<never> {
    console.error('Error en autenticación de Spotify:', error);
    
    let errorMessage = 'Error al autenticar con Spotify';
    
    if (error.status === 400) {
      errorMessage = 'Credenciales inválidas. Verifica CLIENT_ID y CLIENT_SECRET';
    } else if (error.status === 0) {
      errorMessage = 'Error de conexión. Verifica tu conexión a internet';
    }
    
    return throwError(() => new Error(errorMessage));
  }

  public getAccessToken(): string {
    return this.accessTokenSubject.value;
  }

  public hasValidToken(): boolean {
    return this.accessTokenSubject.value.length > 0;
  }

  public forceRefreshToken(): Observable<SpotifyTokenResponse> {
    return this.authenticate();
  }

  public logout(): void {
    this.accessTokenSubject.next('');
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
  }

  ngOnDestroy(): void {
    this.logout();
  }
}
