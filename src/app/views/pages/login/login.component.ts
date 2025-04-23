import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  showError: boolean = false;
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.showError = false;
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.showError = true;
        this.errorMessage = error.message || 'Invalid email or password. Please try again.';
      },
    });
  }

  login(): void {
    this.onSubmit();
  }

  sendResetCode(event: Event): void {
    event.preventDefault(); // Prevent default anchor behavior
    if (this.email) {
      console.log(`Sending reset code to ${this.email}`);
      // Replace with actual backend call, e.g., this.authService.sendResetCode(this.email).subscribe(...)
      this.errorMessage = 'Reset code sent to your email. Check your inbox.';
      this.showError = true;
    } else {
      this.errorMessage = 'Please enter your email first.';
      this.showError = true;
    }
  }
}