import type { Routes } from '@angular/router';
import { featurePageRoute } from '../../shared/routing/feature-route.factory';

export const GENERAL_MARKET_ROUTES: Routes = [
  {
    path: '',
    title: 'بازار کلی | IGD',
    loadComponent: () =>
      import('./general-market').then(
        (module) => module.GeneralMarketPage,
      ),
  },
  featurePageRoute(
    'catalogue',
    'کاتالوگ بازار',
    'طبقه‌بندی، جست‌وجو و مشاهده عرضه‌ها.',
  ),
  featurePageRoute(
    'markets',
    'بازارها',
    'مشاهده بازارها و وضعیت فعالیت آن‌ها.',
  ),
  featurePageRoute(
    'offers',
    'عرضه‌ها',
    'مدیریت و مشاهده چرخه عمر عرضه‌ها.',
  ),
  featurePageRoute(
    'offer-requests',
    'درخواست‌های عرضه',
    'ثبت و پیگیری درخواست‌های عرضه.',
  ),
  featurePageRoute(
    'proposals',
    'پیشنهادها',
    'دریافت، بررسی و مقایسه پیشنهادها.',
  ),
  featurePageRoute(
    'orders',
    'سفارش‌ها',
    'مدیریت سفارش‌های خرید و فروش.',
  ),
  featurePageRoute(
    'order-book',
    'دفتر سفارش',
    'نمایش سفارش‌های معتبر و وضعیت آن‌ها.',
  ),
  featurePageRoute(
    'matching',
    'تطبیق',
    'پیگیری فرایند تطبیق سفارش‌ها.',
  ),
  featurePageRoute(
    'trades',
    'معاملات',
    'مشاهده معاملات و وضعیت آن‌ها.',
  ),
  featurePageRoute(
    'execution',
    'اجرای معامله',
    'پیگیری مراحل اجرای معامله.',
  ),
  featurePageRoute(
    'commodity',
    'بازار کالا',
    'گردش کار عرضه و تقاضای کالا.',
  ),
  featurePageRoute(
    'real-estate',
    'املاک و دارایی‌های واقعی',
    'گردش کار دارایی‌های واقعی و موقعیت‌های مرتبط.',
  ),
  featurePageRoute(
    'regulatory',
    'اتصال‌های قانونی و نظارتی',
    'پیگیری ارتباطات قانونی و نتایج استعلام‌ها.',
  ),
  featurePageRoute(
    'audit',
    'ممیزی بازار',
    'تاریخچه و ردگیری رویدادهای بازار.',
  ),
];