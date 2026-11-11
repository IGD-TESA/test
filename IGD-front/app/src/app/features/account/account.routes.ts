import type { Routes } from '@angular/router';
import { featurePageRoute } from '../../shared/routing/feature-route.factory';

export const ACCOUNT_ROUTES: Routes = [
  {
    path: '',
    title: 'حساب من | IGD',
    loadComponent: () =>
      import('./pages/overview/account-overview.page').then(
        (module) => module.AccountOverviewPage,
      ),
  },
  {
    path: 'profile',
    title: 'اطلاعات حساب | IGD',
    loadComponent: () =>
      import('./pages/profile/account-profile.page').then(
        (module) => module.AccountProfilePage,
      ),
  },
  {
    path: 'legal-entity',
    title: 'اطلاعات حقوقی | IGD',
    loadComponent: () =>
      import('./pages/legal-entity/account-legal-entity.page').then(
        (module) => module.AccountLegalEntityPage,
      ),
  },
  {
    path: 'contacts',
    title: 'راه‌های ارتباطی | IGD',
    loadComponent: () =>
      import('./pages/contacts/account-contacts.page').then(
        (module) => module.AccountContactsPage,
      ),
  },
  {
    path: 'verification',
    title: 'احراز هویت | IGD',
    loadComponent: () =>
      import('./pages/verification/account-verification.page').then(
        (module) => module.AccountVerificationPage,
      ),
  },
  {
    path: 'security',
    title: 'امنیت حساب | IGD',
    loadComponent: () =>
      import('./pages/security/account-security.page').then(
        (module) => module.AccountSecurityPage,
      ),
  },
  {
    path: 'devices',
    title: 'دستگاه‌های متصل | IGD',
    loadComponent: () =>
      import('./pages/devices/account-devices.page').then(
        (module) => module.AccountDevicesPage,
      ),
  },
  {
    path: 'sessions',
    title: 'نشست‌های کاربری | IGD',
    loadComponent: () =>
      import('./pages/sessions/account-sessions.page').then(
        (module) => module.AccountSessionsPage,
      ),
  },
  {
    path: 'permissions',
    title: 'مجوزهای دسترسی | IGD',
    loadComponent: () =>
      import('./pages/permissions/account-permissions.page').then(
        (module) => module.AccountPermissionsPage,
      ),
  },
  {
    path: 'agreements',
    loadChildren: () =>
      import('../contracts/contracts.routes').then(
        (module) => module.CONTRACTS_ROUTES,
      ),
  },
  {
    path: 'agreements',
    loadChildren: () =>
      import('../contracts/contracts.routes').then(
        (module) => module.CONTRACTS_ROUTES,
      ),
  },

  {
    path: 'agreements',
    loadChildren: () =>
      import('../contracts/contracts.routes').then(
        (module) => module.CONTRACTS_ROUTES,
      ),
  },
  {
    path: 'agreements',
    loadChildren: () =>
      import('../contracts/contracts.routes').then(
        (module) => module.CONTRACTS_ROUTES,
      ),
  },

  {
    path: 'agreements',
    loadChildren: () =>
      import('../contracts/contracts.routes').then(
        (module) => module.CONTRACTS_ROUTES,
      ),
  }, 
  {
    path: 'agreements',
    loadChildren: () =>
      import('../contracts/contracts.routes').then(
        (module) => module.CONTRACTS_ROUTES,
      ),
  }, 
  {
    path: 'agreements',
    loadChildren: () =>
      import('../contracts/contracts.routes').then(
        (module) => module.CONTRACTS_ROUTES,
      ),
  },featurePageRoute(
    'login',
    'ورود',
    'مسیر ورود به حساب کاربری.',
  ),
  featurePageRoute(
    'register',
    'ثبت‌نام',
    'مسیر ایجاد حساب کاربری.',
  ),
  featurePageRoute(
    'recover-password',
    'بازیابی رمز عبور',
    'مسیر بازیابی دسترسی به حساب.',
  ),
];