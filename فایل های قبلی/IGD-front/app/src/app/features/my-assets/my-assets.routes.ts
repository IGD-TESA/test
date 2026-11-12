import type { Routes } from '@angular/router';
import { featurePageRoute } from '../../shared/routing/feature-route.factory';

export const MY_ASSETS_ROUTES: Routes = [
  featurePageRoute(
    '',
    'دارایی‌های من',
    'نمای کلی دارایی‌ها و موقعیت‌های کاربر.',
  ),
  featurePageRoute(
    'holdings',
    'دارایی‌ها',
    'مشاهده دارایی‌های ثبت‌شده.',
  ),
  featurePageRoute(
    'positions',
    'موقعیت‌ها',
    'مشاهده موقعیت‌های دارایی.',
  ),
  featurePageRoute(
    'reservations',
    'رزروها',
    'مشاهده منابع رزروشده و وضعیت آن‌ها.',
  ),
  featurePageRoute(
    'purchasing-power',
    'توان خرید',
    'مشاهده توان خرید اعلام‌شده از مرجع دارایی‌ها.',
  ),
];