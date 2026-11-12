import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';
import { Subscription } from 'rxjs';

interface AccountNavigationItem {
  title: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'igd-account-workspace',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  template: `
    <main class="account-page" dir="rtl">

      <header class="page-header">
        <div>
          <div class="eyebrow">IGD / حساب کاربری</div>
          <h1>{{ title }}</h1>
          <p>{{ description }}</p>
        </div>

        <a class="back-link" routerLink="/account">
          <span class="material-symbols-outlined">arrow_forward</span>
          نمای کلی حساب
        </a>
      </header>

      <div class="account-layout">

        <aside class="account-navigation">
          <div class="navigation-heading">مدیریت حساب</div>

          <a
            *ngFor="let item of navigation"
            class="navigation-item"
            [routerLink]="item.path"
            [class.active]="section === item.path.split('/').pop() || (section === 'overview' && item.path === '/account')"
          >
            <span class="material-symbols-outlined">{{ item.icon }}</span>
            <span>{{ item.title }}</span>
          </a>
        </aside>

        <section class="account-content">

          <!-- OVERVIEW -->
          <ng-container *ngIf="section === 'overview'">
            <div class="welcome-panel">
              <div>
                <span class="eyebrow">فضای شخصی شما</span>
                <h2>مدیریت حساب کاربری</h2>
                <p>
                  اطلاعات هویتی، امنیت و راه‌های ارتباطی حساب خود را
                  از این بخش مدیریت کنید.
                </p>
              </div>
              <span class="material-symbols-outlined welcome-icon">account_circle</span>
            </div>

            <div class="overview-grid">
              <a class="overview-card" routerLink="/account/profile">
                <span class="material-symbols-outlined">person</span>
                <strong>اطلاعات حساب</strong>
                <small>مشاهده و تکمیل مشخصات پایه</small>
                <span class="card-arrow">←</span>
              </a>

              <a class="overview-card" routerLink="/account/verification">
                <span class="material-symbols-outlined">verified_user</span>
                <strong>احراز هویت</strong>
                <small>وضعیت و پیگیری درخواست‌ها</small>
                <span class="card-arrow">←</span>
              </a>

              <a class="overview-card" routerLink="/account/security">
                <span class="material-symbols-outlined">shield</span>
                <strong>امنیت حساب</strong>
                <small>تنظیمات امنیتی و رمز عبور</small>
                <span class="card-arrow">←</span>
              </a>

              <a class="overview-card" routerLink="/account/devices">
                <span class="material-symbols-outlined">devices</span>
                <strong>دستگاه‌ها</strong>
                <small>مدیریت دستگاه‌های متصل</small>
                <span class="card-arrow">←</span>
              </a>

              <a class="overview-card" routerLink="/account/contacts">
                <span class="material-symbols-outlined">contact_mail</span>
                <strong>راه‌های ارتباطی</strong>
                <small>تلفن و نشانی ایمیل</small>
                <span class="card-arrow">←</span>
              </a>

              <a class="overview-card" routerLink="/account/permissions">
                <span class="material-symbols-outlined">admin_panel_settings</span>
                <strong>دسترسی‌ها</strong>
                <small>مشاهده مجوزهای حساب</small>
                <span class="card-arrow">←</span>
              </a>
            </div>
          </ng-container>

          <!-- PROFILE -->
          <ng-container *ngIf="section === 'profile'">
            <div class="section-card">
              <h2>اطلاعات پایه</h2>
              <p class="muted">
                این فرم در حال حاضر محلی است و هنوز به API متصل نشده است.
              </p>

              <div class="form-grid">
                <label>
                  نام
                  <input [(ngModel)]="profile.firstName" name="firstName">
                </label>

                <label>
                  نام خانوادگی
                  <input [(ngModel)]="profile.lastName" name="lastName">
                </label>

                <label>
                  کد ملی
                  <input [(ngModel)]="profile.nationalCode" name="nationalCode" maxlength="10">
                </label>

                <label>
                  تاریخ تولد
                  <input type="text" [(ngModel)]="profile.birthDate" name="birthDate" placeholder="مثلاً ۱۳۷۰/۰۱/۰۱">
                </label>
              </div>

              <button class="primary-button" (click)="showLocalNotice()">
                ذخیره تغییرات
              </button>
              <p class="notice" *ngIf="notice">{{ notice }}</p>
            </div>
          </ng-container>

          <!-- LEGAL ENTITY -->
          <ng-container *ngIf="section === 'legal-entity'">
            <div class="section-card">
              <h2>مشخصات شخصیت حقوقی</h2>
              <p class="muted">
                اطلاعات شرکت یا سازمان را تکمیل کنید.
              </p>

              <div class="form-grid">
                <label>
                  نام شخصیت حقوقی
                  <input [(ngModel)]="legal.name" name="legalName">
                </label>

                <label>
                  شناسه ملی
                  <input [(ngModel)]="legal.nationalId" name="legalId">
                </label>

                <label>
                  شماره ثبت
                  <input [(ngModel)]="legal.registrationNumber" name="registrationNumber">
                </label>

                <label>
                  سمت نماینده
                  <input [(ngModel)]="legal.representativeRole" name="representativeRole">
                </label>
              </div>

              <button class="primary-button" (click)="showLocalNotice()">
                ذخیره اطلاعات
              </button>
              <p class="notice" *ngIf="notice">{{ notice }}</p>
            </div>
          </ng-container>

          <!-- CONTACTS -->
          <ng-container *ngIf="section === 'contacts'">
            <div class="section-card">
              <h2>راه‌های ارتباطی</h2>

              <div class="form-grid">
                <label>
                  شماره تلفن همراه
                  <input [(ngModel)]="contacts.phone" name="phone">
                </label>

                <label>
                  نشانی ایمیل
                  <input type="email" [(ngModel)]="contacts.email" name="email">
                </label>
              </div>

              <div class="info-strip">
                تغییر شماره تلفن و ایمیل ممکن است نیازمند تأیید هویت باشد.
              </div>

              <button class="primary-button" (click)="showLocalNotice()">
                ثبت تغییرات
              </button>
              <p class="notice" *ngIf="notice">{{ notice }}</p>
            </div>
          </ng-container>

          <!-- VERIFICATION -->
          <ng-container *ngIf="section === 'verification'">
            <div class="section-card">
              <h2>وضعیت احراز هویت</h2>

              <div class="status-row">
                <span class="status-dot"></span>
                <div>
                  <strong>وضعیت از سرور دریافت نشده است</strong>
                  <p class="muted">
                    برای مشاهده وضعیت واقعی، اتصال سرویس احراز هویت باید برقرار شود.
                  </p>
                </div>
              </div>

              <div class="info-strip">
                درخواست آزمایشی یا نتیجه ساختگی در این صفحه ثبت نمی‌شود.
                پس از اتصال API، امکان ثبت و پیگیری درخواست فعال خواهد شد.
              </div>
            </div>
          </ng-container>

          <!-- SECURITY -->
          <ng-container *ngIf="section === 'security'">
            <div class="section-card">
              <h2>امنیت حساب</h2>

              <div class="security-option">
                <div>
                  <strong>تغییر رمز عبور</strong>
                  <p class="muted">تغییر رمز از طریق سرویس احراز هویت انجام می‌شود.</p>
                </div>
                <a routerLink="/account/recover-password" class="secondary-button">
                  بازیابی رمز
                </a>
              </div>

              <div class="security-option">
                <div>
                  <strong>دستگاه‌های متصل</strong>
                  <p class="muted">مشاهده و مدیریت دستگاه‌های حساب</p>
                </div>
                <a routerLink="/account/devices" class="secondary-button">
                  مشاهده دستگاه‌ها
                </a>
              </div>
            </div>
          </ng-container>

          <!-- DEVICES -->
          <ng-container *ngIf="section === 'devices'">
            <div class="section-card">
              <h2>دستگاه‌های متصل</h2>

              <div class="info-strip">
                فهرست واقعی دستگاه‌ها پس از اتصال API نمایش داده می‌شود.
                اطلاعات زیر نمونه نمایشی است.
              </div>

              <div class="device-row" *ngFor="let device of demoDevices">
                <span class="material-symbols-outlined device-icon">
                  {{ device.icon }}
                </span>
                <div class="device-details">
                  <strong>{{ device.name }}</strong>
                  <small>{{ device.detail }}</small>
                  <small>{{ device.status }}</small>
                </div>
                <span class="sample-label">نمونه</span>
              </div>

              <button class="secondary-button" (click)="showLocalNotice()">
                مدیریت دستگاه‌ها پس از اتصال سرویس فعال می‌شود
              </button>
              <p class="notice" *ngIf="notice">{{ notice }}</p>
            </div>
          </ng-container>

          <!-- SESSIONS -->
          <ng-container *ngIf="section === 'sessions'">
            <div class="section-card">
              <h2>نشست‌های حساب</h2>
              <div class="empty-state">
                <span class="material-symbols-outlined">history</span>
                <strong>اطلاعات نشست‌ها هنوز دریافت نشده است</strong>
                <p>
                  برای نمایش نشست‌های فعال، قرارداد API مربوط به نشست‌ها
                  باید در بک‌اند مشخص و متصل شود.
                </p>
              </div>
            </div>
          </ng-container>

          <!-- PERMISSIONS -->
          <ng-container *ngIf="section === 'permissions'">
            <div class="section-card">
              <h2>دسترسی‌ها و مجوزها</h2>
              <div class="info-strip">
                مرجع نهایی مجوزها سرویس احراز هویت و مجوزدهی بک‌اند است.
                در این صفحه هیچ مجوزی به‌صورت محلی اعطا نمی‌شود.
              </div>
              <div class="empty-state">
                <span class="material-symbols-outlined">admin_panel_settings</span>
                <strong>مجوزها هنوز از سرور دریافت نشده‌اند</strong>
                <p>پس از اتصال API، فهرست مجوزهای معتبر نمایش داده می‌شود.</p>
              </div>
            </div>
          </ng-container>

          <!-- LOGIN -->
          <ng-container *ngIf="section === 'login'">
            <div class="section-card narrow-card">
              <h2>ورود به حساب</h2>
              <label>
                کد ملی یا شناسه کاربری
                <input [(ngModel)]="login.identifier" name="loginIdentifier">
              </label>
              <label>
                رمز عبور
                <input type="password" [(ngModel)]="login.password" name="loginPassword">
              </label>
              <button class="primary-button" (click)="showApiNotice()">
                ورود
              </button>
              <a routerLink="/account/recover-password">بازیابی رمز عبور</a>
              <p class="notice" *ngIf="notice">{{ notice }}</p>
            </div>
          </ng-container>

          <!-- REGISTER -->
          <ng-container *ngIf="section === 'register'">
            <div class="section-card narrow-card">
              <h2>ایجاد حساب کاربری</h2>
              <label>
                کد ملی
                <input [(ngModel)]="register.nationalCode" name="registerNationalCode" maxlength="10">
              </label>
              <label>
                شماره تلفن همراه
                <input [(ngModel)]="register.phone" name="registerPhone">
              </label>
              <label>
                رمز عبور
                <input type="password" [(ngModel)]="register.password" name="registerPassword">
              </label>
              <button class="primary-button" (click)="showApiNotice()">
                ثبت‌نام
              </button>
              <p class="notice" *ngIf="notice">{{ notice }}</p>
            </div>
          </ng-container>

          <!-- RECOVER PASSWORD -->
          <ng-container *ngIf="section === 'recover-password'">
            <div class="section-card narrow-card">
              <h2>بازیابی رمز عبور</h2>
              <p class="muted">
                برای بازیابی رمز، شناسه حساب را وارد کنید.
              </p>
              <label>
                کد ملی یا شناسه حساب
                <input [(ngModel)]="recovery.identifier" name="recoveryIdentifier">
              </label>
              <button class="primary-button" (click)="showApiNotice()">
                درخواست بازیابی
              </button>
              <p class="notice" *ngIf="notice">{{ notice }}</p>
            </div>
          </ng-container>

        </section>
      </div>
    </main>
  `,
  styles: [`
    :host {
      display: block;
      color: var(--igd-text, #26352b);
      font-family: inherit;
    }

    .account-page {
      width: 100%;
      padding: 26px;
      box-sizing: border-box;
    }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      margin-bottom: 26px;
    }

    .eyebrow {
      display: block;
      color: #77866f;
      font-size: 12px;
      margin-bottom: 8px;
    }

    h1 {
      margin: 0;
      font-size: 25px;
      font-weight: 750;
    }

    .page-header p,
    .muted {
      color: #778178;
      font-size: 13px;
      line-height: 1.9;
    }

    .back-link,
    .secondary-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border: 1px solid #dce4d9;
      border-radius: 10px;
      padding: 10px 14px;
      color: #435c42;
      text-decoration: none;
      background: #fff;
      font-size: 13px;
      cursor: pointer;
    }

    .account-layout {
      display: grid;
      grid-template-columns: 225px minmax(0, 1fr);
      gap: 20px;
      align-items: start;
    }

    .account-navigation,
    .section-card {
      background: #fff;
      border: 1px solid #e7ebe5;
      border-radius: 15px;
      padding: 17px;
    }

    .navigation-heading {
      font-size: 12px;
      color: #899286;
      padding: 4px 9px 13px;
    }

    .navigation-item {
      display: flex;
      align-items: center;
      gap: 11px;
      padding: 11px 10px;
      margin: 3px 0;
      color: #59665b;
      border-radius: 9px;
      text-decoration: none;
      font-size: 13px;
      transition: background .15s ease;
    }

    .navigation-item .material-symbols-outlined {
      font-size: 20px;
    }

    .navigation-item:hover,
    .navigation-item.active {
      color: #315c3d;
      background: #edf3eb;
    }

    .account-content {
      min-width: 0;
    }

    .welcome-panel {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 25px;
      border-radius: 15px;
      background: linear-gradient(120deg, #edf3e9, #f8f5e9);
      margin-bottom: 18px;
    }

    .welcome-panel h2 {
      font-size: 20px;
      margin: 0 0 8px;
    }

    .welcome-panel p {
      color: #68766b;
      font-size: 13px;
      line-height: 1.9;
    }

    .welcome-icon {
      font-size: 65px;
      color: #66805d;
    }

    .overview-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 13px;
    }

    .overview-card {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 9px;
      min-height: 125px;
      padding: 19px;
      background: #fff;
      border: 1px solid #e7ebe5;
      border-radius: 13px;
      color: #34483a;
      text-decoration: none;
      transition: border-color .15s, transform .15s;
    }

    .overview-card:hover {
      border-color: #9caf94;
      transform: translateY(-2px);
    }

    .overview-card > .material-symbols-outlined {
      color: #68805d;
      font-size: 24px;
    }

    .overview-card strong {
      font-size: 14px;
    }

    .overview-card small {
      color: #849084;
      font-size: 12px;
    }

    .card-arrow {
      position: absolute;
      left: 17px;
      bottom: 18px;
      color: #849084;
    }

    .section-card h2 {
      font-size: 17px;
      margin: 0 0 12px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 17px;
      margin: 20px 0;
    }

    label {
      display: flex;
      flex-direction: column;
      gap: 8px;
      color: #526054;
      font-size: 13px;
      margin-bottom: 17px;
    }

    input {
      width: 100%;
      min-height: 42px;
      box-sizing: border-box;
      border: 1px solid #dfe5dd;
      border-radius: 9px;
      padding: 9px 12px;
      outline: none;
      background: #fff;
      color: #29382d;
      font: inherit;
    }

    input:focus {
      border-color: #809b75;
      box-shadow: 0 0 0 3px #809b751c;
    }

    .primary-button {
      border: 0;
      border-radius: 9px;
      padding: 11px 20px;
      color: #fff;
      background: #426b49;
      cursor: pointer;
      font: inherit;
      font-size: 13px;
    }

    .primary-button:hover {
      background: #34583b;
    }

    .notice {
      margin-top: 13px;
      color: #607b52;
      font-size: 12px;
    }

    .info-strip {
      padding: 13px 15px;
      margin: 16px 0;
      border-radius: 9px;
      background: #f5f5ec;
      color: #77734f;
      font-size: 12px;
      line-height: 1.9;
    }

    .status-row,
    .security-option,
    .device-row {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 17px 0;
      border-bottom: 1px solid #edf0eb;
    }

    .status-dot {
      width: 10px;
      height: 10px;
      flex: 0 0 10px;
      border-radius: 50%;
      background: #b8a66b;
    }

    .security-option {
      justify-content: space-between;
    }

    .security-option p {
      margin-bottom: 0;
    }

    .device-icon {
      font-size: 28px;
      color: #6c8565;
    }

    .device-details {
      display: flex;
      flex-direction: column;
      gap: 5px;
      flex: 1;
    }

    .device-details strong {
      font-size: 13px;
    }

    .device-details small {
      color: #879087;
      font-size: 11px;
    }

    .sample-label {
      font-size: 10px;
      color: #8c8156;
      background: #f5f1df;
      padding: 5px 8px;
      border-radius: 6px;
    }

    .empty-state {
      padding: 35px 15px;
      text-align: center;
      color: #748074;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .empty-state .material-symbols-outlined {
      font-size: 40px;
      color: #9aa995;
    }

    .empty-state strong {
      color: #526052;
      font-size: 14px;
    }

    .empty-state p {
      max-width: 470px;
      font-size: 12px;
      line-height: 2;
    }

    .narrow-card {
      max-width: 520px;
    }

    .narrow-card > a {
      display: inline-block;
      margin: 15px 0;
      color: #52754f;
      font-size: 12px;
    }

    @media (max-width: 850px) {
      .account-layout {
        grid-template-columns: 1fr;
      }

      .account-navigation {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 3px;
      }

      .navigation-heading {
        grid-column: 1 / -1;
      }
    }

    @media (max-width: 560px) {
      .account-page {
        padding: 14px;
      }

      .page-header {
        align-items: flex-start;
        flex-direction: column;
      }

      .overview-grid,
      .form-grid {
        grid-template-columns: 1fr;
      }

      .welcome-icon {
        display: none;
      }
    }
  `]
})
export class AccountWorkspacePage implements OnInit, OnDestroy {
  section = 'overview';
  title = 'حساب من';
  description = '';
  notice = '';

  private routeSubscription?: Subscription;

  navigation: AccountNavigationItem[] = [
    { title: 'نمای کلی', path: '/account', icon: 'dashboard' },
    { title: 'اطلاعات حساب', path: '/account/profile', icon: 'person' },
    { title: 'شخصیت حقوقی', path: '/account/legal-entity', icon: 'business' },
    { title: 'راه‌های ارتباطی', path: '/account/contacts', icon: 'contact_mail' },
    { title: 'احراز هویت', path: '/account/verification', icon: 'verified_user' },
    { title: 'امنیت حساب', path: '/account/security', icon: 'shield' },
    { title: 'دستگاه‌ها', path: '/account/devices', icon: 'devices' },
    { title: 'نشست‌ها', path: '/account/sessions', icon: 'history' },
    { title: 'دسترسی‌ها', path: '/account/permissions', icon: 'admin_panel_settings' }
  ];

  profile = {
    firstName: '',
    lastName: '',
    nationalCode: '',
    birthDate: ''
  };

  legal = {
    name: '',
    nationalId: '',
    registrationNumber: '',
    representativeRole: ''
  };

  contacts = {
    phone: '',
    email: ''
  };

  login = {
    identifier: '',
    password: ''
  };

  register = {
    nationalCode: '',
    phone: '',
    password: ''
  };

  recovery = {
    identifier: ''
  };

  demoDevices = [
    {
      name: 'مرورگر فعلی',
      detail: 'دستگاه فعلی کاربر',
      status: 'اطلاعات نمونه؛ تأیید نشده از سرور',
      icon: 'laptop'
    }
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.data.subscribe(data => {
      this.section = data['section'] || 'overview';
      this.title = data['title'] || 'حساب من';
      this.description = data['description'] || '';
      this.notice = '';
    });
  }

  showLocalNotice(): void {
    this.notice = 'این تغییر فعلاً فقط در رابط کاربری است و به سرور ارسال نشده است.';
  }

  showApiNotice(): void {
    this.notice = 'اتصال این عملیات به API هنوز انجام نشده است؛ هیچ درخواست جعلی ارسال نشد.';
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }
}