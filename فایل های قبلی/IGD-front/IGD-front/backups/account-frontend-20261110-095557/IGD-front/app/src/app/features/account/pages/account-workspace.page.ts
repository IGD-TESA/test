import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';

interface AccountDevice {
  id: number;
  name: string;
  type: string;
  browser: string;
  location: string;
  lastSeen: string;
  current: boolean;
}

@Component({
  selector: 'igd-account-workspace',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './account-workspace.page.html',
  styleUrl: './account-workspace.page.css',
})
export class AccountWorkspacePage {
  private readonly route = inject(ActivatedRoute);

  readonly section = signal('overview');

  readonly sectionInfo: Record<string, { title: string; description: string }> = {
    overview: { title: 'نمای کلی حساب', description: 'مدیریت یکپارچه اطلاعات و تنظیمات حساب کاربری' },
    profile: { title: 'اطلاعات شخصی', description: 'اطلاعات هویتی و مشخصات پایه حساب' },
    'legal-entity': { title: 'اطلاعات حقوقی', description: 'مشخصات اشخاص حقوقی و شرکت‌ها' },
    contacts: { title: 'راه‌های ارتباطی', description: 'شماره تماس و نشانی‌های الکترونیکی' },
    verification: { title: 'احراز هویت', description: 'مدارک و وضعیت مراحل احراز هویت' },
    security: { title: 'امنیت حساب', description: 'مدیریت رمز عبور و تنظیمات امنیتی' },
    devices: { title: 'دستگاه‌های من', description: 'دستگاه‌هایی که برای ورود به حساب استفاده شده‌اند' },
    sessions: { title: 'نشست‌های فعال', description: 'مدیریت نشست‌های کاربری' },
    permissions: { title: 'نقش و دسترسی‌ها', description: 'مشاهده نقش‌ها و سطح دسترسی حساب' },
    login: { title: 'ورود', description: 'ورود به حساب کاربری' },
    register: { title: 'ثبت‌نام', description: 'ایجاد حساب کاربری جدید' },
    'recover-password': { title: 'بازیابی رمز عبور', description: 'بازیابی دسترسی به حساب' },
  };

  readonly currentInfo = computed(
    () => this.sectionInfo[this.section()] ?? this.sectionInfo['overview'],
  );

  readonly notice = signal('');

  readonly devices = signal<AccountDevice[]>([
    {
      id: 1,
      name: 'رایانه شخصی نمونه',
      type: 'desktop_windows',
      browser: 'مرورگر نمونه',
      location: 'مکان نامشخص',
      lastSeen: 'آخرین فعالیت: نمونه',
      current: true,
    },
    {
      id: 2,
      name: 'تلفن همراه نمونه',
      type: 'smartphone',
      browser: 'مرورگر تلفن همراه',
      location: 'مکان نامشخص',
      lastSeen: 'آخرین فعالیت: نمونه',
      current: false,
    },
  ]);

  constructor() {
    this.route.data.subscribe((data) => {
      this.section.set(String(data['section'] ?? 'overview'));
      this.notice.set('');
    });
  }

  removeDevice(id: number): void {
    const device = this.devices().find((item) => item.id === id);

    if (!device) return;

    this.devices.update((items) => items.filter((item) => item.id !== id));
    this.notice.set('دستگاه از فهرست نمایشی این صفحه حذف شد. این تغییر هنوز به سرور ارسال نشده است.');
  }

  showLocalNotice(message: string): void {
    this.notice.set(message);
  }

  readonly navigation = [
    { path: '/account', label: 'نمای کلی', icon: 'dashboard', exact: true },
    { path: '/account/profile', label: 'اطلاعات شخصی', icon: 'person' },
    { path: '/account/legal-entity', label: 'اطلاعات حقوقی', icon: 'domain' },
    { path: '/account/contacts', label: 'راه‌های ارتباطی', icon: 'contact_phone' },
    { path: '/account/verification', label: 'احراز هویت', icon: 'verified_user' },
    { path: '/account/security', label: 'امنیت حساب', icon: 'shield_lock' },
    { path: '/account/devices', label: 'دستگاه‌ها', icon: 'devices' },
    { path: '/account/sessions', label: 'نشست‌های فعال', icon: 'history' },
    { path: '/account/permissions', label: 'نقش و دسترسی‌ها', icon: 'admin_panel_settings' },
  ];
}