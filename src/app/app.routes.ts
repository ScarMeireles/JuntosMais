import { Routes } from '@angular/router';
import { AuthComponent } from './auth-component/auth-component';
import { HomeComponent } from './home-component/home-component';
import { ConfiguracoesComponent } from './configuracoes-component/configuracoes-component';

export const routes: Routes = [
  { path: '', component: AuthComponent },
  { path: 'home', component: HomeComponent },
  { path: 'configuracoes', component: ConfiguracoesComponent },
  { path: '**', redirectTo: '' }
];
