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
  protected readonly profileImage = signal<string | null>(null);
  
  protected settingsForm: FormGroup;

  constructor(
    private fb: FormBuilder, 
    private router: Router, 
    private authService: AuthService
  ) {
    // Inicializar currentUser após a injeção do authService
    this.currentUser.set(this.authService.getCurrentUser());
    
    this.settingsForm = this.fb.group({
      nome: [this.currentUser()?.username || '', [Validators.required, Validators.minLength(3)]],
      email: [this.currentUser()?.email || '', [Validators.required, Validators.email]],
      senhaAtual: [''],
      novaSenha: [''],
      confirmarSenha: ['']
    }, { validators: this.passwordMatchValidator });

    // Adicionar listeners para validar dinamicamente os campos de senha
    this.settingsForm.get('senhaAtual')?.valueChanges.subscribe(() => {
      this.settingsForm.updateValueAndValidity();
    });
    this.settingsForm.get('novaSenha')?.valueChanges.subscribe(() => {
      this.settingsForm.updateValueAndValidity();
    });
    this.settingsForm.get('confirmarSenha')?.valueChanges.subscribe(() => {
      this.settingsForm.updateValueAndValidity();
    });

    // Carregar foto de perfil salva
    this.loadProfileImage();
  }

  protected onSubmit(): void {
    if (this.settingsForm.valid) {
      const { nome, email, senhaAtual, novaSenha } = this.settingsForm.value;
      const trimmedSenhaAtual = (senhaAtual || '').trim();
      const trimmedNovaSenha = (novaSenha || '').trim();
      const messages: string[] = [];
      
      // Atualizar nome se foi alterado
      if (nome && nome.trim() !== this.currentUser()?.username) {
        if (this.updateUserUsername(nome.trim())) {
          messages.push('Nome atualizado com sucesso');
        } else {
          alert('Erro ao atualizar nome. Tente novamente.');
          return;
        }
      }
      
      // Atualizar email se foi alterado
      if (email && email.trim() !== this.currentUser()?.email) {
        if (this.updateUserEmail(email.trim())) {
          messages.push('Email atualizado com sucesso');
        } else {
          alert('Erro ao atualizar email. Tente novamente.');
          return;
        }
      }
      
      // Atualizar senha se foi preenchida
      if (trimmedSenhaAtual && trimmedNovaSenha) {
        if (this.updateUserPassword(trimmedSenhaAtual, trimmedNovaSenha)) {
          messages.push('Senha atualizada com sucesso');
          // Limpar campos de senha após sucesso
          this.settingsForm.patchValue({
            senhaAtual: '',
            novaSenha: '',
            confirmarSenha: ''
          });
          // Forçar validação para limpar erros
          this.settingsForm.updateValueAndValidity();
        } else {
          alert('Senha atual incorreta ou erro ao atualizar senha.');
          return;
        }
      }
      
      if (messages.length > 0) {
        alert(messages.join('\n'));
      } else {
        // Nenhuma alteração foi feita
        alert('Nenhuma alteração foi realizada.');
      }
    } else {
      this.markFormGroupTouched(this.settingsForm);
      alert('Por favor, corrija os erros no formulário antes de salvar.');
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

  private passwordMatchValidator(formGroup: FormGroup): { [key: string]: any } | null {
    const novaSenha = formGroup.get('novaSenha');
    const confirmarSenha = formGroup.get('confirmarSenha');
    const senhaAtual = formGroup.get('senhaAtual');
    
    if (!novaSenha || !confirmarSenha || !senhaAtual) {
      return null;
    }
    
    const novaSenhaValue = (novaSenha.value || '').trim();
    const confirmarSenhaValue = (confirmarSenha.value || '').trim();
    const senhaAtualValue = (senhaAtual.value || '').trim();
    
    // Se todos os campos de senha estão vazios, senha é opcional - limpar erros
    if (!novaSenhaValue && !confirmarSenhaValue && !senhaAtualValue) {
      // Limpar erros de senha se todos os campos estiverem vazios
      if (senhaAtual.errors) {
        const { required, ...otherErrors } = senhaAtual.errors;
        senhaAtual.setErrors(Object.keys(otherErrors).length > 0 ? otherErrors : null);
      }
      if (novaSenha.errors) {
        const { required, minlength, ...otherErrors } = novaSenha.errors;
        novaSenha.setErrors(Object.keys(otherErrors).length > 0 ? otherErrors : null);
      }
      if (confirmarSenha.errors) {
        const { required, ...otherErrors } = confirmarSenha.errors;
        confirmarSenha.setErrors(Object.keys(otherErrors).length > 0 ? otherErrors : null);
      }
      return null;
    }
    
    // Se qualquer campo de senha estiver preenchido, verificar se todos estão preenchidos e válidos
    let hasError = false;
    
    // Verificar se senha atual está preenchida
    if (!senhaAtualValue && (novaSenhaValue || confirmarSenhaValue)) {
      if (!senhaAtual.errors || !senhaAtual.errors['required']) {
        senhaAtual.setErrors({ ...(senhaAtual.errors || {}), required: true });
      }
      hasError = true;
    } else if (senhaAtualValue && senhaAtual.errors?.['required']) {
      const { required, ...otherErrors } = senhaAtual.errors;
      senhaAtual.setErrors(Object.keys(otherErrors).length > 0 ? otherErrors : null);
    }
    
    // Verificar se nova senha está preenchida e tem tamanho mínimo
    if (!novaSenhaValue && (senhaAtualValue || confirmarSenhaValue)) {
      if (!novaSenha.errors || !novaSenha.errors['required']) {
        novaSenha.setErrors({ ...(novaSenha.errors || {}), required: true });
      }
      hasError = true;
    } else if (novaSenhaValue) {
      if (novaSenhaValue.length < 6) {
        novaSenha.setErrors({ ...(novaSenha.errors || {}), minlength: { requiredLength: 6, actualLength: novaSenhaValue.length } });
        hasError = true;
      } else {
        const { required, minlength, ...otherErrors } = novaSenha.errors || {};
        novaSenha.setErrors(Object.keys(otherErrors).length > 0 ? otherErrors : null);
      }
    }
    
    // Verificar se confirmação de senha está preenchida e coincide
    if (!confirmarSenhaValue && (senhaAtualValue || novaSenhaValue)) {
      if (!confirmarSenha.errors || !confirmarSenha.errors['required']) {
        confirmarSenha.setErrors({ ...(confirmarSenha.errors || {}), required: true });
      }
      hasError = true;
    } else if (confirmarSenhaValue && novaSenhaValue && novaSenhaValue !== confirmarSenhaValue) {
      // Senhas não coincidem
      return { passwordMismatch: true };
    } else if (confirmarSenhaValue && novaSenhaValue && novaSenhaValue === confirmarSenhaValue) {
      // Senhas coincidem, limpar erro de required se existir
      const { required, ...otherErrors } = confirmarSenha.errors || {};
      confirmarSenha.setErrors(Object.keys(otherErrors).length > 0 ? otherErrors : null);
    }
    
    return hasError ? { passwordFieldsIncomplete: true } : null;
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
