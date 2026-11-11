import type { Routes } from '@angular/router';
import { featurePageRoute } from '../../shared/routing/feature-route.factory';

export const CONTRACTS_ROUTES: Routes = [
  featurePageRoute(
    '',
    'قراردادها',
    'نمای کلی قراردادها و تعهدات حقوقی.',
  ),
  featurePageRoute(
    'documents',
    'اسناد قراردادی',
    'مشاهده اسناد و نسخه‌های قرارداد.',
  ),
  featurePageRoute(
    'obligations',
    'تعهدات',
    'پیگیری تعهدات قراردادی.',
  ),
  featurePageRoute(
    'templates',
    'قالب‌های قرارداد',
    'مشاهده قالب‌های قراردادی قابل استفاده.',
  ),
];