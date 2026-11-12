import type { Routes } from '@angular/router';
import { AccountWorkspacePage } from './pages/account-workspace.page';

function accountPage(
  path: string,
  section: string,
  title: string,
  description: string
) {
  return {
    path,
    component: AccountWorkspacePage,
    data: {
      section,
      title,
      description
    }
  };
}

export const ACCOUNT_ROUTES: Routes = [
  accountPage(
    '',
    'overview',
    'حساب من',
    'نمای کلی حساب کاربری و دسترسی به بخش‌های مختلف'
  ),
  accountPage(
    'profile',
    'profile',
    'اطلاعات حساب',
    'مشاهده و مدیریت اطلاعات پایه حساب کاربری'
  ),
  accountPage(
    'legal-entity',
    'legal-entity',
    'اطلاعات شخصیت حقوقی',
    'مدیریت مشخصات اشخاص حقوقی و اطلاعات سازمانی'
  ),
  accountPage(
    'contacts',
    'contacts',
    'راه‌های ارتباطی',
    'مدیریت شماره‌های تماس و نشانی‌های ایمیل'
  ),
  accountPage(
    'verification',
    'verification',
    'احراز هویت',
    'ثبت درخواست و پیگیری وضعیت احراز هویت'
  ),
  accountPage(
    'security',
    'security',
    'امنیت حساب',
    'مدیریت رمز عبور و تنظیمات امنیتی'
  ),
  accountPage(
    'devices',
    'devices',
    'دستگاه‌ها',
    'مشاهده و مدیریت دستگاه‌های متصل به حساب'
  ),
  accountPage(
    'sessions',
    'sessions',
    'نشست‌ها',
    'مشاهده وضعیت نشست‌های فعال حساب'
  ),
  accountPage(
    'permissions',
    'permissions',
    'دسترسی‌ها',
    'مشاهده سطح دسترسی و مجوزهای حساب'
  ),
  accountPage(
    'login',
    'login',
    'ورود',
    'ورود به حساب کاربری'
  ),
  accountPage(
    'register',
    'register',
    'ثبت‌نام',
    'ایجاد حساب کاربری'
  ),
  accountPage(
    'recover-password',
    'recover-password',
    'بازیابی رمز عبور',
    'بازیابی دسترسی به حساب کاربری'
  ),
  {
    path: '**',
    redirectTo: ''
  }
];