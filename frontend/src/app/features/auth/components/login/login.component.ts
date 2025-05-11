import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // For *ngIf, etc.
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; // For reactive forms
import { Router, RouterModule } from '@angular/router'; // For navigation and routerLink
import { AuthService, LoginRequest } from '../../../../core/services/auth.service'; // Adjust path as needed

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, 
    RouterModule // For routerLink if used in template directly
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup; // Definite assignment assertion
  errorMessage: string | null = null;
  isLoading: boolean = false;
  submitted: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]] // Assuming minLength for password
    });
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = null; // Reset error message

    if (this.loginForm.invalid) {
      console.log('Login form is invalid');
      return;
    }

    const credentials: LoginRequest = this.loginForm.value;
    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        // Navigate to a protected route or dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Login failed', err);
        this.isLoading = false;
        this.errorMessage = err.error?.error || err.error?.message || 'Login failed. Please check your credentials and try again.';
        console.error('Login error:', err);
      }
    });
  }
}
