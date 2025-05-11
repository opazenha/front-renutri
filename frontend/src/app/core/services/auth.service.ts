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

  constructor(private http: HttpClient) { }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        // For now, just log the token. Token storage will be handled in Subtask 2.8.
        console.log('Login successful, token:', response.token);
        // In a real app, you'd store the token securely (e.g., localStorage or a more secure solution)
        // and potentially navigate the user or update an authentication state.
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
