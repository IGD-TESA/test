import { Component, HostListener, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';

import { AccountApiService } from './features/account/services/account-api.service';

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

type AccountMenuItem = {
  id: string;
  label: string;
  icon: string;
  danger?: boolean;
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly accountApi = inject(AccountApiService);

  logoutInProgress = false;
  logoutError = '';
  accountPanelOpen = false;
  accountPanelTitle = 'حساب من';
  sidebarCollapsed = false;
  accountMenuOpen = false;
  activeSectionId = 'overview';
  activeItemId = 'summary';

  readonly accountUserName = 'سیدعلی میرجعفری';

  readonly accountMenuGroups: { title: string; items: AccountMenuItem[] }[] = [
    {
      title: 'حساب کاربری',
      items: [
        { id: 'my-account', label: 'حساب من', icon: 'account_circle' },
        { id: 'personal-info', label: 'اطلاعات شخصی', icon: 'person' },
        { id: 'account-info', label: 'اطلاعات حساب', icon: 'badge' },
      ],
    },
    {
      title: 'امنیت و دسترسی',
      items: [
        { id: 'security', label: 'امنیت و تغییر گذرواژه', icon: 'lock' },
        { id: 'devices', label: 'دستگاه‌های فعال', icon: 'devices' },
        { id: 'sessions', label: 'نشست‌های فعال', icon: 'laptop' },
      ],
    },
    {
      title: 'مدیریت حساب',
      items: [
        { id: 'agreements', label: 'قراردادها و توافق‌نامه‌ها', icon: 'contract' },
        { id: 'logout', label: 'خروج از حساب', icon: 'logout', danger: true },
      ],
    },
  ];

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
  ];

  get activeSection(): NavigationSection {
    return this.sections.find(
      section => section.id === this.activeSectionId,
    ) ?? this.sections[0];
  }

  get activeItem(): WorkspaceItem {
    return this.activeSection.items.find(
      item => item.id === this.activeItemId,
    ) ?? this.activeSection.items[0];
  }

  selectSection(sectionId: string): void {
    this.activeSectionId = sectionId;
    this.activeItemId = this.activeSection.items[0]?.id ?? '';
    this.accountMenuOpen = false;
  }

  selectItem(itemId: string): void {
    this.activeItemId = itemId;
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    this.accountMenuOpen = false;
  }

  toggleAccountMenu(): void {
    this.accountMenuOpen = !this.accountMenuOpen;
  }

  closeAccountMenu(): void {
    this.accountMenuOpen = false;
  }
  navigateAccountMenuItem(itemId: string): void {
    const destinations: Record<string, string[]> = {
      'my-account': [],
      'personal-info': ['profile'],
      'account-info': ['profile'],
      'security': ['security'],
      'devices': ['devices'],
      'sessions': ['sessions'],
      'agreements': ['agreements'],
    };

    if (itemId === 'logout') {
      this.logout();
      return;
    }

    const destination = destinations[itemId];

    if (!destination) {
      return;
    }

    const labels: Record<string, string> = {
      'my-account': 'حساب من',
      'personal-info': 'اطلاعات شخصی',
      'account-info': 'اطلاعات حساب',
      'security': 'امنیت و تغییر گذرواژه',
      'devices': 'دستگاه‌های فعال',
      'sessions': 'نشست‌های فعال',
      'agreements': 'قراردادها و توافق‌نامه‌ها',
    };

    this.accountPanelTitle = labels[itemId] ?? 'حساب کاربری';
    this.accountMenuOpen = false;
    this.logoutError = '';
    this.accountPanelOpen = true;

    void this.router.navigate(
      [{ outlets: { accountPanel: ['account', ...destination] } }],
      { relativeTo: this.route.root }
    );
  }

  closeAccountPanel(): void {
    if (!this.accountPanelOpen) {
      return;
    }

    this.accountPanelOpen = false;

    void this.router.navigate(
      [{ outlets: { accountPanel: null } }],
      { relativeTo: this.route.root }
    );
  }

  @HostListener('document:keydown.escape')
  onAccountPanelEscape(): void {
    this.closeAccountPanel();
  }

  logout(): void {
    if (this.logoutInProgress) {
      return;
    }

    this.logoutInProgress = true;
    this.logoutError = '';
  accountPanelOpen = false;
  accountPanelTitle = 'حساب من';

    this.accountApi.logout().subscribe({
      next: () => {
        this.logoutInProgress = false;
        this.accountMenuOpen = false;
        this.accountPanelOpen = true;
        this.accountPanelTitle = 'ورود به حساب';
        void this.router.navigate([{ outlets: { accountPanel: ['account', 'login'] } }], { relativeTo: this.route.root });
      },
      error: () => {
        this.logoutInProgress = false;
        this.logoutError =
          'خروج از حساب انجام نشد. ارتباط با سرور یا اعتبار نشست را بررسی کنید.';
      },
    });
  }
}