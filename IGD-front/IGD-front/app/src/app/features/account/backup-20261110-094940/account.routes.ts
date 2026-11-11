import type { Routes } from '@angular/router';

export const ACCOUNT_ROUTES: Routes = [
  {
    path: '',
    title: 'حساب من | IGD',
    data: { section: 'overview' },
    loadComponent: () =>
      import('./pages/account-workspace.page').then(
        (module) => module.AccountWorkspacePage,
      ),
  },
  {
    path: 'profile',
    title: 'اطلاعات شخصی | IGD',
    data: { section: 'profile' },
    loadComponent: () =>
      import('./pages/account-workspace.page').then(
        (module) => module.AccountWorkspacePage,
      ),
  },
  {
    path: 'legal-entity',
    title: 'اطلاعات حقوقی | IGD',
    data: { section: 'legal-entity' },
    loadComponent: () =>
      import('./pages/account-workspace.page').then(
        (module) => module.AccountWorkspacePage,
      ),
  },
  {
    path: 'contacts',
    title: 'راه‌های ارتباطی | IGD',
    data: { section: 'contacts' },
    loadComponent: () =>
      import('./pages/account-workspace.page').then(
        (module) => module.AccountWorkspacePage,
      ),
  },
  {
    path: 'verification',
    title: 'احراز هویت | IGD',
    data: { section: 'verification' },
    loadComponent: () =>
      import('./pages/account-workspace.page').then(
        (module) => module.AccountWorkspacePage,
      ),
  },
  {
    path: 'security',
    title: 'امنیت حساب | IGD',
    data: { section: 'security' },
    loadComponent: () =>
      import('./pages/account-workspace.page').then(
        (module) => module.AccountWorkspacePage,
      ),
  },
  {
    path: 'devices',
    title: 'دستگاه‌های متصل | IGD',
    data: { section: 'devices' },
    loadComponent: () =>
      import('./pages/account-workspace.page').then(
        (module) => module.AccountWorkspacePage,
      ),
  },
  {
    path: 'sessions',
    title: 'نشست‌های کاربری | IGD',
    data: { section: 'sessions' },
    loadComponent: () =>
      import('./pages/account-workspace.page').then(
        (module) => module.AccountWorkspacePage,
      ),
  },
  {
    path: 'permissions',
    title: 'مجوزهای دسترسی | IGD',
    data: { section: 'permissions' },
    loadComponent: () =>
      import('./pages/account-workspace.page').then(
        (module) => module.AccountWorkspacePage,
      ),
  },
  {
    path: 'login',
    title: 'ورود | IGD',
    data: { section: 'login' },
    loadComponent: () =>
      import('./pages/account-workspace.page').then(
        (module) => module.AccountWorkspacePage,
      ),
  },
  {
    path: 'register',
    title: 'ثبت‌نام | IGD',
    data: { section: 'register' },
    loadComponent: () =>
      import('./pages/account-workspace.page').then(
        (module) => module.AccountWorkspacePage,
      ),
  },
  {
    path: 'recover-password',
    title: 'بازیابی رمز عبور | IGD',
    data: { section: 'recover-password' },
    loadComponent: () =>
      import('./pages/account-workspace.page').then(
        (module) => module.AccountWorkspacePage,
      ),
  },
];