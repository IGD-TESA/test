import type { Routes } from '@angular/router';
import { featurePageRoute } from '../../shared/routing/feature-route.factory';

export const NOTIFICATIONS_ROUTES: Routes = [
  featurePageRoute(
    '',
    'اعلان‌ها',
    'مشاهده اعلان‌ها و رویدادهای حساب.',
  ),
  featurePageRoute(
    'preferences',
    'تنظیمات اعلان‌ها',
    'مدیریت ترجیحات دریافت اعلان‌ها.',
  ),
];