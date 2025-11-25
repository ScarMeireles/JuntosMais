import { Component, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CampanhasService, Campanha } from '../campanhas.service';

@Component({
  selector: 'app-home-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-component.html',
  styleUrl: './home-component.sass'
})
export class HomeComponent implements OnInit {
  protected readonly Math = Math;
  protected readonly allCampanhas = signal<Campanha[]>([]);
  protected readonly selectedFilter = signal<string | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  
  // Extrair types únicos das campanhas
  protected readonly campanhaTypes = computed(() => {
    const types = this.allCampanhas().map(campanha => campanha.type);
    return ['Todos', ...Array.from(new Set(types)).sort()];
  });
  
  // Filtrar campanhas baseado no filtro selecionado
  protected readonly campanhas = computed(() => {
    const filter = this.selectedFilter();
    if (!filter || filter === 'Todos') {
      return this.allCampanhas();
    }
    return this.allCampanhas().filter(campanha => campanha.type === filter);
  });

  // Calcular progresso da campanha
protected getProgressPercentage(campanha: Campanha): number {
  if (!campanha.targetAmount || campanha.targetAmount <= 0) return 0;
  const donated = campanha.donationsReceived ?? 0; // Adicionar esta linha
  return Math.min((donated / campanha.targetAmount) * 100, 100);
}
  constructor(private campanhasService: CampanhasService, private router: Router) {}

  ngOnInit(): void {
    this.loadCampanhas();
  }

  protected goToDonation(campanha?: Campanha): void {
    if (campanha?.id) {
      this.router.navigate(['/doacao'], {
        state: {
          campanha: campanha,
          amount: ''
        }
      });
    }
  }

  protected viewDetails(campanhaId?: number): void {
    if (campanhaId) {
      this.router.navigate(['/campanha', campanhaId]);
    }
  }

  private loadCampanhas(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.campanhasService.getCampanhas().subscribe({
      next: (data) => {
        this.allCampanhas.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar campanhas:', error);
        this.errorMessage.set('Erro ao carregar campanhas. Tente novamente.');
        this.allCampanhas.set([]);
        this.isLoading.set(false);
      }
    });
  }

  protected selectFilter(type: string | null): void {
    if (this.selectedFilter() === type) {
      this.selectedFilter.set(null);
    } else {
      this.selectedFilter.set(type);
    }
  }
}