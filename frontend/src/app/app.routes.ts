import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/components/login/login.component'; // Import LoginComponent
import { RegisterComponent } from './features/auth/components/register/register.component'; // Import RegisterComponent
import { DashboardComponent } from './features/dashboard/components/dashboard/dashboard.component'; // Import DashboardComponent
import { authGuard } from './core/guards/auth.guard'; // Import authGuard

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    {
        path: 'dashboard', 
        component: DashboardComponent, 
        canActivate: [authGuard] // Apply the guard
    },
    { path: '', redirectTo: '/login', pathMatch: 'full' }, 
    // TODO: Add a wildcard route for 404 handling
    // { path: '**', component: PageNotFoundComponent } 
];
