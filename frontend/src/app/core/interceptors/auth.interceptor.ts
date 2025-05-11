import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service'; // Adjust path as needed

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();

    // Check if the request URL is for our API to avoid sending token to external APIs
    // This condition might need adjustment based on your actual API structure or if you have multiple APIs.
    // For now, we assume all requests not targeting '/api/v1/auth/login' or '/api/v1/auth/register' might need auth.
    // A more robust solution might involve checking if request.url.startsWith(environment.apiUrl) and excluding auth paths.
    const isAuthEndpoint = request.url.includes('/api/v1/auth/login') || request.url.includes('/api/v1/auth/register');

    if (token && !isAuthEndpoint) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request);
  }
}
