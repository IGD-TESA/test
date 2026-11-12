import type { Routes } from '@angular/router';
import { featurePageRoute } from '../../shared/routing/feature-route.factory';

export const SERVICES_ROUTES: Routes = [
  featurePageRoute(
    '',
    'خدمات',
    'مدیریت خدمات وابسته به اجرای معامله.',
  ),
  featurePageRoute(
    'transport',
    'حمل‌ونقل',
    'پیگیری خدمات حمل‌ونقل.',
  ),
  featurePageRoute(
    'storage',
    'انبارداری',
    'پیگیری خدمات انبارداری.',
  ),
  featurePageRoute(
    'insurance',
    'بیمه',
    'پیگیری خدمات بیمه.',
  ),
  featurePageRoute(
    'inspection',
    'بازرسی',
    'پیگیری خدمات بازرسی.',
  ),
  featurePageRoute(
    'installation',
    'نصب',
    'پیگیری خدمات نصب.',
  ),
  featurePageRoute(
    'delivery',
    'تحویل',
    'پیگیری مراحل تحویل.',
  ),
];