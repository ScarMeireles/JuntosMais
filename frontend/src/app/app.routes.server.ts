import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Server },
  { path: 'home', renderMode: RenderMode.Server },
  { path: 'configuracoes', renderMode: RenderMode.Server },
  { path: 'doacao', renderMode: RenderMode.Server },
  { path: 'doacao/:campanhaId', renderMode: RenderMode.Server },
  { path: 'adicionar-ong', renderMode: RenderMode.Server },
  { path: '**', renderMode: RenderMode.Server }
];
