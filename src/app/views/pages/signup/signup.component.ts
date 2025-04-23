import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
})
export class SignupComponent {
  signupForm: FormGroup;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
    this.signupForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
      terms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  onRegister(): void {
    if (this.signupForm.valid) {
      console.log('Signup data:', this.signupForm.value);
      // Add backend API call for registration here
      this.authService.register(this.signupForm.value).subscribe(
        response => {
          console.log('Registration successful:', response);
          // Handle successful registration, e.g., navigate to login page or show success message
          this.router.navigate(['/login']).catch(err => {
            console.error('Navigation error:', err);
          });
        },
        error => {
          console.error('Registration error:', error);
          // Handle registration error, e.g., show error message
        }
      );
      this.router.navigateByUrl('/login').catch(err => {
        console.error('Navigation error:', err);
      });
    } else {
      console.log('Form is invalid');
      this.signupForm.markAllAsTouched(); // Show validation errors
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}