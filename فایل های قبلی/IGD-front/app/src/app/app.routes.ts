import type { Routes } from '@angular/router';
import { featurePageRoute } from './shared/routing/feature-route.factory';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'market',
  },
  {
    path: 'market',
    loadChildren: () =>
      import('./features/general-market/general-market.routes').then(
        (module) => module.GENERAL_MARKET_ROUTES,
      ),
  },
  {
    path: 'assets',
    loadChildren: () =>
      import('./features/my-assets/my-assets.routes').then(
        (module) => module.MY_ASSETS_ROUTES,
      ),
  },
  {
    path: 'account',
    outlet: 'accountPanel',
    loadChildren: () =>
      import('./features/account/account.routes').then(
        (module) => module.ACCOUNT_ROUTES,
      ),
  },
  {
    path: 'contracts',
    loadChildren: () =>
      import('./features/contracts/contracts.routes').then(
        (module) => module.CONTRACTS_ROUTES,
      ),
  },
  {
    path: 'services',
    loadChildren: () =>
      import('./features/services/services.routes').then(
        (module) => module.SERVICES_ROUTES,
      ),
  },
  {
    path: 'settlement',
    loadChildren: () =>
      import('./features/settlement/settlement.routes').then(
        (module) => module.SETTLEMENT_ROUTES,
      ),
  },
  {
    path: 'notifications',
    loadChildren: () =>
      import('./features/notifications/notifications.routes').then(
        (module) => module.NOTIFICATIONS_ROUTES,
      ),
  },
  featurePageRoute(
    '**',
    'صفحه پیدا نشد',
    'نشانی واردشده معتبر نیست یا صفحه موردنظر وجود ندارد.',
  ),
];