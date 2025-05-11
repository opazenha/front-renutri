import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, RegisterRequest } from '../../../../core/services/auth.service';

// Custom validator for password match
export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { mismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'] 
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading: boolean = false;
  submitted: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordMatchValidator });
  }

  get name() { return this.registerForm.get('name'); }
  get email() { return this.registerForm.get('email'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = null;

    if (this.registerForm.invalid) {
      console.log('Registration form is invalid');
      return;
    }

    this.isLoading = true;
    const { confirmPassword, ...registrationData } = this.registerForm.value;
    const payload: RegisterRequest = registrationData;

    this.authService.register(payload).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        // Automatically log in the user after successful registration
        this.authService.login({ email: payload.email, password: payload.password }).subscribe({
          next: (loginResponse) => {
            this.isLoading = false;
            console.log('Auto-login after registration successful:', loginResponse);
            this.router.navigate(['/dashboard']);
          },
          error: (loginErr) => {
            this.isLoading = false;
            this.errorMessage = loginErr.error?.error || loginErr.error?.message || 'Auto-login failed after registration. Please try logging in manually.';
            console.error('Auto-login after registration failed:', loginErr);
            // Optionally navigate to login page or display a specific message
            // this.router.navigate(['/login']); 
          }
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.error || err.error?.message || 'Registration failed. Please try again.';
        console.error('Registration error:', err);
      }
    });
  }
}
