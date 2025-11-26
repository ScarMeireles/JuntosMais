
import 'zone.js';
import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { config } from './app/app.config.server';
import { provideHttpClient, withFetch } from '@angular/common/http';

const serverConfig = {
  ...config,
  providers: [
    ...(config?.providers ?? []),
    provideHttpClient(withFetch()), // adiciona suporte a fetch para HttpClient no SSR
  ],
};

const bootstrap = (context: BootstrapContext) =>
    bootstrapApplication(App, serverConfig, context);


export default bootstrap;