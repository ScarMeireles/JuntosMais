import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgosService, NGO } from '../ngos.service';

@Component({
  selector: 'app-add-ong-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-ong-component.html',
  styleUrl: './add-ong-component.sass'
})
export class AddOngComponent implements OnInit {
  protected readonly ngoTypes = signal<string[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  protected formData: Partial<NGO> = {
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
    targetAmount: 0
  };

  constructor(
    private ngosService: NgosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadNGOTypes();
  }

  private loadNGOTypes(): void {
    this.ngosService.getNGOTypes().subscribe({
      next: (types) => {
        this.ngoTypes.set(types);
      },
      error: (error) => {
        console.error('Erro ao carregar tipos de ONGs:', error);
      }
    });
  }

  protected onSubmit(): void {
    // Validação básica
    if (!this.formData.name || !this.formData.type || !this.formData.description || 
        !this.formData.location || !this.formData.targetAmount || this.formData.targetAmount <= 0) {
      this.errorMessage.set('Por favor, preencha todos os campos obrigatórios.');
      this.successMessage.set(null);
      return;
    }

    // Validação de email se fornecido
    if (this.formData.email && !this.isValidEmail(this.formData.email)) {
      this.errorMessage.set('Por favor, insira um email válido.');
      this.successMessage.set(null);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const newNGO: Omit<NGO, 'id'> = {
      name: this.formData.name!,
      type: this.formData.type!,
      description: this.formData.description!,
      location: this.formData.location!,
      website: this.formData.website || undefined,
      phone: this.formData.phone || undefined,
      email: this.formData.email || undefined,
      verified: false, // Novas ONGs começam como não verificadas
      rating: 0, // Novas ONGs começam com rating 0
      donationsReceived: 0, // Novas ONGs começam sem doações
      targetAmount: this.formData.targetAmount!
    };

    this.ngosService.addNGO(newNGO).subscribe({
      next: (ngo) => {
        this.isLoading.set(false);
        this.successMessage.set(`ONG "${ngo.name}" adicionada com sucesso!`);
        
        // Limpar formulário após sucesso
        setTimeout(() => {
          this.resetForm();
          this.router.navigate(['/home']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set('Erro ao adicionar ONG. Por favor, tente novamente.');
        console.error('Erro ao adicionar ONG:', error);
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
      targetAmount: 0
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

