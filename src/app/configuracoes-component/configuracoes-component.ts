import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-configuracoes-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './configuracoes-component.html',
  styleUrl: './configuracoes-component.sass'
})
export class ConfiguracoesComponent {
  protected readonly currentUser = signal<any>(null);
  protected readonly isEditingEmail = signal(false);
  protected readonly isEditingPassword = signal(false);
  protected readonly isEditingUsername = signal(false);
  protected readonly profileImage = signal<string | null>(null);
  
  protected emailForm: FormGroup;
  protected passwordForm: FormGroup;
  protected usernameForm: FormGroup;

  constructor(
    private fb: FormBuilder, 
    private router: Router, 
    private authService: AuthService
  ) {
    // Inicializar currentUser após a injeção do authService
    this.currentUser.set(this.authService.getCurrentUser());
    
    this.emailForm = this.fb.group({
      currentEmail: [{ value: this.currentUser()?.email || '', disabled: true }],
      newEmail: ['', [Validators.required, Validators.email]],
      confirmEmail: ['', [Validators.required, Validators.email]]
    }, { validators: this.emailMatchValidator });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    this.usernameForm = this.fb.group({
      currentUsername: [{ value: this.currentUser()?.username || '', disabled: true }],
      newUsername: ['', [Validators.required, Validators.minLength(3)]]
    });

    // Carregar foto de perfil salva
    this.loadProfileImage();
  }

  protected toggleEmailEdit(): void {
    this.isEditingEmail.update(edit => !edit);
    if (!this.isEditingEmail()) {
      this.emailForm.reset();
      this.emailForm.patchValue({
        currentEmail: this.currentUser()?.email || ''
      });
    }
  }

  protected togglePasswordEdit(): void {
    this.isEditingPassword.update(edit => !edit);
    if (!this.isEditingPassword()) {
      this.passwordForm.reset();
    }
  }

  protected toggleUsernameEdit(): void {
    this.isEditingUsername.update(edit => !edit);
    if (!this.isEditingUsername()) {
      this.usernameForm.reset();
      this.usernameForm.patchValue({
        currentUsername: this.currentUser()?.username || ''
      });
    }
  }

  protected onEmailSubmit(): void {
    if (this.emailForm.valid) {
      const { newEmail } = this.emailForm.value;
      
      // Simular atualização de email
      if (this.updateUserEmail(newEmail)) {
        alert('Email atualizado com sucesso!');
        this.toggleEmailEdit();
        this.emailForm.reset();
        this.emailForm.patchValue({
          currentEmail: newEmail
        });
      } else {
        alert('Erro ao atualizar email. Tente novamente.');
      }
    } else {
      this.markFormGroupTouched(this.emailForm);
    }
  }

  protected onPasswordSubmit(): void {
    if (this.passwordForm.valid) {
      const { currentPassword, newPassword } = this.passwordForm.value;
      
      // Simular atualização de senha
      if (this.updateUserPassword(currentPassword, newPassword)) {
        alert('Senha atualizada com sucesso!');
        this.togglePasswordEdit();
        this.passwordForm.reset();
      } else {
        alert('Senha atual incorreta ou erro ao atualizar. Tente novamente.');
      }
    } else {
      this.markFormGroupTouched(this.passwordForm);
    }
  }

  protected onUsernameSubmit(): void {
    if (this.usernameForm.valid) {
      const { newUsername } = this.usernameForm.value;
      
      // Simular atualização de username
      if (this.updateUserUsername(newUsername)) {
        alert('Nome de usuário atualizado com sucesso!');
        this.toggleUsernameEdit();
        this.usernameForm.reset();
        this.usernameForm.patchValue({
          currentUsername: newUsername
        });
      } else {
        alert('Erro ao atualizar nome de usuário. Tente novamente.');
      }
    } else {
      this.markFormGroupTouched(this.usernameForm);
    }
  }

  protected onImageUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem.');
        return;
      }
      
      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        this.profileImage.set(result);
        this.saveProfileImage(result);
      };
      reader.readAsDataURL(file);
    }
  }

  protected removeProfileImage(): void {
    this.profileImage.set(null);
    this.saveProfileImage(null);
  }

  protected logout(): void {
    if (confirm('Tem certeza que deseja sair?')) {
      this.authService.logout();
    }
  }

  protected goBack(): void {
    this.router.navigate(['/home']);
  }

  private updateUserEmail(newEmail: string): boolean {
    // Simular validação e atualização
    // Em produção, isso seria uma chamada para API
    const currentUser = this.currentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, email: newEmail };
      this.authService.updateUser(updatedUser);
      // Atualizar o signal local também
      this.currentUser.set(updatedUser);
      return true;
    }
    return false;
  }

  private updateUserPassword(currentPassword: string, newPassword: string): boolean {
    // Simular validação da senha atual e atualização
    // Em produção, isso seria uma chamada para API
    if (currentPassword && newPassword) {
      return true; // Simular sucesso
    }
    return false;
  }

  private updateUserUsername(newUsername: string): boolean {
    // Simular validação e atualização
    // Em produção, isso seria uma chamada para API
    const currentUser = this.currentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, username: newUsername };
      this.authService.updateUser(updatedUser);
      // Atualizar o signal local também
      this.currentUser.set(updatedUser);
      return true;
    }
    return false;
  }

  private emailMatchValidator(formGroup: FormGroup): { [key: string]: any } | null {
    const newEmail = formGroup.get('newEmail');
    const confirmEmail = formGroup.get('confirmEmail');
    return newEmail && confirmEmail && newEmail.value !== confirmEmail.value
      ? { emailMismatch: true }
      : null;
  }

  private passwordMatchValidator(formGroup: FormGroup): { [key: string]: any } | null {
    const newPassword = formGroup.get('newPassword');
    const confirmPassword = formGroup.get('confirmPassword');
    return newPassword && confirmPassword && newPassword.value !== confirmPassword.value
      ? { passwordMismatch: true }
      : null;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private loadProfileImage(): void {
    if (typeof window !== 'undefined') {
      const savedImage = localStorage.getItem('profileImage');
      if (savedImage) {
        this.profileImage.set(savedImage);
      }
    }
  }

  private saveProfileImage(imageData: string | null): void {
    if (typeof window !== 'undefined') {
      if (imageData) {
        localStorage.setItem('profileImage', imageData);
      } else {
        localStorage.removeItem('profileImage');
      }
    }
  }
}
