import { Routes } from '@angular/router';
import { AuthComponent } from './auth-component/auth-component';
import { HomeComponent } from './home-component/home-component';
import { ConfiguracoesComponent } from './configuracoes-component/configuracoes-component';
import { DonationComponent } from './donation-component/donation-component';

export const routes: Routes = [
  { path: '', component: AuthComponent },
  { path: 'home', component: HomeComponent },
  { path: 'configuracoes', component: ConfiguracoesComponent },
  { path: 'doacao', component: DonationComponent },
  { path: '**', redirectTo: '' }
];
