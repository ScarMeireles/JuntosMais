import { Component, signal } from '@angular/core';

export interface NGO {
  id: number;
  name: string;
  type: string;
  description: string;
  location: string;
  website?: string;
  phone?: string;
  email?: string;
  verified: boolean;
  rating: number;
  donationsReceived: number;
  targetAmount: number;
}

@Component({
  selector: 'app-home-component',
  standalone: true,
  imports: [],
  templateUrl: './home-component.html',
  styleUrl: './home-component.sass'
})
export class HomeComponent {
  protected readonly Math = Math;
  
  protected readonly ngos = signal<NGO[]>([
    {
      id: 1,
      name: 'Amigos dos Animais',
      type: 'Proteção Animal',
      description: 'Resgate, reabilitação e adoção de animais em situação de rua. Oferecemos cuidados veterinários e programas de castração.',
      location: 'São Paulo, SP',
      website: 'www.amigosdosanimais.org.br',
      phone: '(11) 99999-0001',
      email: 'contato@amigosdosanimais.org.br',
      verified: true,
      rating: 4.8,
      donationsReceived: 45000,
      targetAmount: 100000
    },
    {
      id: 2,
      name: 'Cuidar é Amar',
      type: 'Crianças e Adolescentes',
      description: 'Apoio educacional e psicossocial para crianças em vulnerabilidade social. Oferecemos reforço escolar e atividades recreativas.',
      location: 'Rio de Janeiro, RJ',
      website: 'www.cuidareamar.org.br',
      phone: '(21) 99999-0002',
      email: 'contato@cuidareamar.org.br',
      verified: true,
      rating: 4.9,
      donationsReceived: 78000,
      targetAmount: 150000
    },
    {
      id: 3,
      name: 'Viver Bem',
      type: 'População em Situação de Rua',
      description: 'Entrega de refeições, kits de higiene e acesso a serviços básicos para pessoas em situação de rua.',
      location: 'Belo Horizonte, MG',
      website: 'www.viverbem.org.br',
      phone: '(31) 99999-0003',
      email: 'contato@viverbem.org.br',
      verified: true,
      rating: 4.7,
      donationsReceived: 32000,
      targetAmount: 80000
    },
    {
      id: 4,
      name: 'Esperança Viva',
      type: 'Saúde e Pesquisa',
      description: 'Apoio a pacientes com câncer e suas famílias. Financiamos pesquisas e oferecemos suporte psicológico.',
      location: 'Porto Alegre, RS',
      website: 'www.esperancaviva.org.br',
      phone: '(51) 99999-0004',
      email: 'contato@esperancaviva.org.br',
      verified: true,
      rating: 4.9,
      donationsReceived: 120000,
      targetAmount: 200000
    },
    {
      id: 5,
      name: 'Verde Futuro',
      type: 'Meio Ambiente',
      description: 'Projetos de reflorestamento e educação ambiental para comunidades. Preservamos áreas verdes urbanas.',
      location: 'Curitiba, PR',
      website: 'www.verdefuturo.org.br',
      phone: '(41) 99999-0005',
      email: 'contato@verdefuturo.org.br',
      verified: true,
      rating: 4.6,
      donationsReceived: 28000,
      targetAmount: 60000
    },
    {
      id: 6,
      name: 'Casa do Saber',
      type: 'Educação',
      description: 'Bibliotecas comunitárias e programas de alfabetização para todas as idades. Promovemos o acesso à educação.',
      location: 'Salvador, BA',
      website: 'www.casadosaber.org.br',
      phone: '(71) 99999-0006',
      email: 'contato@casadosaber.org.br',
      verified: true,
      rating: 4.8,
      donationsReceived: 55000,
      targetAmount: 120000
    },
    {
      id: 7,
      name: 'Coração Solidário',
      type: 'Idosos',
      description: 'Cuidados e atividades para idosos em situação de vulnerabilidade. Oferecemos companhia e assistência médica.',
      location: 'Fortaleza, CE',
      website: 'www.coracaosolidario.org.br',
      phone: '(85) 99999-0007',
      email: 'contato@coracaosolidario.org.br',
      verified: true,
      rating: 4.7,
      donationsReceived: 38000,
      targetAmount: 90000
    },
    {
      id: 8,
      name: 'Mulheres em Ação',
      type: 'Direitos das Mulheres',
      description: 'Apoio a mulheres vítimas de violência. Oferecemos abrigo, assistência jurídica e capacitação profissional.',
      location: 'Recife, PE',
      website: 'www.mulheresemacao.org.br',
      phone: '(81) 99999-0008',
      email: 'contato@mulheresemacao.org.br',
      verified: true,
      rating: 4.9,
      donationsReceived: 67000,
      targetAmount: 130000
    },
    {
      id: 9,
      name: 'Inclusão Digital',
      type: 'Tecnologia Social',
      description: 'Democratizamos o acesso à tecnologia através de cursos de informática e doação de equipamentos.',
      location: 'Brasília, DF',
      website: 'www.inclusaodigital.org.br',
      phone: '(61) 99999-0009',
      email: 'contato@inclusaodigital.org.br',
      verified: true,
      rating: 4.5,
      donationsReceived: 42000,
      targetAmount: 100000
    },
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
