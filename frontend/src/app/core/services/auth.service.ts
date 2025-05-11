import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

// Define interfaces for request and response types for clarity
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  // confirmPassword is for frontend validation, not sent to backend
}

export interface AuthResponse {
  message: string;
  token: string;
  nutritionist: {
    id: string;
    name: string;
    email: string;
  };
}

export interface RegisterResponse {
  message: string;
  nutritionistId: string; // Or whatever ID is returned
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/v1/auth'; // Base URL for auth endpoints (proxied by Angular CLI in dev)
  private readonly TOKEN_KEY = 'renutri_auth_token';

  constructor(private http: HttpClient) { }

  private saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    // Could add token expiration check here if token contains expiry info and is not an opaque string.
    // For now, presence implies logged in.
    return !!token;
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.saveToken(response.token);
        console.log('Login successful, token stored:', response.token);
      })
    );
  }

  register(details: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, details).pipe(
      tap(response => {
        console.log('Registration successful:', response);
        // Typically, after registration, you might navigate to login or show a success message.
      })
    );
  }

  // logout() method will be added in Subtask 2.9
}
