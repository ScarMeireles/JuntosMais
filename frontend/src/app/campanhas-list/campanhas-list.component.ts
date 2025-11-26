import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CampanhasService, Campanha } from '../campanhas.service';

@Component({
  selector: 'app-campanhas-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './campanhas-list.component.html',
  styleUrl: './campanhas-list.component.sass'
})
export class CampanhasListComponent implements OnInit {
  protected readonly campanhas = signal<Campanha[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly selectedFilter = signal<string>('Todos');

  constructor(
    private campanhasService: CampanhasService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCampanhas();
  }

  private loadCampanhas(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.campanhasService.getCampanhas().subscribe({
      next: (campanhas) => {
        this.campanhas.set(campanhas);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar campanhas:', error);
        this.errorMessage.set('Erro ao carregar campanhas. Tente novamente.');
        this.isLoading.set(false);
      }
    });
  }

  protected filterByType(type: string): void {
    this.selectedFilter.set(type);
  }

  protected getFilteredCampanhas(): Campanha[] {
    const filter = this.selectedFilter();
    if (filter === 'Todos') {
      return this.campanhas();
    }
    return this.campanhas().filter(c => c.type === filter);
  }

  protected getUniqueTypes(): string[] {
    const types = this.campanhas().map(c => c.type);
    return ['Todos', ...Array.from(new Set(types))];
  }

  protected getProgressPercentage(campanha: Campanha): number {
    if (!campanha.targetAmount || campanha.targetAmount <= 0) return 0;
    return Math.min((campanha.donationsReceived / campanha.targetAmount) * 100, 100);
  }

  protected viewDetails(campanhaId: number | undefined): void {
    if (campanhaId) {
      this.router.navigate(['/campanha', campanhaId]);
    }
  }

  protected doarAgora(campanha: Campanha): void {
      const campanhaId = campanha.id;

      if (campanhaId === undefined || campanhaId === null) {
        console.error('Campanha sem ID definido. Verifique os dados recebidos da API.');
        // Adicionar um alerta ou mensagem de erro aqui é uma boa prática
        return; 
      }
      
      const id: number = Number(campanhaId);

      if (isNaN(id) || id <= 0) {
        console.error(`ID da Campanha inválido: ${campanhaId}. Não é um número.`);
        return;
      }
      
      // ✅ ESTA LINHA DEVE SER A ÚLTIMA VERSÃO:
      // Ela gera a URL correta: /doacao/ID
      this.router.navigate(['/doacao', id]);

      console.log(typeof campanha.id, campanha.id);
  }

}