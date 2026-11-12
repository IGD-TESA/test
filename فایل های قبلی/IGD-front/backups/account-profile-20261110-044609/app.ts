import { Component } from '@angular/core';

type WorkspaceItem = {
  id: string;
  label: string;
  icon: string;
};

type NavigationSection = {
  id: string;
  label: string;
  icon: string;
  items: WorkspaceItem[];
};

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  sidebarCollapsed = false;
  activeSectionId = 'overview';
  activeItemId = 'summary';

  readonly sections: NavigationSection[] = [
    {
      id: 'overview',
      label: 'نمای کلی',
      icon: 'space_dashboard',
      items: [
        { id: 'summary', label: 'نمای کلی', icon: 'dashboard' },
        { id: 'shortcuts', label: 'دسترسی‌ها', icon: 'apps' },
      ],
    },
    {
      id: 'market',
      label: 'بازار کلی',
      icon: 'storefront',
      items: [
        { id: 'catalogue', label: 'کاتالوگ بازار', icon: 'category' },
        { id: 'markets', label: 'بازارها', icon: 'store' },
        { id: 'offers', label: 'عرضه‌ها', icon: 'inventory_2' },
        { id: 'offer-requests', label: 'درخواست‌های عرضه', icon: 'request_quote' },
        { id: 'proposals', label: 'پیشنهادها', icon: 'handshake' },
        { id: 'orders', label: 'سفارش‌ها', icon: 'receipt_long' },
        { id: 'order-book', label: 'دفتر سفارش', icon: 'book' },
        { id: 'matching', label: 'تطبیق', icon: 'compare_arrows' },
        { id: 'trades', label: 'معاملات', icon: 'swap_horiz' },
        { id: 'execution', label: 'اجرای معامله', icon: 'task_alt' },
        { id: 'commodity', label: 'بازار کالا', icon: 'inventory' },
        { id: 'real-estate', label: 'املاک و دارایی‌ها', icon: 'domain' },
        { id: 'regulatory', label: 'امور قانونی و نظارتی', icon: 'gavel' },
        { id: 'audit', label: 'ممیزی بازار', icon: 'fact_check' },
      ],
    },
    {
      id: 'assets',
      label: 'دارایی‌های من',
      icon: 'account_balance_wallet',
      items: [
        { id: 'assets-summary', label: 'نمای کلی دارایی‌ها', icon: 'wallet' },
        { id: 'holdings', label: 'دارایی‌ها', icon: 'inventory' },
        { id: 'positions', label: 'موقعیت‌ها', icon: 'layers' },
        { id: 'reservations', label: 'رزروها', icon: 'lock_clock' },
        { id: 'purchasing-power', label: 'توان خرید', icon: 'account_balance' },
      ],
    },
    {
      id: 'contracts',
      label: 'قراردادها',
      icon: 'description',
      items: [
        { id: 'contracts-summary', label: 'نمای کلی قراردادها', icon: 'article' },
      ],
    },
    {
      id: 'services',
      label: 'خدمات',
      icon: 'handyman',
      items: [
        { id: 'services-summary', label: 'نمای کلی خدمات', icon: 'design_services' },
        { id: 'transport', label: 'حمل‌ونقل', icon: 'local_shipping' },
        { id: 'storage', label: 'انبارداری', icon: 'warehouse' },
        { id: 'insurance', label: 'بیمه', icon: 'shield' },
        { id: 'inspection', label: 'بازرسی', icon: 'fact_check' },
        { id: 'installation', label: 'نصب', icon: 'build' },
        { id: 'delivery', label: 'تحویل', icon: 'inventory' },
      ],
    },
    {
      id: 'settlement',
      label: 'تسویه',
      icon: 'payments',
      items: [
        { id: 'settlement-summary', label: 'نمای کلی تسویه', icon: 'account_balance' },
        { id: 'settlement-status', label: 'وضعیت تسویه', icon: 'pending_actions' },
        { id: 'settlement-history', label: 'تاریخچه تسویه', icon: 'history' },
      ],
    },
    {
      id: 'history',
      label: 'سوابق',
      icon: 'history',
      items: [
        { id: 'activity', label: 'سوابق فعالیت', icon: 'manage_history' },
        { id: 'events', label: 'رویدادها', icon: 'event_note' },
      ],
    },
    {
      id: 'account',
      label: 'حساب من',
      icon: 'account_circle',
      items: [
        { id: 'account-summary', label: 'نمای کلی حساب', icon: 'person' },
      ],
    },
  ];

  get activeSection(): NavigationSection {
    return this.sections.find(
      (section) => section.id === this.activeSectionId,
    ) ?? this.sections[0];
  }

  get activeItem(): WorkspaceItem {
    return this.activeSection.items.find(
      (item) => item.id === this.activeItemId,
    ) ?? this.activeSection.items[0];
  }

  selectSection(sectionId: string): void {
    this.activeSectionId = sectionId;
    this.activeItemId = this.activeSection.items[0]?.id ?? '';
  }

  selectItem(itemId: string): void {
    this.activeItemId = itemId;
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}