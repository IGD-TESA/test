import { environment } from '../../../environments/environment';

export const RUNTIME_CONFIG = Object.freeze({
  production: environment.production,
  apiBaseUrl: environment.apiBaseUrl,
});