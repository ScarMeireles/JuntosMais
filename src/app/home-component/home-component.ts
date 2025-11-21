import { Component, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgosService, NGO } from '../ngos.service';

@Component({
  selector: 'app-home-component',
  standalone: true,
  imports: [],
  templateUrl: './home-component.html',
  styleUrl: './home-component.sass'
})
export class HomeComponent implements OnInit {
  protected readonly Math = Math;
  protected readonly allNGOs = signal<NGO[]>([]);
  protected readonly selectedFilter = signal<string | null>(null);
  
  // Extrair types únicos das ONGs
  protected readonly ngoTypes = computed(() => {
    const types = this.allNGOs().map(ngo => ngo.type);
    return Array.from(new Set(types)).sort();
  });
  
  // Filtrar ONGs baseado no filtro selecionado
  protected readonly ngos = computed(() => {
    const filter = this.selectedFilter();
    if (!filter) {
      return this.allNGOs();
    }
    return this.allNGOs().filter(ngo => ngo.type === filter);
  });
  
  constructor(private ngosService: NgosService, private router: Router) {}

  ngOnInit(): void {
    this.loadNGOs();
  }

  protected goToDonation(ngo?: NGO): void {
    // Passar dados da ONG e valor sugerido via state
    this.router.navigate(['/doacao'], {
      state: {
        ngo: ngo,
        amount: ngo ? '' : '' // Valor vazio para o usuário preencher
      }
    });
  }

  private loadNGOs(): void {
    this.ngosService.getNGOs().subscribe({
      next: (data) => {
        this.allNGOs.set(data);
      },
      error: (error) => {
        console.error('Erro ao carregar ONGs:', error);
        this.allNGOs.set([]);
      }
    });
  }

  protected selectFilter(type: string | null): void {
    if (this.selectedFilter() === type) {
      // Se o filtro já está selecionado, deseleciona (mostra todos)
      this.selectedFilter.set(null);
    } else {
      // Seleciona o novo filtro
      this.selectedFilter.set(type);
    }
  }

  protected readonly categories = signal([
    'Cuidado com animais de rua',
    'Crianças carentes/orfãs',
    'Moradores de rua',
    'Tratamento de doenças sem cura',
    'Educação e inclusão digital',
    'Meio ambiente e sustentabilidade'
  ]);
}
