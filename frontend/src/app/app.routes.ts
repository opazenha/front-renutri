import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/components/login/login.component'; // Import LoginComponent

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    // TODO: Add a default route, e.g., redirect to login or a home page
    // { path: '', redirectTo: '/login', pathMatch: 'full' }, 
    // TODO: Add a wildcard route for 404 handling
    // { path: '**', component: PageNotFoundComponent } 
];
