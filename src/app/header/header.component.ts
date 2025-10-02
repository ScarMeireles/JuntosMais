import { Component, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.sass'
})
export class HeaderComponent {
  protected readonly logoPath = 'assets/images/logo.png';
  protected readonly isDropdownOpen = signal(false);

  constructor(protected readonly authService: AuthService) {}

  protected readonly getCurrentUser = () => this.authService.getCurrentUser();

  protected toggleDropdown(): void {
    this.isDropdownOpen.update(open => !open);
  }

  protected goToProfile(): void {
    this.isDropdownOpen.set(false);
    // TODO: Implementar navegação para perfil
    alert('Funcionalidade de perfil em desenvolvimento');
  }

  protected goToSettings(): void {
    this.isDropdownOpen.set(false);
    // TODO: Implementar navegação para configurações
    alert('Funcionalidade de configurações em desenvolvimento');
  }

  protected logout(): void {
    this.isDropdownOpen.set(false);
    this.authService.logout();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const dropdown = target.closest('.user-dropdown');
    
    if (!dropdown) {
      this.isDropdownOpen.set(false);
    }
  }
}
