import { Component } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router'; 
import { CommonModule } from '@angular/common'; 
import { AuthService } from './core/services/auth.service'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    RouterModule, 
    CommonModule 
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'] // changed styleUrl to styleUrls
})
export class AppComponent {
  title = 'frontend';

  constructor(private authService: AuthService, public router: Router) {}

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  logout(): void {
    this.authService.logout();
    // Navigation is handled by authService.logout() for now
    // If navigation was handled here: this.router.navigate(['/login']);
  }
}
