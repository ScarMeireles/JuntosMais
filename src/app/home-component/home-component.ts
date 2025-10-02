import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-home-component',
  standalone: true,
  imports: [],
  templateUrl: './home-component.html',
  styleUrl: './home-component.sass'
})
export class HomeComponent {
  protected readonly ngos = signal([
    {
      name: 'Amigos dos Animais',
      type: 'Proteção animal',
      description: 'Resgate, reabilitação e adoção de animais em situação de rua.'
    },
    {
      name: 'Cuidar é Amar',
      type: 'Crianças e adolescentes',
      description: 'Apoio educacional e psicossocial para crianças em vulnerabilidade.'
    },
    {
      name: 'Viver Bem',
      type: 'População em situação de rua',
      description: 'Entrega de refeições, kits de higiene e acesso a serviços básicos.'
    },
    {
      name: 'Esperança Viva',
      type: 'Saúde e pesquisa',
      description: 'Apoio a pacientes e iniciativas de pesquisa em doenças crônicas.'
    },
    {
      name: 'Verde Futuro',
      type: 'Meio ambiente',
      description: 'Projetos de reflorestamento e educação ambiental para comunidades.'
    },
    {
      name: 'Casa do Saber',
      type: 'Educação',
      description: 'Bibliotecas comunitárias e programas de alfabetização para todas as idades.'
    }
  ]);

  protected readonly categories = signal([
    'Cuidado com animais de rua',
    'Crianças carentes/orfãs',
    'Moradores de rua',
    'Tratamento de doenças sem cura',
    'Educação e inclusão digital',
    'Meio ambiente e sustentabilidade'
  ]);
}
