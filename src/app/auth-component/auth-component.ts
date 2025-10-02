import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-auth-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth-component.html',
  styleUrl: './auth-component.sass'
})
export class AuthComponent {
  protected readonly projectName = 'Juntos+';
  protected readonly logoPath = 'assets/images/logo.png';
  protected readonly isLoginMode = signal(true);
  
  protected loginForm: FormGroup;
  protected registerForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      cpf: ['', [Validators.required, this.cpfValidator]]
    }, { validators: this.passwordMatchValidator });
  }

  protected toggleMode(): void {
    this.isLoginMode.update(mode => !mode);
    this.loginForm.reset();
    this.registerForm.reset();
  }

  protected onLoginSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      
      if (this.authService.login(email, password)) {
        this.router.navigate(['/home']);
      } else {
        alert('Credenciais inválidas. Tente novamente.');
      }
    } else {
      this.markFormGroupTouched(this.loginForm);
    }
  }

  protected onRegisterSubmit(): void {
    if (this.registerForm.valid) {
      const { email, username, cpf, password } = this.registerForm.value;
      
      if (this.authService.register(email, username, cpf, password)) {
        this.toggleMode();
        alert('Conta criada com sucesso! Faça login para continuar.');
      } else {
        alert('Erro ao criar conta. Tente novamente.');
      }
    } else {
      this.markFormGroupTouched(this.registerForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private cpfValidator(control: any): { [key: string]: any } | null {
    const cpf = control.value?.replace(/\D/g, '');
    if (!cpf || cpf.length !== 11) {
      return { invalidCpf: true };
    }
    return null;
  }

  private passwordMatchValidator(formGroup: FormGroup): { [key: string]: any } | null {
    const password = formGroup.get('password');
    const confirmPassword = formGroup.get('confirmPassword');
    return password && confirmPassword && password.value !== confirmPassword.value
      ? { passwordMismatch: true }
      : null;
  }
}
