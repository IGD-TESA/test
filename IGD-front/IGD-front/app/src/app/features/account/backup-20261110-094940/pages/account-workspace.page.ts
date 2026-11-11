import {
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';

import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { AccountDemoStore } from '../services/account-demo.store';
import {
  AccountNotice,
  AccountProfile,
  AccountLegalEntity,
  AccountSection,
} from '../models/account.models';

@Component({
  selector: 'igd-account-workspace',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './account-workspace.page.html',
  styleUrl: './account-workspace.page.css',
})
export class AccountWorkspacePage {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);

  readonly store = inject(AccountDemoStore);

  readonly section = this.route.snapshot.data['section'] as AccountSection;

  readonly notice = signal<AccountNotice | null>(null);
  readonly selectedVerificationType = signal('identity');

  readonly profileCompletion = computed(() => {
    const p = this.store.profile();
    const fields = [
      p.firstName,
      p.lastName,
      p.nationalId,
      p.birthDate,
      p.fatherName,
      p.address,
      p.postalCode,
    ];
    const complete = fields.filter(value => value.trim().length > 0).length;
    return Math.round((complete / fields.length) * 100);
  });

  readonly navigation = [
    { path: '', label: 'نمای کلی', icon: 'dashboard' },
    { path: 'profile', label: 'اطلاعات شخصی', icon: 'person' },
    { path: 'legal-entity', label: 'اطلاعات حقوقی', icon: 'domain' },
    { path: 'contacts', label: 'راه‌های ارتباطی', icon: 'contact_phone' },
    { path: 'verification', label: 'احراز هویت', icon: 'verified_user' },
    { path: 'security', label: 'امنیت حساب', icon: 'shield_lock' },
    { path: 'devices', label: 'دستگاه‌ها', icon: 'devices' },
    { path: 'sessions', label: 'نشست‌ها', icon: 'history' },
    { path: 'permissions', label: 'مجوزها', icon: 'admin_panel_settings' },
  ];

  readonly pageTitles: Record<AccountSection, string> = {
    overview: 'حساب من',
    profile: 'اطلاعات شخصی',
    'legal-entity': 'اطلاعات حقوقی',
    contacts: 'راه‌های ارتباطی',
    verification: 'احراز هویت',
    security: 'امنیت حساب',
    devices: 'دستگاه‌های متصل',
    sessions: 'نشست‌های کاربری',
    permissions: 'مجوزهای دسترسی',
    login: 'ورود به حساب',
    register: 'ایجاد حساب کاربری',
    'recover-password': 'بازیابی رمز عبور',
  };

  readonly pageDescriptions: Record<AccountSection, string> = {
    overview: 'نمای کلی وضعیت و اطلاعات حساب کاربری',
    profile: 'مشاهده و تکمیل مشخصات هویتی و فردی',
    'legal-entity': 'اطلاعات ثبتی و مشخصات شخصیت حقوقی',
    contacts: 'مدیریت شماره تلفن و نشانی‌های ایمیل',
    verification: 'مدارک و وضعیت فرایندهای احراز هویت',
    security: 'تنظیمات امنیتی و تغییر رمز عبور',
    devices: 'دستگاه‌های ثبت‌شده و مورد اعتماد',
    sessions: 'نشست‌ها و ورودهای فعال حساب',
    permissions: 'نقش‌ها و مجوزهای دسترسی',
    login: 'ورود به حساب کاربری',
    register: 'ثبت اطلاعات اولیه حساب',
    'recover-password': 'درخواست بازیابی دسترسی به حساب',
  };

  readonly profileForm = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    nationalId: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    birthDate: [''],
    fatherName: [''],
    address: [''],
    postalCode: ['', Validators.pattern(/^[0-9]{10}$/)],
  });

  readonly legalForm = this.fb.nonNullable.group({
    legalName: ['', Validators.required],
    nationalId: ['', [Validators.required, Validators.pattern(/^[0-9]{11}$/)]],
    registrationNumber: [''],
    economicCode: [''],
    legalType: ['company', Validators.required],
    registrationDate: [''],
  });

  readonly phoneForm = this.fb.nonNullable.group({
    phone: ['', [
      Validators.required,
      Validators.pattern(/^(?:\+98|0)?9[0-9]{9}$/),
    ]],
  });

  readonly emailForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  readonly securityForm = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  });

  readonly loginForm = this.fb.nonNullable.group({
    identifier: ['', Validators.required],
    password: ['', Validators.required],
    remember: [true],
  });

  readonly registerForm = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    nationalId: ['', [
      Validators.required,
      Validators.pattern(/^[0-9]{10}$/),
    ]],
    phone: ['', [
      Validators.required,
      Validators.pattern(/^(?:\+98|0)?9[0-9]{9}$/),
    ]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    accepted: [false, Validators.requiredTrue],
  });

  readonly recoveryForm = this.fb.nonNullable.group({
    identifier: ['', Validators.required],
  });

  readonly profile = this.store.profile;
  readonly legalEntity = this.store.legalEntity;

  constructor() {
    this.profileForm.patchValue(this.store.profile());
    this.legalForm.patchValue(this.store.legalEntity());
  }

  get title(): string {
    return this.pageTitles[this.section] ?? 'حساب من';
  }

  get description(): string {
    return this.pageDescriptions[this.section] ?? '';
  }

  showNotice(
    type: AccountNotice['type'],
    message: string,
  ): void {
    this.notice.set({ type, message });
  }

  clearNotice(): void {
    this.notice.set(null);
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.showNotice('error', 'لطفاً فیلدهای ضروری را با مقادیر معتبر تکمیل کن.');
      return;
    }

    this.store.updateProfile(
      this.profileForm.getRawValue() as AccountProfile,
    );

    this.showNotice(
      'success',
      'تغییرات در پیش‌نمایش محلی ثبت شد؛ ذخیره در حساب اصلی پس از اتصال به سرور انجام می‌شود.',
    );
  }

  saveLegalEntity(): void {
    if (this.legalForm.invalid) {
      this.legalForm.markAllAsTouched();
      this.showNotice('error', 'اطلاعات ضروری شخصیت حقوقی را بررسی کن.');
      return;
    }

    this.store.updateLegalEntity(
      this.legalForm.getRawValue() as AccountLegalEntity,
    );

    this.showNotice(
      'success',
      'اطلاعات در پیش‌نمایش محلی ثبت شد؛ ثبت رسمی نیازمند اتصال به سرور است.',
    );
  }

  addPhone(): void {
    if (this.phoneForm.invalid) {
      this.phoneForm.markAllAsTouched();
      this.showNotice('error', 'شماره تلفن معتبر وارد کن.');
      return;
    }

    this.store.addPhone(this.phoneForm.controls.phone.value);
    this.phoneForm.reset({ phone: '' });

    this.showNotice('success', 'شماره تلفن به فهرست آزمایشی اضافه شد.');
  }

  addEmail(): void {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      this.showNotice('error', 'نشانی ایمیل معتبر وارد کن.');
      return;
    }

    this.store.addEmail(this.emailForm.controls.email.value);
    this.emailForm.reset({ email: '' });

    this.showNotice('success', 'ایمیل به فهرست آزمایشی اضافه شد.');
  }

  chooseVerificationType(value: string): void {
    this.selectedVerificationType.set(value);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type)) {
      this.showNotice('error', 'فقط فایل PDF یا تصویر JPG، PNG و WEBP مجاز است.');
      input.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      this.showNotice('error', 'حجم فایل نباید بیشتر از ۱۰ مگابایت باشد.');
      input.value = '';
      return;
    }

    this.store.addDocument(
      this.selectedVerificationType(),
      file.name,
    );

    this.showNotice(
      'info',
      'نام فایل در پیش‌نمایش ثبت شد. فایل هنوز به هیچ سروری ارسال نشده است.',
    );

    input.value = '';
  }

  removeDocument(id: string): void {
    this.store.removeDocument(id);
    this.showNotice('success', 'فایل از فهرست محلی حذف شد.');
  }

  submitPasswordChange(): void {
    if (this.securityForm.invalid) {
      this.securityForm.markAllAsTouched();
      this.showNotice('error', 'اطلاعات رمز عبور را کامل و معتبر وارد کن.');
      return;
    }

    const value = this.securityForm.getRawValue();

    if (value.newPassword !== value.confirmPassword) {
      this.showNotice('error', 'رمز عبور جدید و تکرار آن یکسان نیستند.');
      return;
    }

    this.securityForm.reset({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });

    this.showNotice(
      'info',
      'فرم تغییر رمز معتبر است؛ تغییر واقعی رمز پس از اتصال به سرویس احراز هویت انجام می‌شود.',
    );
  }

  submitLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.showNotice('error', 'شناسه ورود و رمز عبور را وارد کن.');
      return;
    }

    this.showNotice(
      'info',
      'فرم ورود آماده ارسال است؛ احراز هویت واقعی هنوز به سرور متصل نیست.',
    );
  }

  submitRegistration(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.showNotice('error', 'اطلاعات ثبت‌نام یا پذیرش شرایط کامل نیست.');
      return;
    }

    this.showNotice(
      'info',
      'اطلاعات ثبت‌نام از نظر فرانت‌اند معتبر است؛ ایجاد حساب پس از اتصال API انجام می‌شود.',
    );
  }

  submitRecovery(): void {
    if (this.recoveryForm.invalid) {
      this.recoveryForm.markAllAsTouched();
      this.showNotice('error', 'شماره تلفن یا ایمیل را وارد کن.');
      return;
    }

    this.showNotice(
      'info',
      'درخواست بازیابی آماده ارسال است؛ ارسال پیامک یا ایمیل پس از اتصال سرور انجام می‌شود.',
    );
  }

  revokeDevice(id: string): void {
    this.store.revokeDevice(id);
    this.showNotice(
      'info',
      'وضعیت دستگاه در پیش‌نمایش محلی تغییر کرد؛ ابطال واقعی نیازمند API است.',
    );
  }

  endSession(id: string): void {
    this.store.endSession(id);
    this.showNotice(
      'info',
      'وضعیت نشست در پیش‌نمایش محلی تغییر کرد؛ نشست واقعی هنوز خاتمه نیافته است.',
    );
  }

  endOtherSessions(): void {
    this.store.endOtherSessions();
    this.showNotice(
      'info',
      'نشست‌های غیرجاری در پیش‌نمایش محلی غیرفعال شدند.',
    );
  }

  setPrimaryPhone(id: string): void {
    this.store.setPrimaryPhone(id);
    this.showNotice('success', 'شماره اصلی در پیش‌نمایش تغییر کرد.');
  }

  setPrimaryEmail(id: string): void {
    this.store.setPrimaryEmail(id);
    this.showNotice('success', 'ایمیل اصلی در پیش‌نمایش تغییر کرد.');
  }

  removePhone(id: string): void {
    this.store.removePhone(id);
    this.showNotice('success', 'شماره از فهرست محلی حذف شد.');
  }

  removeEmail(id: string): void {
    this.store.removeEmail(id);
    this.showNotice('success', 'ایمیل از فهرست محلی حذف شد.');
  }
}