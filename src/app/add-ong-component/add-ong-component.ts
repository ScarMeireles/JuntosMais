import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CampanhasService, Campanha } from '../campanhas.service';

@Component({
  selector: 'app-add-ong-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-ong-component.html',
  styleUrl: './add-ong-component.sass'
})
export class AddOngComponent implements OnInit {
  protected readonly campanhaTypes = signal<string[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  protected formData: Partial<Campanha> = {
    name: '',
    type: '',
    description: '',
    location: '',
    website: '',
    phone: '',
    email: '',
    verified: false,
    rating: 0,
    donationsReceived: 0,
    targetAmount: 0,
    data_fim: undefined
  };

  constructor(
    private campanhasService: CampanhasService,
    private router: Router
  ) {}

  ngOnInit(): void {

  }

  protected onSubmit(): void {
    if (!this.formData.name || !this.formData.type || !this.formData.description || 
        !this.formData.location || !this.formData.targetAmount || this.formData.targetAmount <= 0) {
      this.errorMessage.set('Por favor, preencha todos os campos obrigatórios.');
      this.successMessage.set(null);
      return;
    }

    if (this.formData.email && !this.isValidEmail(this.formData.email)) {
      this.errorMessage.set('Por favor, insira um email válido.');
      this.successMessage.set(null);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const newCampanha: Omit<Campanha, 'id'> = {
      name: this.formData.name!,
      type: this.formData.type!,
      description: this.formData.description!,
      location: this.formData.location!,
      website: this.formData.website || undefined,
      phone: this.formData.phone || undefined,
      email: this.formData.email || undefined,
      verified: false,
      rating: 0,
      donationsReceived: 0,
      targetAmount: this.formData.targetAmount!,
      data_fim: this.formData.data_fim || undefined
    };

    this.campanhasService.addCampanha(newCampanha).subscribe({
      next: (campanha) => {
        this.isLoading.set(false);
        this.successMessage.set(`Campanha "${campanha.name}" adicionada com sucesso!`);
        
        setTimeout(() => {
          this.resetForm();
          this.router.navigate(['/home']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set('Erro ao adicionar campanha. Por favor, tente novamente.');
        console.error('Erro ao adicionar campanha:', error);
      }
    });
  }

  protected resetForm(): void {
    this.formData = {
      name: '',
      type: '',
      description: '',
      location: '',
      website: '',
      phone: '',
      email: '',
      verified: false,
      rating: 0,
      donationsReceived: 0,
      targetAmount: 0,
      data_fim: undefined
    };
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  protected goBack(): void {
    this.router.navigate(['/home']);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}