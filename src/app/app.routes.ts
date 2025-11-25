import { Routes } from '@angular/router';
import { AuthComponent } from './auth-component/auth-component';
import { HomeComponent } from './home-component/home-component';
import { ConfiguracoesComponent } from './configuracoes-component/configuracoes-component';
import { DonationComponent } from './donation-component/donation-component';
import { AddOngComponent } from './add-ong-component/add-ong-component';

export const routes: Routes = [
  { path: '', component: AuthComponent },
  { path: 'home', component: HomeComponent },
  { path: 'configuracoes', component: ConfiguracoesComponent },
  // 🚨 LINHA ESSENCIALMENTE CORRIGIDA: Espera o parâmetro 'campanhaId'
  { path: 'doacao/:campanhaId', component: DonationComponent }, 
  { path: 'doacao', component: DonationComponent }, // Fallback opcional
  { path: 'adicionar-ong', component: AddOngComponent },
  { path: '**', redirectTo: '' }
];