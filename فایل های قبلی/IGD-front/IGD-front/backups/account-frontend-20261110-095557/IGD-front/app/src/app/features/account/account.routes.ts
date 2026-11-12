import type { Routes } from '@angular/router';

const accountPage = (
  path: string,
  section: string,
  title: string,
  description: string,
) => ({
  path,
  title: `حساب من | ${title}`,
  data: { section, heading: title, description },
  loadComponent: () =>
    import('./pages/account-workspace.page').then(
      (module) => module.AccountWorkspacePage,
    ),
});

export const ACCOUNT_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    ...accountPage(
      '',
      'overview',
      'نمای کلی حساب',
      'نمای کلی اطلاعات و وضعیت حساب کاربری',
    ),
  },
  accountPage('profile', 'profile', 'اطلاعات شخصی', 'مشاهده و مدیریت اطلاعات هویتی'),
  accountPage('legal-entity', 'legal-entity', 'اطلاعات حقوقی', 'اطلاعات اشخاص حقوقی و شرکت‌ها'),
  accountPage('contacts', 'contacts', 'راه‌های ارتباطی', 'مدیریت شماره تماس و نشانی‌های الکترونیکی'),
  accountPage('verification', 'verification', 'احراز هویت', 'مدارک و مراحل احراز هویت'),
  accountPage('security', 'security', 'امنیت حساب', 'تنظیمات امنیتی و تغییر رمز عبور'),
  accountPage('devices', 'devices', 'دستگاه‌های من', 'مشاهده و مدیریت دستگاه‌های متصل'),
  accountPage('sessions', 'sessions', 'نشست‌های فعال', 'مشاهده نشست‌های کاربری'),
  accountPage('permissions', 'permissions', 'نقش و دسترسی‌ها', 'مشاهده سطح دسترسی حساب'),
  accountPage('login', 'login', 'ورود', 'ورود به حساب کاربری'),
  accountPage('register', 'register', 'ثبت‌نام', 'ایجاد حساب کاربری'),
  accountPage('recover-password', 'recover-password', 'بازیابی رمز عبور', 'بازیابی دسترسی به حساب'),
  { path: '**', redirectTo: '' },
];