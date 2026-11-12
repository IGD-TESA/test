import type { Routes } from '@angular/router';
import { featurePageRoute } from '../../shared/routing/feature-route.factory';

export const SETTLEMENT_ROUTES: Routes = [
  featurePageRoute(
    '',
    'تسویه',
    'نمای کلی وضعیت تسویه معاملات.',
  ),
  featurePageRoute(
    'status',
    'وضعیت تسویه',
    'مشاهده آمادگی و وضعیت عملیات تسویه.',
  ),
  featurePageRoute(
    'history',
    'تاریخچه تسویه',
    'مشاهده سوابق عملیات تسویه.',
  ),
];